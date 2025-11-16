import { useState } from "react";
import { CardData, Deck } from "@/lib/types";

interface AnalysisState {
  status: "pending" | "running" | "completed" | "error";
  content: string;
  error?: string;
}

export function useAnalysis(deck: Deck | null, cardData: CardData[] | null) {
  const [overview, setOverview] = useState<AnalysisState>({
    status: "pending",
    content: "",
  });

  const [deepDives, setDeepDives] = useState<Record<string, AnalysisState>>({});

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateOverview = async () => {
    if (!cardData || !deck) return;

    setGenerating(true);
    setError(null);
    setOverview({ status: "running", content: "" });

    try {
      const mainDeckCards = cardData.filter((card) =>
        deck.mainDeck.some((dc) => dc.name === card.name)
      );
      const sideboardCards = cardData.filter((card) =>
        deck.sideboard.some((dc) => dc.name === card.name)
      );

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckName: deck.deckName,
          format: deck.format,
          mainDeck: mainDeckCards,
          sideboard: sideboardCards,
          step: "overview",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate overview");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Response body is not readable");

      let buffer = "";
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: false });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === "content") {
              accumulatedContent += parsed.content;
              // Don't update content while streaming - keep status as running without content
            }
          } catch (e) {
            console.error("Failed to parse line:", line, e);
          }
        }
      }

      // Only set content when fully complete
      setOverview({ status: "completed", content: accumulatedContent });
    } catch (error) {
      console.error("Overview generation error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate overview";
      setOverview({
        status: "error",
        content: "",
        error: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const generateDeepDive = async (analysisType: string) => {
    if (!cardData || !deck) return;

    setDeepDives((prev) => ({
      ...prev,
      [analysisType]: { status: "running", content: "" },
    }));

    try {
      const mainDeckCards = cardData.filter((card) =>
        deck.mainDeck.some((dc) => dc.name === card.name)
      );
      const sideboardCards = cardData.filter((card) =>
        deck.sideboard.some((dc) => dc.name === card.name)
      );

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckName: deck.deckName,
          format: deck.format,
          mainDeck: mainDeckCards,
          sideboard: sideboardCards,
          step: analysisType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${analysisType}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Response body is not readable");

      let buffer = "";
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: false });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === "content") {
              accumulatedContent += parsed.content;
              // Don't update content while streaming - keep status as running without content
            }
          } catch (e) {
            console.error("Failed to parse line:", line, e);
          }
        }
      }

      // Only set content when fully complete
      setDeepDives((prev) => ({
        ...prev,
        [analysisType]: { status: "completed", content: accumulatedContent },
      }));
    } catch (error) {
      console.error(`${analysisType} error:`, error);
      setDeepDives((prev) => ({
        ...prev,
        [analysisType]: {
          status: "error",
          content: "",
          error:
            error instanceof Error
              ? error.message
              : `Failed to generate ${analysisType}`,
        },
      }));
    }
  };

  return {
    overview,
    deepDives,
    generating,
    error,
    generateOverview,
    generateDeepDive,
  };
}
