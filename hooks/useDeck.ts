import { useState, useEffect } from "react";
import { Deck } from "@/lib/types";

export function useDeck() {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDeck() {
      try {
        const response = await fetch("/deck.json");
        if (!response.ok) {
          throw new Error("deck.json not found. Please ensure it exists in the project root.");
        }
        const data = await response.json();
        setDeck(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load deck");
      } finally {
        setLoading(false);
      }
    }

    loadDeck();
  }, []);

  return { deck, setDeck, loading, error };
}
