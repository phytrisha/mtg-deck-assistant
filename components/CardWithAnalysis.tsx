"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Sparkles, Link as LinkIcon } from "lucide-react";
import { CardData } from "@/lib/types";
import { getCardImageUrl, getRelevantLegalities, getLegalityVariant } from "@/lib/scryfall";
import Image from "next/image";

interface CardWithAnalysisProps {
  card: CardData;
  cardAnalysis?: string;
  relationshipAnalysis?: string;
}

export function CardWithAnalysis({ card, cardAnalysis, relationshipAnalysis }: CardWithAnalysisProps) {
  const [expanded, setExpanded] = useState(false);
  const legalities = getRelevantLegalities(card);

  // Extract analysis for this specific card from the full analysis
  const extractCardInfo = (fullAnalysis: string, cardName: string) => {
    if (!fullAnalysis) return null;

    // Try to find section for this card (look for card name as heading or bold)
    const patterns = [
      new RegExp(`###?\\s*${cardName}[\\s\\S]*?(?=###|$)`, 'i'),
      new RegExp(`\\*\\*${cardName}\\*\\*[\\s\\S]*?(?=\\*\\*[^\\*]+\\*\\*|$)`, 'i'),
      new RegExp(`${cardName}[\\s\\S]*?(?=\\n\\n[A-Z]|$)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = fullAnalysis.match(pattern);
      if (match && match[0].length > cardName.length + 10) {
        return match[0].trim();
      }
    }

    return null;
  };

  const cardInfo = cardAnalysis ? extractCardInfo(cardAnalysis, card.name) : null;
  const relationshipInfo = relationshipAnalysis ? extractCardInfo(relationshipAnalysis, card.name) : null;

  const hasAnalysis = cardInfo || relationshipInfo;

  return (
    <div className="space-y-2">
      <div className="relative aspect-[5/7] overflow-hidden rounded-lg border bg-muted group">
        <Image
          src={getCardImageUrl(card)}
          alt={card.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />

        {/* Legality badges */}
        {legalities.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {legalities.map((legality) => (
              <Badge
                key={legality.format}
                variant={getLegalityVariant(legality.status)}
                className="text-[9px] px-1 py-0.5 h-auto"
              >
                {legality.format}
              </Badge>
            ))}
          </div>
        )}

        {hasAnalysis && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <Badge variant="secondary" className="w-full justify-center">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Analysis Available
              </Badge>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs font-medium leading-tight">{card.quantity}x {card.name}</p>
            <p className="text-xs text-muted-foreground">{card.mana_cost || "N/A"}</p>
          </div>
          {hasAnalysis && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        {hasAnalysis && expanded && (
          <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border space-y-3 text-xs">
            {cardInfo && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="font-semibold text-xs">Individual Analysis</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {cardInfo}
                </p>
              </div>
            )}

            {relationshipInfo && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <LinkIcon className="h-3 w-3 text-primary" />
                  <span className="font-semibold text-xs">Synergies</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {relationshipInfo}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
