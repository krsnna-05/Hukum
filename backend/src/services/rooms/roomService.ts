import { PublicRoom, Room, TeamId } from "../../types/room";
import {
  MAX_PLAYERS_PER_TEAM,
  ROOM_CODE_LENGTH,
  RoomActionResult,
  TEAM_NAMES,
} from "./constants";
import { toPublicRoom } from "./mapper";
import { getRoomByCode, roomExists, saveRoom } from "./repository";

const ensurePlayerInput = (playerId: string, playerName: string) => {
  if (!playerId.trim()) {
    throw new Error("Player id is required.");
  }

  if (!playerName.trim()) {
    throw new Error("Player name is required.");
  }
};

const createRandomSuffix = (): string => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return result;
};

const generateRoomCode = async (): Promise<string> => {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const roomCode = `HUK-${createRandomSuffix()}`;
    const exists = await roomExists(roomCode);

    if (!exists) {
      return roomCode;
    }
  }

  throw new Error("Failed to generate room code. Please retry.");
};

const pickTeamWithSpace = (room: Room): TeamId | null => {
  const [bidCount, challengeCount] = [
    room.teams.bid.length,
    room.teams.challenge.length,
  ];

  const sorted: TeamId[] =
    bidCount <= challengeCount ? ["bid", "challenge"] : ["challenge", "bid"];

  for (const teamId of sorted) {
    if (room.teams[teamId].length < room.maxPlayersPerTeam) {
      return teamId;
    }
  }

  return null;
};

const getOpposingTeam = (teamId: TeamId): TeamId =>
  teamId === "bid" ? "challenge" : "bid";

export const createRoom = async (
  playerId: string,
  playerName: string,
): Promise<RoomActionResult> => {
  ensurePlayerInput(playerId, playerName);

  const roomCode = await generateRoomCode();
  const now = new Date().toISOString();

  const normalizedPlayerId = playerId.trim();
  const normalizedPlayerName = playerName.trim();

  const room: Room = {
    roomCode,
    handlerId: normalizedPlayerId,
    status: "lobby",
    maxPlayersPerTeam: MAX_PLAYERS_PER_TEAM,
    createdAt: now,
    updatedAt: now,
    teamPoints: {
      bid: 0,
      challenge: 0,
    },
    players: {
      [normalizedPlayerId]: {
        id: normalizedPlayerId,
        name: normalizedPlayerName,
        team: "bid",
        joinedAt: now,
      },
    },
    teams: {
      bid: [normalizedPlayerId],
      challenge: [],
    },
  };

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: "bid",
  };
};

export const joinRoom = async (
  roomCode: string,
  playerId: string,
  playerName: string,
): Promise<RoomActionResult> => {
  ensurePlayerInput(playerId, playerName);

  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  const normalizedPlayerId = playerId.trim();
  const normalizedPlayerName = playerName.trim();
  const existingPlayer = room.players[normalizedPlayerId];

  if (existingPlayer) {
    existingPlayer.name = normalizedPlayerName;
    await saveRoom(room);

    return {
      room: toPublicRoom(room),
      assignedTeam: existingPlayer.team,
    };
  }

  const assignedTeam = pickTeamWithSpace(room);

  if (!assignedTeam) {
    throw new Error("Room is full.");
  }

  room.players[normalizedPlayerId] = {
    id: normalizedPlayerId,
    name: normalizedPlayerName,
    team: assignedTeam,
    joinedAt: new Date().toISOString(),
  };
  room.teams[assignedTeam].push(normalizedPlayerId);

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam,
  };
};

export const getRoom = async (roomCode: string): Promise<PublicRoom> => {
  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  return toPublicRoom(room);
};

export const switchPlayerTeam = async (
  roomCode: string,
  playerId: string,
  toTeam?: TeamId,
): Promise<RoomActionResult> => {
  if (!playerId.trim()) {
    throw new Error("Player id is required.");
  }

  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  const player = room.players[playerId.trim()];

  if (!player) {
    throw new Error("Player is not part of this room.");
  }

  const nextTeam: TeamId =
    toTeam ?? (player.team === "bid" ? "challenge" : "bid");

  if (nextTeam === player.team) {
    return {
      room: toPublicRoom(room),
      assignedTeam: player.team,
    };
  }

  if (room.teams[nextTeam].length >= room.maxPlayersPerTeam) {
    throw new Error(`${TEAM_NAMES[nextTeam]} is already full.`);
  }

  room.teams[player.team] = room.teams[player.team].filter(
    (id) => id !== player.id,
  );
  room.teams[nextTeam].push(player.id);
  player.team = nextTeam;

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: nextTeam,
  };
};

export const applyRoundResult = async (
  roomCode: string,
  winningTeam: TeamId,
  bid: number,
): Promise<RoomActionResult> => {
  if (!Number.isInteger(bid) || bid <= 0) {
    throw new Error("Bid must be a positive whole number.");
  }

  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  const losingTeam = getOpposingTeam(winningTeam);

  room.teamPoints[winningTeam] += bid;
  room.teamPoints[losingTeam] -= 2 * bid;

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: winningTeam,
  };
};
