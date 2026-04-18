export const TEAM_IDS = ["bid", "challenge"] as const;

export type TeamId = (typeof TEAM_IDS)[number];

import type { Card, Suit } from "../game/deck";

export type RoomStatus = "lobby" | "bid" | "playing" | "finished";

export type BidPhase = "collecting" | "chooseTrump";

export type RoomPlayer = {
  id: string;
  name: string;
  team: TeamId;
  joinedAt: string;
};

export type PlayedMove = {
  playerId: string;
  card: Card;
};

export type Room = {
  roomCode: string;
  handlerId: string;
  status: RoomStatus;
  maxPlayersPerTeam: number;
  createdAt: string;
  updatedAt: string;
  bidPhase: BidPhase | null;
  currentBidTeamId: TeamId | null;
  currentBidPlayerId: string | null;
  highestBidderId: string | null;
  highestBidValue: number | null;
  trumpSuit: Suit | null;
  leadSuit: Suit | null;
  playingPlayerId: string | null;
  bidOrder: string[];
  bids: Record<string, number | null>;
  hands: Record<string, Card[]>;
  currentHand: PlayedMove[];
  handsWon: Record<string, number>;
  tricksCompleted: number;
  teamPoints: Record<TeamId, number>;
  players: Record<string, RoomPlayer>;
  teams: Record<TeamId, string[]>;
};

export type PublicTeam = {
  id: TeamId;
  name: string;
  capacity: number;
  points: number;
  players: Array<RoomPlayer & { isHandler: boolean; isPlaying: boolean }>;
};

export type PublicBiddingState = {
  bidPhase: BidPhase | null;
  currentBidTeamId: TeamId | null;
  currentBidPlayerId: string | null;
  highestBidderId: string | null;
  highestBidValue: number | null;
  trumpSuit: Suit | null;
  bidOrder: string[];
  bids: Record<string, number | null>;
  hands: Record<string, Card[]>;
};

export type PublicRoom = {
  roomCode: string;
  handlerId: string;
  status: RoomStatus;
  bidPhase: BidPhase | null;
  currentBidTeamId: TeamId | null;
  currentBidPlayerId: string | null;
  highestBidderId: string | null;
  highestBidValue: number | null;
  trumpSuit: Suit | null;
  leadSuit: Suit | null;
  playingPlayerId: string | null;
  minPlayersToStart: number;
  maxPlayersTotal: number;
  canStartGame: boolean;
  maxPlayersPerTeam: number;
  totalPlayers: number;
  bidOrder: string[];
  bids: Record<string, number | null>;
  hands: Record<string, Card[]>;
  handCounts: Record<string, number>;
  currentHand: PlayedMove[];
  handsWon: Record<string, number>;
  tricksCompleted: number;
  teams: Record<TeamId, PublicTeam>;
};
