import { PublicRoom, Room, TEAM_IDS } from "../../types/room";
import { TEAM_NAMES } from "./constants";

export const toPublicRoom = (room: Room): PublicRoom => {
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
    maxPlayersPerTeam: room.maxPlayersPerTeam,
    totalPlayers: Object.keys(room.players).length,
    teams,
  };
};
