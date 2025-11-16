# MTG Deck Strategy Assistant

An AI-powered web application that analyzes your Magic: The Gathering decks and provides comprehensive strategy guides using Claude AI and Scryfall card data.

## Features

### Core Functionality
- Load deck information from a local `deck.json` file or build custom decks
- Three-tab interface with contextual actions:
  - **Build Deck**: Create and export custom decks with Scryfall card search
  - **Cards**: Fetch and view card images with per-card AI analysis on click
  - **Strategy**: Generate comprehensive AI-powered strategy guides
- Scryfall API integration with rate limiting (100ms between requests)
- Real-time progress indicators for all operations

### AI-Powered Analysis (Using Claude Sonnet 4.5)

#### Per-Card Deep Dive (NEW!)
Click any card to open a detailed AI analysis dialog featuring:
- **Card Overview**: Quick summary of role and function
- **Strategic Function**: Archetype role, game plan position, priority level
- **Mechanical Deep Dive**: Rules interactions, timing windows, stack mechanics
- **Strategic Advantages**: Best-case scenarios, strong matchups, unique value
- **Weaknesses & Vulnerabilities**: Dead card situations, common answers
- **Mana & Tempo Evaluation**: Efficiency analysis, alternatives, opportunity cost
- **Timing & Sequencing**: Optimal casting turns, pre/post-combat considerations
- **Synergies in This Deck**: Top synergies with other cards, combo potential
- **Matchup-Specific Value**: Performance vs aggro/control/midrange/combo
- **Format-Specific Context**: Meta relevance, format staple comparison
- **Piloting Tips**: Common mistakes, advanced plays, bluffing opportunities
- **Overall Assessment**: Power level rating, replaceability analysis

#### Comprehensive Strategy Guide
Three-step progressive analysis:

**Step 1: Individual Card Analysis** (8,000 tokens)
- 7 analytical dimensions per card
- Format-specific context
- Timing considerations
- Statistical foundations

**Step 2: Relationship Analysis** (12,000 tokens)
- Synergy matrix with power ratings
- Multi-card engines
- Combo lines and infinite interactions
- Critical mass analysis
- Anti-synergies identification

**Step 3: Strategy Generation** (16,000 tokens)
- Executive summary with power level ratings
- Mulligan decision trees (perfect 7s, tier 1/2 keeps)
- Turn-by-turn tactical guides
- Advanced sequencing scenarios
- General matchup strategy (vs aggro/control/midrange/combo)
- Sideboarding principles and strategy
- Win rate optimization tips
- Deck optimization suggestions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- An Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Clone or navigate to this repository:

```bash
cd mtg-deck-assistant
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file and add your Anthropic API key:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and replace `your_api_key_here` with your actual API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

4. Ensure your `deck.json` file is in the project root with the following structure:

```json
{
  "deckName": "Your Deck Name",
  "format": "Standard",
  "mainDeck": [
    {"quantity": 4, "name": "Card Name", "type": "Creature"}
  ],
  "sideboard": [
    {"quantity": 2, "name": "Card Name", "type": "Instant"}
  ]
}
```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage

1. The app will automatically load your `deck.json` on page load
2. Click "Fetch Card Data" to retrieve card details and images from Scryfall
3. Once cards are loaded, click "Generate Strategy" to get AI-powered analysis
4. The strategy guide will stream in real-time as Claude generates it

## Technology Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **shadcn/ui** for UI components
- **Tailwind CSS** for styling
- **Scryfall API** for card data (no API key required)
- **Claude API** (Anthropic) for strategy generation

## Project Structure

```
mtg-deck-assistant/
├── app/
│   ├── api/strategy/route.ts  # Claude API endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page component
├── components/ui/             # shadcn/ui components
├── lib/
│   ├── scryfall.ts           # Scryfall API helpers
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
├── deck.json                  # Your deck file
└── .env.local                # API keys (not committed)
```

## deck.json Format

The `deck.json` file should follow this structure:

```json
{
  "deckName": "Deck Name",
  "format": "Standard",
  "lastUpdated": "2025-11-11",
  "mainDeck": [
    {
      "quantity": 4,
      "name": "Monastery Swiftspear",
      "type": "Creature"
    }
  ],
  "sideboard": [
    {
      "quantity": 3,
      "name": "Ghost Vacuum",
      "type": "Artifact"
    }
  ],
  "totals": {
    "mainDeckCards": 60,
    "sideboardCards": 15
  }
}
```

## Rate Limiting

The app respects Scryfall's rate limits by adding a 100ms delay between card fetch requests (10 requests/second). Fetched cards are cached to avoid redundant API calls.

## Error Handling

- Missing or invalid `deck.json` files show clear error messages
- Cards that fail to fetch from Scryfall are reported with details
- Claude API errors are displayed to the user
- All API keys are validated before use

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
