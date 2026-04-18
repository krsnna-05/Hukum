import type { Room, TeamId } from "../types/room";

import { API_BASE_URL } from "./baseUrl";

type ApiResult = {
  room: Room;
  assignedTeam?: TeamId;
};

type HttpMethod = "GET" | "POST";

const request = async <TResponse>(
  path: string,
  method: HttpMethod,
  body?: unknown,
): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & TResponse;

  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
};

export const createRoomRequest = async (
  playerId: string,
  playerName: string,
): Promise<ApiResult> => {
  return request<ApiResult>("/api/rooms/create", "POST", {
    playerId,
    playerName,
  });
};

export const joinRoomRequest = async (
  roomCode: string,
  playerId: string,
  playerName: string,
): Promise<ApiResult> => {
  return request<ApiResult>("/api/rooms/join", "POST", {
    roomCode,
    playerId,
    playerName,
  });
};

export const getRoomRequest = async (roomCode: string): Promise<ApiResult> => {
  return request<ApiResult>(
    `/api/rooms/${encodeURIComponent(roomCode)}`,
    "GET",
  );
};

export const switchTeamRequest = async (
  roomCode: string,
  playerId: string,
  toTeam?: TeamId,
): Promise<ApiResult> => {
  return request<ApiResult>("/api/rooms/switch-team", "POST", {
    roomCode,
    playerId,
    toTeam,
  });
};

export const applyRoundResultRequest = async (
  roomCode: string,
  winningTeam: TeamId,
  bid: number,
): Promise<ApiResult> => {
  return request<ApiResult>("/api/rooms/round-result", "POST", {
    roomCode,
    winningTeam,
    bid,
  });
};

export const startGameRequest = async (
  roomCode: string,
  playerId: string,
): Promise<ApiResult> => {
  return request<ApiResult>("/api/rooms/start-game", "POST", {
    roomCode,
    playerId,
  });
};

export const placeBidRequest = async (
  roomCode: string,
  playerId: string,
  bid: number,
): Promise<ApiResult> => {
  return request<ApiResult>("/api/rooms/place-bid", "POST", {
    roomCode,
    playerId,
    bid,
  });
};

export const selectTrumpRequest = async (
  roomCode: string,
  playerId: string,
  trumpSuit: string,
): Promise<ApiResult> => {
  return request<ApiResult>("/api/rooms/select-trump", "POST", {
    roomCode,
    playerId,
    trumpSuit,
  });
};

export const setPlayingStateRequest = async (
  roomCode: string,
  playerId: string,
  isPlaying: boolean,
): Promise<ApiResult> => {
  return request<ApiResult>("/api/rooms/playing-state", "POST", {
    roomCode,
    playerId,
    isPlaying,
  });
};

export const playCardRequest = async (
  roomCode: string,
  playerId: string,
  cardCode: string,
): Promise<ApiResult> => {
  return request<ApiResult>("/api/rooms/play-card", "POST", {
    roomCode,
    playerId,
    cardCode,
  });
};
