import { Deck, CardData } from "./types";

export function buildDeckContext(deck: Deck, cardData: CardData[]) {
  // Calculate average CMC
  let totalCMC = 0;
  let nonlandCount = 0;

  cardData.forEach((card) => {
    if (!card.type_line.toLowerCase().includes("land")) {
      let cmc = 0;
      if (card.mana_cost) {
        const numbers = card.mana_cost.match(/\{(\d+)\}/g);
        if (numbers) {
          numbers.forEach((num) => {
            cmc += parseInt(num.replace(/[{}]/g, ""));
          });
        }
        const symbols = card.mana_cost.match(/\{[WUBRGC]\}/g);
        if (symbols) {
          cmc += symbols.length;
        }
      }
      totalCMC += cmc * card.quantity;
      nonlandCount += card.quantity;
    }
  });

  const averageCMC = nonlandCount > 0 ? totalCMC / nonlandCount : 0;

  // Build archetype hints
  const typeDistribution: Record<string, number> = {};
  cardData.forEach((card) => {
    const mainType = card.type_line.split("—")[0].trim();
    typeDistribution[mainType] = (typeDistribution[mainType] || 0) + card.quantity;
  });

  const archetypeHints = Object.entries(typeDistribution)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => `${type}: ${count}`)
    .join(", ");

  // Get other card names for context
  const otherCards = cardData.map((c) => c.name).join(", ");

  return {
    format: deck.format,
    totalCards: cardData.reduce((sum, c) => sum + c.quantity, 0),
    averageCMC: parseFloat(averageCMC.toFixed(2)),
    archetypeHints,
    otherCards: otherCards.substring(0, 1000), // Limit length for API
  };
}
