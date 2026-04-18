import { PublicRoom, TeamId } from "../../types/room";

export const ROOM_PREFIX = "room:";
export const MAX_PLAYERS_PER_TEAM = 4;
export const ROOM_CODE_LENGTH = 4;

export const TEAM_NAMES: Record<TeamId, string> = {
  bid: "Aces",
  challenge: "Rogues",
};

export type RoomActionResult = {
  room: PublicRoom;
  assignedTeam: TeamId;
};
