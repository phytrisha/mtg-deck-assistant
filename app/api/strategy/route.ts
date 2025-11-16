import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CardData } from "@/lib/types";
import { loadPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { deckName, format, mainDeck, sideboard } = body;

    if (!deckName || !format || !mainDeck || !sideboard) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey });

    const formatCardList = (cards: CardData[]) =>
      cards
        .map(
          (c) =>
            `${c.quantity}x ${c.name} (${c.mana_cost || "N/A"}) - ${c.type_line}\n   ${c.oracle_text || "N/A"}`
        )
        .join("\n\n");

    const mainText = formatCardList(mainDeck);
    const sideText = formatCardList(sideboard);

    const promptTemplate = loadPrompt("strategy", { format, deckName });
    const prompt = `${promptTemplate}\n\nMain deck:\n${mainText}\n\nSideboard:\n${sideText}`;

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const text = chunk.delta.text;
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Strategy generation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate strategy",
      },
      { status: 500 }
    );
  }
}
