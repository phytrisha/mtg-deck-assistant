import { DeckBuilder } from "@/components/DeckBuilder";
import { Deck } from "@/lib/types";

interface BuildViewProps {
  deck: Deck | null;
  onSaveDeck: (deck: Deck) => void;
}

export function BuildView({ deck, onSaveDeck }: BuildViewProps) {
  return <DeckBuilder onSaveDeck={onSaveDeck} initialDeck={deck || undefined} />;
}
