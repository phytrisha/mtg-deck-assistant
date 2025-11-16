import { CardData } from "@/lib/types";
import { CardWithDetail } from "@/components/CardWithDetail";
import { Separator } from "@/components/ui/separator";

interface CardGridProps {
  cards: Map<string, CardData[]>;
  deckContext?: {
    format: string;
    totalCards: number;
    averageCMC: number;
    archetypeHints: string;
    otherCards: string;
  };
}

export function CardGrid({ cards, deckContext }: CardGridProps) {
  return (
    <div className="space-y-6">
      {Array.from(cards.entries()).map(([type, typeCards]) => (
        <div key={type}>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            {type} ({typeCards.reduce((sum, card) => sum + card.quantity, 0)})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {typeCards.map((card, idx) => (
              <CardWithDetail
                key={`${card.name}-${idx}`}
                card={card}
                deckContext={deckContext}
              />
            ))}
          </div>
          <Separator className="mt-4" />
        </div>
      ))}
    </div>
  );
}
