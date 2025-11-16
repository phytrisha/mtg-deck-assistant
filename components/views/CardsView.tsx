import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { Deck, CardData, FetchProgress } from "@/lib/types";
import { CardGrid } from "@/components/cards/CardGrid";
import { groupCardsByType } from "@/lib/scryfall";

interface CardsViewProps {
  deck: Deck;
  cardData: CardData[] | null;
  fetching: boolean;
  progress: FetchProgress | null;
  onFetchCards: () => void;
  deckContext?: {
    format: string;
    totalCards: number;
    averageCMC: number;
    archetypeHints: string;
    otherCards: string;
  };
}

export function CardsView({
  deck,
  cardData,
  fetching,
  progress,
  onFetchCards,
  deckContext,
}: CardsViewProps) {
  const [sideboardOpen, setSideboardOpen] = useState(false);

  const mainDeckGroups = cardData
    ? groupCardsByType(
        cardData.filter((card) => deck.mainDeck.some((dc) => dc.name === card.name))
      )
    : null;

  const sideboardGroups = cardData
    ? groupCardsByType(
        cardData.filter((card) => deck.sideboard.some((dc) => dc.name === card.name))
      )
    : null;

  return (
    <>
      {!cardData && !fetching && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-sm text-muted-foreground text-center">
                Fetch card images and details from Scryfall to view your deck
              </p>
              <Button onClick={onFetchCards} disabled={fetching || !!cardData}>
                Fetch Card Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {fetching && progress && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-sm font-medium mb-2">Fetching card data...</p>
                <p className="text-xs text-muted-foreground">
                  {progress.current} / {progress.total} cards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {cardData && !fetching && (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-lg bg-muted/50 p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Click on any card to get AI-powered analysis in the context of your deck.
                Check the Strategy tab for comprehensive gameplay guide.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {cardData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Main Deck (
                {deck.totals?.mainDeckCards ||
                  deck.mainDeck.reduce((sum, c) => sum + c.quantity, 0)}{" "}
                cards)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardGrid cards={mainDeckGroups!} deckContext={deckContext} />
          </CardContent>
        </Card>
      )}

      {cardData && (
        <Collapsible open={sideboardOpen} onOpenChange={setSideboardOpen}>
          <Card>
            <CardHeader>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>
                    Sideboard (
                    {deck.totals?.sideboardCards ||
                      deck.sideboard.reduce((sum, c) => sum + c.quantity, 0)}{" "}
                    cards)
                  </CardTitle>
                </div>
                {sideboardOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <CardGrid cards={sideboardGroups!} deckContext={deckContext} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </>
  );
}
