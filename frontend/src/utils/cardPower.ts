import type { Card, PlayedMove, Suit } from "../types/room";

// Ace is strongest (index 0), 2 is weakest (index 12)
const RANK_ORDER = [
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

/**
 * Calculate card power/strength. Higher number = stronger card.
 * Ace = 13, King = 12, ..., 2 = 1
 */
export const getRankStrength = (card: Card): number => {
  return RANK_ORDER.length - RANK_ORDER.indexOf(card.rank as never);
};

/**
 * Determine who is currently winning the in-progress trick.
 * Returns the player ID of the current trick leader, or null if no cards played yet.
 */
export const getCurrentTrickWinner = (
  currentHand: PlayedMove[],
  trumpSuit: Suit | null,
  leadSuit: Suit | null,
): { playerId: string; card: Card; strength: number } | null => {
  if (currentHand.length === 0 || !trumpSuit || !leadSuit) {
    return null;
  }

  // Filter to only trump cards, or lead suit if no trumps
  const trumpMoves = currentHand.filter((move) => move.card.suit === trumpSuit);
  const contenderMoves =
    trumpMoves.length > 0
      ? trumpMoves
      : currentHand.filter((move) => move.card.suit === leadSuit);

  // Find the card with highest rank strength
  let winner = contenderMoves[0];
  let maxStrength = getRankStrength(winner.card);

  for (const move of contenderMoves.slice(1)) {
    const strength = getRankStrength(move.card);
    if (strength > maxStrength) {
      maxStrength = strength;
      winner = move;
    }
  }

  return {
    playerId: winner.playerId,
    card: winner.card,
    strength: maxStrength,
  };
};

/**
 * Get the highest card in a hand. Useful for showing best available card in current trick.
 */
export const getHighestCardInHand = (
  hand: Card[],
): { card: Card; strength: number } | null => {
  if (hand.length === 0) {
    return null;
  }

  let highest = hand[0];
  let maxStrength = getRankStrength(highest);

  for (const card of hand.slice(1)) {
    const strength = getRankStrength(card);
    if (strength > maxStrength) {
      maxStrength = strength;
      highest = card;
    }
  }

  return { card: highest, strength: maxStrength };
};
