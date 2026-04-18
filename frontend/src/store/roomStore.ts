import { create } from "zustand";
import {
  applyRoundResultRequest,
  createRoomRequest,
  getRoomRequest,
  joinRoomRequest,
  setPlayingStateRequest,
  switchTeamRequest,
} from "../api/rooms";
import type { Room, TeamId } from "../types/room";

type RoomAction = "created" | "joined" | "switched" | null;

type RoomState = {
  activeRoom: Room | null;
  roomCodeInput: string;
  isLoading: boolean;
  error: string | null;
  lastAction: RoomAction;
  setRoomCodeInput: (value: string) => void;
  clearRoomCodeInput: () => void;
  createRoom: (playerId: string, playerName: string) => Promise<string | null>;
  joinRoom: (
    playerId: string,
    playerName: string,
    roomCode?: string,
  ) => Promise<string | null>;
  fetchRoom: (roomCode: string) => Promise<void>;
  switchTeam: (
    roomCode: string,
    playerId: string,
    toTeam?: TeamId,
  ) => Promise<void>;
  applyRoundResult: (
    roomCode: string,
    winningTeam: TeamId,
    bid: number,
  ) => Promise<void>;
  setPlayingState: (
    roomCode: string,
    playerId: string,
    isPlaying: boolean,
  ) => Promise<void>;
  clearError: () => void;
  resetRoom: () => void;
  setActiveRoom: (room: Room) => void;
};

const normalizeRoomCode = (value: string) => value.trim().toUpperCase();

const initialRoomState = {
  activeRoom: null,
  roomCodeInput: "",
  isLoading: false,
  error: null,
  lastAction: null as RoomAction,
};

export const useRoomStore = create<RoomState>()((set, get) => ({
  ...initialRoomState,

  setRoomCodeInput: (value) =>
    set({
      roomCodeInput: normalizeRoomCode(value),
      error: null,
      lastAction: null,
    }),

  clearRoomCodeInput: () =>
    set({ roomCodeInput: "", error: null, lastAction: null }),

  createRoom: async (playerId, playerName) => {
    if (!playerName.trim()) {
      set({ error: "Set your name first." });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const { room } = await createRoomRequest(playerId, playerName);
      set({
        activeRoom: room,
        roomCodeInput: room.roomCode,
        isLoading: false,
        lastAction: "created",
      });
      return room.roomCode;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create room.";
      set({ isLoading: false, error: message });
      return null;
    }
  },

  joinRoom: async (playerId, playerName, roomCode) => {
    const codeToJoin = normalizeRoomCode(roomCode ?? get().roomCodeInput);

    if (!codeToJoin) {
      set({ error: "Room code is required." });
      return null;
    }

    if (!playerName.trim()) {
      set({ error: "Set your name first." });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const { room } = await joinRoomRequest(codeToJoin, playerId, playerName);
      set({
        activeRoom: room,
        roomCodeInput: room.roomCode,
        isLoading: false,
        lastAction: "joined",
      });
      return room.roomCode;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to join room.";
      set({ isLoading: false, error: message });
      return null;
    }
  },

  fetchRoom: async (roomCode) => {
    const code = normalizeRoomCode(roomCode);

    if (!code) {
      return;
    }

    try {
      const { room } = await getRoomRequest(code);
      set({
        activeRoom: room,
        roomCodeInput: room.roomCode,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to fetch room.";
      set({ error: message });
    }
  },

  switchTeam: async (roomCode, playerId, toTeam) => {
    set({ isLoading: true, error: null });

    try {
      const { room } = await switchTeamRequest(roomCode, playerId, toTeam);
      set({
        activeRoom: room,
        isLoading: false,
        error: null,
        lastAction: "switched",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to switch team.";
      set({ isLoading: false, error: message });
    }
  },

  applyRoundResult: async (roomCode, winningTeam, bid) => {
    set({ isLoading: true, error: null });

    try {
      const { room } = await applyRoundResultRequest(
        roomCode,
        winningTeam,
        bid,
      );
      set({
        activeRoom: room,
        isLoading: false,
        error: null,
        lastAction: "switched",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to apply round result.";
      set({ isLoading: false, error: message });
    }
  },

  setPlayingState: async (roomCode, playerId, isPlaying) => {
    set({ isLoading: true, error: null });

    try {
      const { room } = await setPlayingStateRequest(
        roomCode,
        playerId,
        isPlaying,
      );
      set({
        activeRoom: room,
        isLoading: false,
        error: null,
        lastAction: "switched",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update playing state.";
      set({ isLoading: false, error: message });
    }
  },

  clearError: () => set({ error: null }),

  setActiveRoom: (room) =>
    set({
      activeRoom: room,
      roomCodeInput: room.roomCode,
      error: null,
    }),

  resetRoom: () => set({ ...initialRoomState }),
}));
