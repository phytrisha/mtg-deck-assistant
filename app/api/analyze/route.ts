import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CardData } from "@/lib/types";
import { loadPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { deckName, format, mainDeck, sideboard, step } = body;

    if (!deckName || !format || !mainDeck || !sideboard || !step) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey });

    // Format card list
    const formatCardList = (cards: CardData[]) =>
      cards
        .map(
          (c) =>
            `${c.quantity}x ${c.name} (${c.mana_cost || "N/A"}) - ${c.type_line}\n   ${c.oracle_text || "N/A"}`
        )
        .join("\n\n");

    // Calculate basic stats
    const calculateStats = (cards: CardData[]) => {
      let total = 0,
        lands = 0,
        creatures = 0,
        instSorc = 0,
        totalCMC = 0,
        nonland = 0;

      cards.forEach((card) => {
        total += card.quantity;
        const type = card.type_line.toLowerCase();

        if (type.includes("land")) {
          lands += card.quantity;
        } else {
          nonland += card.quantity;
          let cmc = 0;
          if (card.mana_cost) {
            const nums = card.mana_cost.match(/\{(\d+)\}/g);
            if (nums) nums.forEach((n) => (cmc += parseInt(n.replace(/[{}]/g, ""))));
            const syms = card.mana_cost.match(/\{[WUBRGC]\}/g);
            if (syms) cmc += syms.length;
          }
          totalCMC += cmc * card.quantity;
        }

        if (type.includes("creature")) creatures += card.quantity;
        if (type.includes("instant") || type.includes("sorcery")) instSorc += card.quantity;
      });

      return {
        total,
        lands,
        avgCMC: nonland > 0 ? (totalCMC / nonland).toFixed(2) : "0",
        creatures,
        instSorc,
      };
    };

    const stats = calculateStats(mainDeck);
    const statsText = `\nDECK STATS:\n- Total: ${stats.total} | Lands: ${stats.lands} | Avg CMC: ${stats.avgCMC}\n- Creatures: ${stats.creatures} | Instants/Sorceries: ${stats.instSorc}\n`;
    const mainText = formatCardList(mainDeck);
    const sideText = formatCardList(sideboard);

    // Load prompt and set parameters
    let promptTemplate: string;
    let reasoning: string;
    let maxTokens: number;

    switch (step) {
      case "overview":
        promptTemplate = loadPrompt("overview", { format, deckName });
        reasoning = "Quick deck assessment";
        maxTokens = 1500;
        break;
      case "synergies":
        promptTemplate = loadPrompt("synergies", { format, deckName });
        reasoning = "Mapping interactions";
        maxTokens = 2500;
        break;
      case "mulligan":
        promptTemplate = loadPrompt("mulligan", { format, deckName });
        reasoning = "Mulligan framework";
        maxTokens = 2000;
        break;
      case "matchups":
        promptTemplate = loadPrompt("matchups", { format, deckName });
        reasoning = "Matchup strategies";
        maxTokens = 2500;
        break;
      case "tactics":
        promptTemplate = loadPrompt("tactics", { format, deckName });
        reasoning = "Turn-by-turn tactics";
        maxTokens = 2500;
        break;
      case "sideboarding":
        promptTemplate = loadPrompt("sideboarding", { format, deckName });
        reasoning = "Sideboarding strategy";
        maxTokens = 2500;
        break;
      case "cardAnalysis":
        promptTemplate = loadPrompt("cardAnalysis", { format, deckName });
        reasoning = "Card-by-card analysis";
        maxTokens = 6000;
        break;
      default:
        return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    const prompt = `${promptTemplate}\n${statsText}\nMain Deck:\n${mainText}\n\nSideboard:\n${sideText}`;

    // Stream response
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "reasoning", content: reasoning }) + "\n")
          );

          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(
                encoder.encode(JSON.stringify({ type: "content", content: chunk.delta.text }) + "\n")
              );
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
        "Content-Type": "application/x-ndjson",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
