import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { StrategyDisplay } from "@/components/analysis/StrategyDisplay";

interface AnalysisState {
  status: "pending" | "running" | "completed" | "error";
  content: string;
  error?: string;
}

type StrategySubView =
  | "overview"
  | "synergies"
  | "mulligan"
  | "matchups"
  | "tactics"
  | "sideboarding"
  | "cardAnalysis";

interface StrategyViewProps {
  deckName: string;
  hasCardData: boolean;
  overview: AnalysisState;
  deepDives: Record<string, AnalysisState>;
  generating: boolean;
  activeSubView: StrategySubView;
  onGenerateOverview: () => void;
  onGenerateDeepDive: (type: string) => void;
}

const ANALYSIS_TITLES: Record<StrategySubView, string> = {
  overview: "Deck Overview",
  synergies: "Synergies & Combos",
  mulligan: "Mulligan Guide",
  matchups: "Matchup Strategy",
  tactics: "Turn-by-Turn Tactics",
  sideboarding: "Sideboarding Guide",
  cardAnalysis: "Individual Card Analysis",
};

const ANALYSIS_DESCRIPTIONS: Record<StrategySubView, string> = {
  overview: `Quick analysis of your deck's archetype, strengths, and weaknesses`,
  synergies: "Card interactions, combo lines, and synergy patterns",
  mulligan: "Opening hand decisions and mulligan strategies",
  matchups: "How to play against different archetypes",
  tactics: "Optimal sequencing and turn-by-turn gameplay",
  sideboarding: "What to bring in and out for different matchups",
  cardAnalysis: "Deep analysis of each individual card",
};

function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-[90%]" />
      </div>
      <div className="space-y-3 pt-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[88%]" />
        <Skeleton className="h-4 w-[94%]" />
      </div>
      <div className="space-y-3 pt-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[96%]" />
        <Skeleton className="h-4 w-[90%]" />
      </div>
    </div>
  );
}

export function StrategyView({
  deckName,
  hasCardData,
  overview,
  deepDives,
  generating,
  activeSubView,
  onGenerateOverview,
  onGenerateDeepDive,
}: StrategyViewProps) {
  // No card data yet
  if (!hasCardData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground text-center">
              Fetch card data first to enable strategy generation
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get current analysis based on active sub-view
  const currentAnalysis = activeSubView === "overview" ? overview : deepDives[activeSubView];
  const isGenerating = currentAnalysis?.status === "running";
  const hasContent = currentAnalysis?.content;
  const hasError = currentAnalysis?.status === "error";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {ANALYSIS_TITLES[activeSubView]}
        </CardTitle>
        <CardDescription>
          {ANALYSIS_DESCRIPTIONS[activeSubView]} - {deckName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Initial state - not generated yet */}
        {!hasContent && !isGenerating && !hasError && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Sparkles className="h-12 w-12 text-primary opacity-50" />
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Ready to Analyze</p>
              <p className="text-sm text-muted-foreground mb-6">
                Generate AI-powered {ANALYSIS_TITLES[activeSubView].toLowerCase()} for your deck
              </p>
              <Button
                onClick={() =>
                  activeSubView === "overview"
                    ? onGenerateOverview()
                    : onGenerateDeepDive(activeSubView)
                }
                size="lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate {ANALYSIS_TITLES[activeSubView]}
              </Button>
            </div>
          </div>
        )}

        {/* Loading state - show skeleton while generating */}
        {isGenerating && !hasContent && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm font-medium">
                Generating {ANALYSIS_TITLES[activeSubView].toLowerCase()}...
              </p>
            </div>
            <AnalysisSkeleton />
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="text-lg font-medium mb-2 text-destructive">Analysis Error</p>
              <p className="text-sm text-muted-foreground mb-6">
                {currentAnalysis?.error || "Failed to generate strategy"}
              </p>
            </div>
            <Button
              onClick={() =>
                activeSubView === "overview"
                  ? onGenerateOverview()
                  : onGenerateDeepDive(activeSubView)
              }
              variant="outline"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Content - only show when fully generated */}
        {hasContent && !isGenerating && <StrategyDisplay content={currentAnalysis.content} />}
      </CardContent>
    </Card>
  );
}
