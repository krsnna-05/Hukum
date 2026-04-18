export const TEAM_IDS = ["bid", "challenge"] as const;

export type TeamId = (typeof TEAM_IDS)[number];

export type RoomStatus = "lobby";

export type RoomPlayer = {
  id: string;
  name: string;
  team: TeamId;
  joinedAt: string;
};

export type Room = {
  roomCode: string;
  handlerId: string;
  status: RoomStatus;
  maxPlayersPerTeam: number;
  createdAt: string;
  updatedAt: string;
  players: Record<string, RoomPlayer>;
  teams: Record<TeamId, string[]>;
};

export type PublicTeam = {
  id: TeamId;
  name: string;
  capacity: number;
  players: Array<RoomPlayer & { isHandler: boolean }>;
};

export type PublicRoom = {
  roomCode: string;
  handlerId: string;
  status: RoomStatus;
  minPlayersToStart: number;
  maxPlayersTotal: number;
  canStartGame: boolean;
  maxPlayersPerTeam: number;
  totalPlayers: number;
  teams: Record<TeamId, PublicTeam>;
};
