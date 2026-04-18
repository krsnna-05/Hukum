import type { TeamId } from "../../types/room";

export const TEAM_ORDER: TeamId[] = ["bid", "challenge"];

export const TEAM_COLORS: Record<TeamId, { bar: string; text: string }> = {
  bid: {
    bar: "bg-amber-300",
    text: "text-amber-100/90",
  },
  challenge: {
    bar: "bg-cyan-300",
    text: "text-cyan-100/90",
  },
};
