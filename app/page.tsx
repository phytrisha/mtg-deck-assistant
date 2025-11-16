"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Hammer,
  LayoutGrid,
  BookOpen,
  AlertCircle,
  Sparkles,
  Target,
  Shuffle,
  Swords,
  Clock,
  ArrowLeftRight,
  FileText,
} from "lucide-react";
import { Deck } from "@/lib/types";
import { useDeck } from "@/hooks/useDeck";
import { useCardData } from "@/hooks/useCardData";
import { useAnalysis } from "@/hooks/useAnalysis";
import { buildDeckContext } from "@/lib/deckContext";
import { BuildView } from "@/components/views/BuildView";
import { CardsView } from "@/components/views/CardsView";
import { StrategyView } from "@/components/views/StrategyView";

type StrategySubView =
  | "overview"
  | "synergies"
  | "mulligan"
  | "matchups"
  | "tactics"
  | "sideboarding"
  | "cardAnalysis";

export default function Home() {
  const [activeView, setActiveView] = useState<"build" | "cards" | "strategy">("cards");
  const [strategySubView, setStrategySubView] = useState<StrategySubView>("overview");

  // Custom hooks
  const { deck, setDeck, loading: deckLoading, error: deckError } = useDeck();
  const {
    cardData,
    fetching: fetchingCards,
    progress: fetchProgress,
    fetchCards,
    resetCardData,
  } = useCardData(deck);
  const {
    overview,
    deepDives,
    generating,
    generateOverview,
    generateDeepDive,
  } = useAnalysis(deck, cardData);

  // Handle deck save
  const handleSaveDeck = (newDeck: Deck) => {
    setDeck(newDeck);
    resetCardData();
    setActiveView("cards");
  };

  // Handle generate overview and switch to strategy view
  const handleGenerateOverview = () => {
    generateOverview();
    setActiveView("strategy");
    setStrategySubView("overview");
  };

  // Handle switching to strategy view
  const handleSwitchToStrategy = (subView: StrategySubView) => {
    setActiveView("strategy");
    setStrategySubView(subView);
  };

  // Build deck context for card analysis
  const deckContext = deck && cardData ? buildDeckContext(deck, cardData) : undefined;

  // Render loading state
  if (deckLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Render deck error
  if (deckError) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error Loading Deck
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{deckError}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!deck) return null;

  const isStrategyView = activeView === "strategy";

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-lg font-bold">MTG Deck Assistant</h2>
          <p className="text-sm text-muted-foreground">Build & analyze your decks</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView("build")}
                    isActive={activeView === "build"}
                  >
                    <Hammer className="h-4 w-4" />
                    <span>Build Deck</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView("cards")}
                    isActive={activeView === "cards"}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>Card List</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Strategy with sub-menu */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      if (!isStrategyView) {
                        handleSwitchToStrategy("overview");
                      }
                    }}
                    isActive={isStrategyView}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Strategy</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {cardData && (
                  <SidebarMenu className="ml-4 border-l pl-2 mt-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setStrategySubView("overview")}
                        isActive={isStrategyView && strategySubView === "overview"}
                        size="sm"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Overview</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setStrategySubView("synergies")}
                        isActive={isStrategyView && strategySubView === "synergies"}
                        size="sm"
                      >
                        <Target className="h-3 w-3" />
                        <span>Synergies & Combos</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setStrategySubView("mulligan")}
                        isActive={isStrategyView && strategySubView === "mulligan"}
                        size="sm"
                      >
                        <Shuffle className="h-3 w-3" />
                        <span>Mulligan Guide</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setStrategySubView("matchups")}
                        isActive={isStrategyView && strategySubView === "matchups"}
                        size="sm"
                      >
                        <Swords className="h-3 w-3" />
                        <span>Matchup Strategy</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setStrategySubView("tactics")}
                        isActive={isStrategyView && strategySubView === "tactics"}
                        size="sm"
                      >
                        <Clock className="h-3 w-3" />
                        <span>Turn-by-Turn Tactics</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setStrategySubView("sideboarding")}
                        isActive={isStrategyView && strategySubView === "sideboarding"}
                        size="sm"
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                        <span>Sideboarding</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setStrategySubView("cardAnalysis")}
                        isActive={isStrategyView && strategySubView === "cardAnalysis"}
                        size="sm"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Individual Cards</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className="p-4 md:p-6 lg:p-8">
          {activeView === "build" && <BuildView deck={deck} onSaveDeck={handleSaveDeck} />}

          {activeView === "cards" && (
            <CardsView
              deck={deck}
              cardData={cardData}
              fetching={fetchingCards}
              progress={fetchProgress}
              onFetchCards={fetchCards}
              deckContext={deckContext}
            />
          )}

          {activeView === "strategy" && (
            <StrategyView
              deckName={deck.deckName}
              hasCardData={!!cardData}
              overview={overview}
              deepDives={deepDives}
              generating={generating}
              activeSubView={strategySubView}
              onGenerateOverview={handleGenerateOverview}
              onGenerateDeepDive={generateDeepDive}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
