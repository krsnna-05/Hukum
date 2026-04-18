import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserState = {
  userId: string;
  playerName: string | null;
  setPlayerName: (name: string) => void;
  setUserId: (id: string) => void;
  clearPlayerName: () => void;
};

const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ");

const createUserId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `user-${Math.random().toString(36).slice(2, 10)}`;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: createUserId(),
      playerName: null,
      setPlayerName: (name) => {
        const normalized = normalizeName(name);

        if (!normalized) {
          set({ playerName: null });
          return;
        }

        set({ playerName: normalized });
      },
      setUserId: (id) => set({ userId: id }),
      clearPlayerName: () => set({ playerName: null }),
    }),
    {
      name: "hukum-user-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
