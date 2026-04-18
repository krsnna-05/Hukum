import { create } from "zustand";

export type GamePhase = "waiting" | "bidding" | "playing" | "finished";
export type Suit = "spades" | "hearts" | "diamonds" | "clubs";

type RoomAction = "created" | "joined" | null;

type RoomState = {
  activeRoomCode: string | null;
  roomCodeInput: string;
  phase: GamePhase;
  playersCount: number;
  minPlayers: number;
  handsPerPlayer: number;
  trumpSuit: Suit | null;
  highestBidder: string | null;
  bids: Record<string, number>;
  leadSuit: Suit | null;
  lastAction: RoomAction;
  setRoomCodeInput: (value: string) => void;
  clearRoomCodeInput: () => void;
  requestCreateRoom: () => void;
  setActiveRoomCode: (roomCode: string) => void;
  joinRoom: (roomCode?: string) => void;
  setPhase: (phase: GamePhase) => void;
  setPlayersCount: (count: number) => void;
  setTrumpSuit: (suit: Suit | null) => void;
  setHighestBidder: (playerId: string | null) => void;
  setBid: (playerId: string, amount: number) => void;
  resetRoom: () => void;
};

const normalizeRoomCode = (value: string) => value.trim().toUpperCase();

const initialRoomState = {
  activeRoomCode: null,
  roomCodeInput: "",
  phase: "waiting" as GamePhase,
  playersCount: 1,
  minPlayers: 4,
  handsPerPlayer: 5,
  trumpSuit: null,
  highestBidder: null,
  bids: {},
  leadSuit: null,
  lastAction: null as RoomAction,
};

export const useRoomStore = create<RoomState>()((set, get) => ({
  ...initialRoomState,

  setRoomCodeInput: (value) =>
    set({ roomCodeInput: normalizeRoomCode(value), lastAction: null }),

  clearRoomCodeInput: () => set({ roomCodeInput: "", lastAction: null }),

  requestCreateRoom: () => {
    set({
      activeRoomCode: null,
      roomCodeInput: "",
      phase: "waiting",
      playersCount: 1,
      trumpSuit: null,
      highestBidder: null,
      bids: {},
      leadSuit: null,
      lastAction: "created",
    });
  },

  setActiveRoomCode: (roomCode) =>
    set({
      activeRoomCode: normalizeRoomCode(roomCode),
      roomCodeInput: normalizeRoomCode(roomCode),
    }),

  joinRoom: (roomCode) => {
    const codeToJoin = normalizeRoomCode(roomCode ?? get().roomCodeInput);

    if (!codeToJoin) {
      return;
    }

    set({
      activeRoomCode: codeToJoin,
      roomCodeInput: codeToJoin,
      phase: "waiting",
      playersCount: Math.max(get().playersCount, 1),
      lastAction: "joined",
    });
  },

  setPhase: (phase) => set({ phase }),

  setPlayersCount: (count) =>
    set({
      playersCount: Math.max(1, count),
    }),

  setTrumpSuit: (suit) => set({ trumpSuit: suit }),

  setHighestBidder: (playerId) => set({ highestBidder: playerId }),

  setBid: (playerId, amount) =>
    set((state) => ({
      bids: {
        ...state.bids,
        [playerId]: amount,
      },
    })),

  resetRoom: () => set({ ...initialRoomState }),
}));
