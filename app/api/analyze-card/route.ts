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
    const { card, deckContext, format } = body;

    if (!card || !deckContext || !format) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey });

    const promptTemplate = loadPrompt("analyze-card", { cardName: card.name, format });

    const prompt = `${promptTemplate}

CARD:
${card.quantity}x ${card.name} (${card.mana_cost || "N/A"}) - ${card.type_line}
${card.oracle_text || "N/A"}

DECK CONTEXT:
- Format: ${format}
- Total Cards: ${deckContext.totalCards}
- Avg CMC: ${deckContext.averageCMC}
- Archetype: ${deckContext.archetypeHints}

OTHER CARDS:
${deckContext.otherCards}`;

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
          // Stream the analysis
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
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Card analysis error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to analyze card",
      },
      { status: 500 }
    );
  }
}
