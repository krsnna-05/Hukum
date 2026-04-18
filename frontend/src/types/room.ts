export type TeamId = "bid" | "challenge";

export type Suit = "spades" | "hearts" | "diamonds" | "clubs";

export type RoomStatus = "lobby" | "bid" | "playing";

export type BidPhase = "collecting" | "chooseTrump";

export type Card = {
  rank: string;
  suit: Suit;
  rankSymbol: string;
  suitSymbol: string;
  suitCode: "S" | "H" | "D" | "C";
  code: string;
  svgName: string;
  svgPath: string;
};

export type RoomPlayer = {
  id: string;
  name: string;
  team: TeamId;
  joinedAt: string;
  isHandler: boolean;
  isPlaying: boolean;
};

export type RoomTeam = {
  id: TeamId;
  name: string;
  capacity: number;
  points: number;
  players: RoomPlayer[];
};

export type Room = {
  roomCode: string;
  handlerId: string;
  status: RoomStatus;
  bidPhase: BidPhase | null;
  currentBidTeamId: TeamId | null;
  currentBidPlayerId: string | null;
  highestBidderId: string | null;
  highestBidValue: number | null;
  trumpSuit: Suit | null;
  playingPlayerId: string | null;
  minPlayersToStart: number;
  maxPlayersTotal: number;
  canStartGame: boolean;
  maxPlayersPerTeam: number;
  totalPlayers: number;
  bidOrder: string[];
  bids: Record<string, number | null>;
  hands: Record<string, Card[]>;
  teams: Record<TeamId, RoomTeam>;
};
