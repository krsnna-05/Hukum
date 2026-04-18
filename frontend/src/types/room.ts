export type TeamId = "guerrilla" | "police";

export type RoomStatus = "lobby";

export type RoomPlayer = {
  id: string;
  name: string;
  team: TeamId;
  joinedAt: string;
  isHandler: boolean;
};

export type RoomTeam = {
  id: TeamId;
  name: string;
  capacity: number;
  players: RoomPlayer[];
};

export type Room = {
  roomCode: string;
  handlerId: string;
  status: RoomStatus;
  maxPlayersPerTeam: number;
  totalPlayers: number;
  teams: Record<TeamId, RoomTeam>;
};
