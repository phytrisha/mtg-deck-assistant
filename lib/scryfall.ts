import { ScryfallCard, CardData, DeckCard, CardFetchError, FetchProgress } from "./types";

// Rate limiting: Scryfall allows 10 requests per second
const RATE_LIMIT_DELAY = 100; // 100ms between requests

// Cache for fetched cards to avoid redundant API calls
const cardCache = new Map<string, ScryfallCard>();

/**
 * Fetch a single card from Scryfall API
 */
export async function fetchCardFromScryfall(cardName: string): Promise<ScryfallCard> {
  // Check cache first
  if (cardCache.has(cardName)) {
    return cardCache.get(cardName)!;
  }

  const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Card "${cardName}" not found on Scryfall`);
    }
    throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
  }

  const card: ScryfallCard = await response.json();

  // Cache the result
  cardCache.set(cardName, card);

  return card;
}

/**
 * Fetch all unique cards from a deck with rate limiting and progress tracking
 */
export async function fetchDeckCards(
  mainDeck: DeckCard[],
  sideboard: DeckCard[],
  onProgress?: (progress: FetchProgress) => void
): Promise<{
  cards: CardData[];
  errors: CardFetchError[];
}> {
  // Get unique card names from both main deck and sideboard
  const allCards = [...mainDeck, ...sideboard];
  const uniqueCardNames = Array.from(new Set(allCards.map((card) => card.name)));

  const totalCards = uniqueCardNames.length;
  const cards: CardData[] = [];
  const errors: CardFetchError[] = [];

  for (let i = 0; i < uniqueCardNames.length; i++) {
    const cardName = uniqueCardNames[i];

    // Report progress
    if (onProgress) {
      onProgress({
        total: totalCards,
        current: i + 1,
        cardName: cardName,
      });
    }

    try {
      const scryfallCard = await fetchCardFromScryfall(cardName);

      // Find all instances of this card in main deck and sideboard
      const mainDeckInstances = mainDeck.filter((c) => c.name === cardName);
      const sideboardInstances = sideboard.filter((c) => c.name === cardName);

      // Add to main deck cards
      mainDeckInstances.forEach((deckCard) => {
        cards.push({
          ...scryfallCard,
          quantity: deckCard.quantity,
          deckType: deckCard.type,
        });
      });

      // Add to sideboard cards
      sideboardInstances.forEach((deckCard) => {
        cards.push({
          ...scryfallCard,
          quantity: deckCard.quantity,
          deckType: deckCard.type,
        });
      });

      // Rate limiting delay (except for last card)
      if (i < uniqueCardNames.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    } catch (error) {
      console.error(`Error fetching card "${cardName}":`, error);
      errors.push({
        cardName: cardName,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { cards, errors };
}

/**
 * Get the image URL for a card, handling double-faced cards
 */
export function getCardImageUrl(card: ScryfallCard): string {
  if (card.image_uris?.small) {
    return card.image_uris.small;
  }

  // Handle double-faced cards
  if (card.card_faces && card.card_faces[0]?.image_uris?.small) {
    return card.card_faces[0].image_uris.small;
  }

  return "/card-back.png"; // Fallback image
}

/**
 * Group cards by type for display
 */
export function groupCardsByType(cards: CardData[]): Map<string, CardData[]> {
  const groups = new Map<string, CardData[]>();

  // Define type order for consistent display
  const typeOrder = [
    "Creature",
    "Planeswalker",
    "Instant",
    "Sorcery",
    "Enchantment",
    "Artifact",
    "Land",
    "Basic Land",
  ];

  cards.forEach((card) => {
    const type = card.deckType || "Other";
    if (!groups.has(type)) {
      groups.set(type, []);
    }
    groups.get(type)!.push(card);
  });

  // Sort groups by defined order
  const sortedGroups = new Map<string, CardData[]>();
  typeOrder.forEach((type) => {
    if (groups.has(type)) {
      sortedGroups.set(type, groups.get(type)!);
    }
  });

  // Add any remaining types not in the order
  groups.forEach((cards, type) => {
    if (!sortedGroups.has(type)) {
      sortedGroups.set(type, cards);
    }
  });

  return sortedGroups;
}

/**
 * Get the most relevant legality formats to display (legal formats only)
 */
export function getRelevantLegalities(card: ScryfallCard): { format: string; status: string }[] {
  if (!card.legalities) return [];

  // Priority order of formats to show
  const formatPriority = [
    "standard",
    "pioneer",
    "modern",
    "legacy",
    "vintage",
    "commander",
    "pauper",
    "historic",
    "timeless",
  ];

  const legalities: { format: string; status: string }[] = [];

  formatPriority.forEach((format) => {
    const status = card.legalities[format];
    if (status === "legal") {
      legalities.push({
        format: format.charAt(0).toUpperCase() + format.slice(1),
        status,
      });
    }
  });

  // Limit to top 3 most relevant formats
  return legalities.slice(0, 3);
}

/**
 * Get all legalities for a card (for detailed view)
 */
export function getAllLegalities(card: ScryfallCard): { format: string; status: string }[] {
  if (!card.legalities) return [];

  const formatOrder = [
    "standard",
    "pioneer",
    "modern",
    "legacy",
    "vintage",
    "commander",
    "pauper",
    "historic",
    "timeless",
    "brawl",
  ];

  return formatOrder
    .map((format) => ({
      format: format.charAt(0).toUpperCase() + format.slice(1),
      status: card.legalities[format] || "not_legal",
    }))
    .filter((item) => item.status !== "not_legal");
}

/**
 * Get badge variant based on legality status
 */
export function getLegalityVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "legal":
      return "default";
    case "restricted":
      return "secondary";
    case "banned":
      return "destructive";
    default:
      return "outline";
  }
}
