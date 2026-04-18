import { redisClient } from "../config/redis";
import { PublicRoom, Room, TEAM_IDS, TeamId } from "../types/room";

const ROOM_PREFIX = "room:";
const MAX_PLAYERS_PER_TEAM = 4;
const ROOM_CODE_LENGTH = 4;
const TEAM_NAMES: Record<TeamId, string> = {
  guerrilla: "Guerrilla",
  police: "Police",
};

type RoomActionResult = {
  room: PublicRoom;
  assignedTeam: TeamId;
};

const buildRoomKey = (roomCode: string) => `${ROOM_PREFIX}${roomCode}`;

const normalizeCode = (value: string) => value.trim().toUpperCase();

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
    const exists = await redisClient.exists(buildRoomKey(roomCode));

    if (!exists) {
      return roomCode;
    }
  }

  throw new Error("Failed to generate room code. Please retry.");
};

const pickTeamWithSpace = (room: Room): TeamId | null => {
  const [guerrillaCount, policeCount] = [
    room.teams.guerrilla.length,
    room.teams.police.length,
  ];

  const sorted: TeamId[] =
    guerrillaCount <= policeCount
      ? ["guerrilla", "police"]
      : ["police", "guerrilla"];

  for (const teamId of sorted) {
    if (room.teams[teamId].length < room.maxPlayersPerTeam) {
      return teamId;
    }
  }

  return null;
};

const persistRoom = async (room: Room): Promise<void> => {
  room.updatedAt = new Date().toISOString();
  await redisClient.set(buildRoomKey(room.roomCode), JSON.stringify(room));
};

const readRoom = async (roomCode: string): Promise<Room | null> => {
  const payload = await redisClient.get(buildRoomKey(normalizeCode(roomCode)));

  if (!payload) {
    return null;
  }

  return JSON.parse(payload) as Room;
};

const toPublicRoom = (room: Room): PublicRoom => {
  const teams = TEAM_IDS.reduce((result, teamId) => {
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
  }, {} as PublicRoom["teams"]);

  return {
    roomCode: room.roomCode,
    handlerId: room.handlerId,
    status: room.status,
    maxPlayersPerTeam: room.maxPlayersPerTeam,
    totalPlayers: Object.keys(room.players).length,
    teams,
  };
};

export const createRoom = async (
  playerId: string,
  playerName: string,
): Promise<RoomActionResult> => {
  ensurePlayerInput(playerId, playerName);

  const roomCode = await generateRoomCode();
  const now = new Date().toISOString();

  const room: Room = {
    roomCode,
    handlerId: playerId.trim(),
    status: "lobby",
    maxPlayersPerTeam: MAX_PLAYERS_PER_TEAM,
    createdAt: now,
    updatedAt: now,
    players: {
      [playerId.trim()]: {
        id: playerId.trim(),
        name: playerName.trim(),
        team: "guerrilla",
        joinedAt: now,
      },
    },
    teams: {
      guerrilla: [playerId.trim()],
      police: [],
    },
  };

  await persistRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: "guerrilla",
  };
};

export const joinRoom = async (
  roomCode: string,
  playerId: string,
  playerName: string,
): Promise<RoomActionResult> => {
  ensurePlayerInput(playerId, playerName);

  const room = await readRoom(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  const normalizedPlayerId = playerId.trim();
  const normalizedPlayerName = playerName.trim();
  const existingPlayer = room.players[normalizedPlayerId];

  if (existingPlayer) {
    existingPlayer.name = normalizedPlayerName;
    await persistRoom(room);

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

  await persistRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam,
  };
};

export const getRoom = async (roomCode: string): Promise<PublicRoom> => {
  const room = await readRoom(roomCode);

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

  const room = await readRoom(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  const player = room.players[playerId.trim()];

  if (!player) {
    throw new Error("Player is not part of this room.");
  }

  const nextTeam: TeamId = toTeam ?? (player.team === "guerrilla" ? "police" : "guerrilla");

  if (nextTeam === player.team) {
    return {
      room: toPublicRoom(room),
      assignedTeam: player.team,
    };
  }

  if (room.teams[nextTeam].length >= room.maxPlayersPerTeam) {
    throw new Error(`${TEAM_NAMES[nextTeam]} team is already full.`);
  }

  room.teams[player.team] = room.teams[player.team].filter((id) => id !== player.id);
  room.teams[nextTeam].push(player.id);
  player.team = nextTeam;

  await persistRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: nextTeam,
  };
};
