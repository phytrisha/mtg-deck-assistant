// Deck structure from deck.json
export interface DeckCard {
  quantity: number;
  name: string;
  type: string;
}

export interface Deck {
  deckName: string;
  format: string;
  lastUpdated?: string;
  mainDeck: DeckCard[];
  sideboard: DeckCard[];
  totals?: {
    mainDeckCards: number;
    sideboardCards: number;
  };
}

// Scryfall API response types (simplified)
export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost: string;
  cmc: number;
  type_line: string;
  oracle_text: string;
  colors: string[];
  color_identity: string[];
  legalities: {
    standard?: string;
    pioneer?: string;
    modern?: string;
    legacy?: string;
    vintage?: string;
    commander?: string;
    pauper?: string;
    historic?: string;
    timeless?: string;
    brawl?: string;
    [key: string]: string | undefined;
  };
  image_uris?: {
    small: string;
    normal: string;
    large: string;
  };
  card_faces?: {
    name: string;
    mana_cost: string;
    type_line: string;
    oracle_text: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
    };
  }[];
}

// Extended card data with deck quantity
export interface CardData extends ScryfallCard {
  quantity: number;
  deckType: string; // Original type from deck.json
}

// Card fetch progress
export interface FetchProgress {
  total: number;
  current: number;
  cardName?: string;
}

// Error types
export interface CardFetchError {
  cardName: string;
  error: string;
}

// Strategy generation step types
export interface AnalysisStep {
  step: number;
  title: string;
  status: "pending" | "running" | "completed" | "error";
  content: string;
  reasoning?: string;
  error?: string;
}

export type AnalysisSteps = {
  cardAnalysis: AnalysisStep;
  relationshipAnalysis: AnalysisStep;
  strategyGeneration: AnalysisStep;
}
