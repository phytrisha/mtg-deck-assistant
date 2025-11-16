"use client";

import { useState } from "react";
import { CardData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Info } from "lucide-react";
import Image from "next/image";
import { getCardImageUrl, getRelevantLegalities, getLegalityVariant } from "@/lib/scryfall";
import { CardDetailDialog } from "./CardDetailDialog";

interface CardWithDetailProps {
  card: CardData;
  deckContext?: {
    format: string;
    totalCards: number;
    averageCMC: number;
    archetypeHints: string;
    otherCards: string;
  };
}

const DEFAULT_DECK_CONTEXT = {
  format: "Unknown",
  totalCards: 0,
  averageCMC: 0,
  archetypeHints: "",
  otherCards: "",
};

export function CardWithDetail({ card, deckContext }: CardWithDetailProps) {
  const context = deckContext || DEFAULT_DECK_CONTEXT;
  const [dialogOpen, setDialogOpen] = useState(false);
  const legalities = getRelevantLegalities(card);

  return (
    <>
      <div className="group relative">
        <div className="relative aspect-[5/7] overflow-hidden rounded-lg border bg-muted cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:scale-105"
          onClick={() => setDialogOpen(true)}
        >
          <Image
            src={getCardImageUrl(card)}
            alt={card.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-white">
                AI Analysis Available
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                setDialogOpen(true);
              }}
            >
              <Info className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </div>

          {/* Quantity badge */}
          {card.quantity > 1 && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="font-bold">
                {card.quantity}x
              </Badge>
            </div>
          )}

          {/* Legality badges */}
          {legalities.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {legalities.map((legality) => (
                <Badge
                  key={legality.format}
                  variant={getLegalityVariant(legality.status)}
                  className="text-[10px] px-1.5 py-0.5 h-auto"
                >
                  {legality.format}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Card name below */}
        <div className="mt-2 text-center">
          <p className="text-xs font-medium line-clamp-1">{card.name}</p>
        </div>
      </div>

      <CardDetailDialog
        card={card}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        deckContext={context}
      />
    </>
  );
}
