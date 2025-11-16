"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Search, Save, Download } from "lucide-react";
import { DeckCard, Deck } from "@/lib/types";
import Image from "next/image";

interface DeckBuilderProps {
  onSaveDeck: (deck: Deck) => void;
  initialDeck?: Deck;
}

interface SearchResult {
  name: string;
  type_line: string;
  mana_cost: string;
  image_uris?: {
    small: string;
  };
}

export function DeckBuilder({ onSaveDeck, initialDeck }: DeckBuilderProps) {
  const [deckName, setDeckName] = useState(initialDeck?.deckName || "");
  const [format, setFormat] = useState(initialDeck?.format || "Standard");
  const [mainDeck, setMainDeck] = useState<DeckCard[]>(initialDeck?.mainDeck || []);
  const [sideboard, setSideboard] = useState<DeckCard[]>(initialDeck?.sideboard || []);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingTo, setAddingTo] = useState<"main" | "side">("main");

  // Search Scryfall for cards
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}&unique=cards&order=name`
      );

      if (!response.ok) {
        throw new Error("No cards found");
      }

      const data = await response.json();
      setSearchResults(data.data.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Add card to deck
  const addCard = (card: SearchResult, location: "main" | "side") => {
    const cardType = card.type_line.split("—")[0].trim();
    const newCard: DeckCard = {
      quantity: 1,
      name: card.name,
      type: cardType,
    };

    if (location === "main") {
      const existing = mainDeck.find((c) => c.name === card.name);
      if (existing) {
        setMainDeck(mainDeck.map((c) =>
          c.name === card.name ? { ...c, quantity: c.quantity + 1 } : c
        ));
      } else {
        setMainDeck([...mainDeck, newCard]);
      }
    } else {
      const existing = sideboard.find((c) => c.name === card.name);
      if (existing) {
        setSideboard(sideboard.map((c) =>
          c.name === card.name ? { ...c, quantity: c.quantity + 1 } : c
        ));
      } else {
        setSideboard([...sideboard, newCard]);
      }
    }

    setSearchResults([]);
    setSearchQuery("");
  };

  // Remove card from deck
  const removeCard = (cardName: string, location: "main" | "side") => {
    if (location === "main") {
      setMainDeck(mainDeck.filter((c) => c.name !== cardName));
    } else {
      setSideboard(sideboard.filter((c) => c.name !== cardName));
    }
  };

  // Update card quantity
  const updateQuantity = (cardName: string, location: "main" | "side", delta: number) => {
    if (location === "main") {
      setMainDeck(mainDeck.map((c) => {
        if (c.name === cardName) {
          const newQty = Math.max(1, c.quantity + delta);
          return { ...c, quantity: newQty };
        }
        return c;
      }));
    } else {
      setSideboard(sideboard.map((c) => {
        if (c.name === cardName) {
          const newQty = Math.max(1, c.quantity + delta);
          return { ...c, quantity: newQty };
        }
        return c;
      }));
    }
  };

  // Calculate totals
  const mainDeckTotal = mainDeck.reduce((sum, card) => sum + card.quantity, 0);
  const sideboardTotal = sideboard.reduce((sum, card) => sum + card.quantity, 0);

  // Save deck
  const handleSave = () => {
    const deck: Deck = {
      deckName: deckName || "Untitled Deck",
      format,
      mainDeck,
      sideboard,
      lastUpdated: new Date().toISOString().split("T")[0],
      totals: {
        mainDeckCards: mainDeckTotal,
        sideboardCards: sideboardTotal,
      },
    };
    onSaveDeck(deck);
  };

  // Export deck as JSON
  const handleExport = () => {
    const deck: Deck = {
      deckName: deckName || "Untitled Deck",
      format,
      mainDeck,
      sideboard,
      lastUpdated: new Date().toISOString().split("T")[0],
      totals: {
        mainDeckCards: mainDeckTotal,
        sideboardCards: sideboardTotal,
      },
    };

    const blob = new Blob([JSON.stringify(deck, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deckName || "deck"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Deck Info */}
      <Card>
        <CardHeader>
          <CardTitle>Deck Information</CardTitle>
          <CardDescription>Set your deck name and format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Deck Name</label>
            <Input
              placeholder="Enter deck name..."
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Format</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="Standard">Standard</option>
              <option value="Modern">Modern</option>
              <option value="Pioneer">Pioneer</option>
              <option value="Commander">Commander</option>
              <option value="Legacy">Legacy</option>
              <option value="Vintage">Vintage</option>
              <option value="Pauper">Pauper</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Card Search */}
      <Card>
        <CardHeader>
          <CardTitle>Add Cards</CardTitle>
          <CardDescription>Search for MTG cards to add to your deck</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {searchResults.map((card, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 hover:bg-accent border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {card.image_uris?.small && (
                      <Image
                        src={card.image_uris.small}
                        alt={card.name}
                        width={40}
                        height={56}
                        className="rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{card.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {card.mana_cost || "N/A"} • {card.type_line}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addCard(card, "main")}
                    >
                      Main
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addCard(card, "side")}
                    >
                      Side
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Deck */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Main Deck</CardTitle>
              <CardDescription>{mainDeckTotal} cards</CardDescription>
            </div>
            <Badge variant={mainDeckTotal === 60 ? "default" : "secondary"}>
              {mainDeckTotal}/60
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {mainDeck.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No cards added yet. Search and add cards above.
            </p>
          ) : (
            <div className="space-y-2">
              {mainDeck.map((card, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{card.name}</p>
                    <p className="text-xs text-muted-foreground">{card.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(card.name, "main", -1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium">{card.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(card.name, "main", 1)}
                    >
                      +
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCard(card.name, "main")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sideboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sideboard</CardTitle>
              <CardDescription>{sideboardTotal} cards</CardDescription>
            </div>
            <Badge variant={sideboardTotal <= 15 ? "default" : "destructive"}>
              {sideboardTotal}/15
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {sideboard.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No sideboard cards yet.
            </p>
          ) : (
            <div className="space-y-2">
              {sideboard.map((card, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{card.name}</p>
                    <p className="text-xs text-muted-foreground">{card.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(card.name, "side", -1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium">{card.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(card.name, "side", 1)}
                    >
                      +
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCard(card.name, "side")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} size="lg" className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Save & Analyze Deck
        </Button>
        <Button onClick={handleExport} size="lg" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
      </div>
    </div>
  );
}
