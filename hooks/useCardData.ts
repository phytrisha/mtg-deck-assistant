import { useState } from "react";
import { CardData, CardFetchError, FetchProgress, Deck } from "@/lib/types";
import { fetchDeckCards } from "@/lib/scryfall";

export function useCardData(deck: Deck | null) {
  const [cardData, setCardData] = useState<CardData[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [progress, setProgress] = useState<FetchProgress | null>(null);
  const [errors, setErrors] = useState<CardFetchError[]>([]);

  const fetchCards = async () => {
    if (!deck) return;

    setFetching(true);
    setProgress(null);
    setErrors([]);

    try {
      const { cards, errors: fetchErrors } = await fetchDeckCards(
        deck.mainDeck,
        deck.sideboard,
        (progress) => setProgress(progress)
      );
      setCardData(cards);
      setErrors(fetchErrors);
    } catch (error) {
      console.error("Failed to fetch cards:", error);
      setErrors([
        {
          cardName: "Unknown",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ]);
    } finally {
      setFetching(false);
      setProgress(null);
    }
  };

  const resetCardData = () => {
    setCardData(null);
    setErrors([]);
    setProgress(null);
  };

  return {
    cardData,
    fetching,
    progress,
    errors,
    fetchCards,
    resetCardData,
  };
}
