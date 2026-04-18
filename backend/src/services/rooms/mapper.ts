import { PublicRoom, Room, TEAM_IDS } from "../../types/room";
import {
  MAX_TOTAL_PLAYERS,
  MIN_PLAYERS_TO_START,
  TEAM_NAMES,
} from "./constants";

const normalizeCardSvgPath = (svgPath: string): string => {
  if (svgPath.startsWith("/cards/")) {
    return svgPath.replace("/cards/", "/api/cards/");
  }

  return svgPath;
};

export const toPublicRoom = (room: Room): PublicRoom => {
  const totalPlayers = Object.keys(room.players).length;
  const bidPlayers = room.teams.bid.length;
  const challengePlayers = room.teams.challenge.length;
  const safeHands = room.hands ?? {};
  const safeCurrentHand = room.currentHand ?? [];
  const safeHandsWon = room.handsWon ?? {};
  const safeTricksCompleted = room.tricksCompleted ?? 0;
  const safeLeadSuit = room.leadSuit ?? null;
  const teams = TEAM_IDS.reduce(
    (result, teamId) => {
      const players = room.teams[teamId]
        .map((playerId) => room.players[playerId])
        .filter(Boolean)
        .map((player) => ({
          ...player,
          isHandler: player.id === room.handlerId,
          isPlaying: player.id === room.playingPlayerId,
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

  const hands = Object.entries(safeHands).reduce(
    (result, [playerId, cards]) => {
      result[playerId] = cards.map((card) => ({
        ...card,
        svgPath: normalizeCardSvgPath(card.svgPath),
      }));

      return result;
    },
    {} as PublicRoom["hands"],
  );

  const handCounts = Object.entries(safeHands).reduce(
    (result, [playerId, cards]) => {
      result[playerId] = cards.length;
      return result;
    },
    {} as PublicRoom["handCounts"],
  );

  return {
    roomCode: room.roomCode,
    handlerId: room.handlerId,
    status: room.status,
    bidPhase: room.bidPhase,
    currentBidTeamId: room.currentBidTeamId,
    currentBidPlayerId: room.currentBidPlayerId,
    highestBidderId: room.highestBidderId,
    highestBidValue: room.highestBidValue,
    trumpSuit: room.trumpSuit,
    leadSuit: safeLeadSuit,
    playingPlayerId: room.playingPlayerId,
    minPlayersToStart: MIN_PLAYERS_TO_START,
    maxPlayersTotal: MAX_TOTAL_PLAYERS,
    canStartGame:
      totalPlayers >= MIN_PLAYERS_TO_START &&
      totalPlayers % 2 === 0 &&
      bidPlayers === challengePlayers,
    maxPlayersPerTeam: room.maxPlayersPerTeam,
    totalPlayers,
    bidOrder: room.bidOrder,
    bids: room.bids,
    hands,
    handCounts,
    currentHand: safeCurrentHand,
    handsWon: safeHandsWon,
    tricksCompleted: safeTricksCompleted,
    teams,
  };
};
