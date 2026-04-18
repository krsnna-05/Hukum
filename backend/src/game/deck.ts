export const CARDS_PER_PLAYER: Record<number, number> = {
  4: 8,
  6: 7,
  8: 6,
};

export const RANKS = [
  "A",
  "K",
  "Q",
  "J",
  "10",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
] as const;

export const SUITS = ["spades", "hearts", "diamonds", "clubs"] as const;

export type Rank = (typeof RANKS)[number];
export type Suit = (typeof SUITS)[number];

const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

const SUIT_CODES: Record<Suit, "S" | "H" | "D" | "C"> = {
  spades: "S",
  hearts: "H",
  diamonds: "D",
  clubs: "C",
};

export type Card = {
  rank: Rank;
  suit: Suit;
  rankSymbol: Rank;
  suitSymbol: string;
  suitCode: "S" | "H" | "D" | "C";
  code: string;
  svgName: string;
  svgPath: string;
};

const validatePlayerCount = (playerCount: number): void => {
  if (!(playerCount in CARDS_PER_PLAYER)) {
    throw new Error("Unsupported player count. Allowed values are 4, 6, or 8.");
  }
};

export const getCardsPerPlayer = (playerCount: number): number => {
  validatePlayerCount(playerCount);
  return CARDS_PER_PLAYER[playerCount];
};

const toCard = (rank: Rank, suit: Suit): Card => {
  const suitCode = SUIT_CODES[suit];
  const code = `${rank}${suitCode}`;

  return {
    rank,
    suit,
    rankSymbol: rank,
    suitSymbol: SUIT_SYMBOLS[suit],
    suitCode,
    code,
    svgName: `${code}.svg`,
    svgPath: `/api/cards/${code}.svg`,
  };
};

export const generateTrimmedDeck = (playerCount: number): Card[] => {
  const cardsPerPlayer = getCardsPerPlayer(playerCount);
  const totalCards = playerCount * cardsPerPlayer;
  const deck: Card[] = [];

  for (const rank of RANKS) {
    for (const suit of SUITS) {
      if (deck.length >= totalCards) {
        return deck;
      }

      deck.push(toCard(rank, suit));
    }
  }

  return deck;
};

export const shuffleDeck = <T>(
  items: T[],
  rng: () => number = Math.random,
): T[] => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled;
};

export const generateShuffledTrimmedDeck = (
  playerCount: number,
  rng?: () => number,
): Card[] => {
  const deck = generateTrimmedDeck(playerCount);
  return shuffleDeck(deck, rng);
};
