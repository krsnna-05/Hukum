import { PublicRoom, Room, TEAM_IDS } from "../../types/room";
import {
  MAX_TOTAL_PLAYERS,
  MIN_PLAYERS_TO_START,
  TEAM_NAMES,
} from "./constants";

export const toPublicRoom = (room: Room): PublicRoom => {
  const totalPlayers = Object.keys(room.players).length;
  const bidPlayers = room.teams.bid.length;
  const challengePlayers = room.teams.challenge.length;
  const teams = TEAM_IDS.reduce(
    (result, teamId) => {
      const players = room.teams[teamId]
        .map((playerId) => room.players[playerId])
        .filter(Boolean)
        .map((player) => ({
          ...player,
          isHandler: player.id === room.handlerId,
        }));

      result[teamId] = {
        id: teamId,
        name: TEAM_NAMES[teamId],
        capacity: room.maxPlayersPerTeam,
        points: room.teamPoints[teamId],
        players,
      };

      return result;
    },
    {} as PublicRoom["teams"],
  );

  return {
    roomCode: room.roomCode,
    handlerId: room.handlerId,
    status: room.status,
    minPlayersToStart: MIN_PLAYERS_TO_START,
    maxPlayersTotal: MAX_TOTAL_PLAYERS,
    canStartGame:
      totalPlayers >= MIN_PLAYERS_TO_START &&
      totalPlayers % 2 === 0 &&
      bidPlayers === challengePlayers,
    maxPlayersPerTeam: room.maxPlayersPerTeam,
    totalPlayers,
    teams,
  };
};
