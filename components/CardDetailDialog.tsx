"use client";

import { useState, useEffect } from "react";
import { CardData } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Loader2, AlertCircle, X, Shield } from "lucide-react";
import Image from "next/image";
import { getCardImageUrl, getAllLegalities, getLegalityVariant } from "@/lib/scryfall";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CardDetailDialogProps {
  card: CardData;
  isOpen: boolean;
  onClose: () => void;
  deckContext: {
    format: string;
    totalCards: number;
    averageCMC: number;
    archetypeHints: string;
    otherCards: string;
  };
}

export function CardDetailDialog({
  card,
  isOpen,
  onClose,
  deckContext,
}: CardDetailDialogProps) {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !analysis && !loading) {
      fetchAnalysis();
    }
  }, [isOpen]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card,
          deckContext,
          format: deckContext.format,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analysis");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        // Don't update state during streaming - wait until complete
      }

      // Set analysis only when complete
      setAnalysis(accumulatedText);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching card analysis:", err);
      setError(err instanceof Error ? err.message : "Failed to load analysis");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                {card.name}
                {card.quantity > 1 && (
                  <Badge variant="secondary">{card.quantity}x</Badge>
                )}
              </DialogTitle>
              <DialogDescription className="mt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{card.type_line}</Badge>
                    {card.mana_cost && (
                      <Badge variant="outline">{card.mana_cost}</Badge>
                    )}
                  </div>
                  {card.oracle_text && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      {card.oracle_text}
                    </p>
                  )}
                  {/* Format Legality */}
                  {getAllLegalities(card).length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">Format Legality</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {getAllLegalities(card).map((legality) => (
                          <Badge
                            key={legality.format}
                            variant={getLegalityVariant(legality.status)}
                            className="text-xs"
                          >
                            {legality.format}
                            {legality.status !== "legal" && ` (${legality.status})`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </div>
            <div className="flex-shrink-0">
              <div className="relative w-32 h-44 rounded-lg overflow-hidden border">
                <Image
                  src={getCardImageUrl(card)}
                  alt={card.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-4">
          {loading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-sm font-medium">
                  Analyzing {card.name}...
                </p>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[85%]" />
                <div className="pt-2">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[92%]" />
                  <Skeleton className="h-4 w-[88%]" />
                </div>
                <div className="pt-2">
                  <Skeleton className="h-6 w-56 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[94%]" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to load analysis</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="text-sm mb-3">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAnalysis}
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {analysis && !loading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">AI-Powered Analysis</span>
              </div>
              <Separator />
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {analysis}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
