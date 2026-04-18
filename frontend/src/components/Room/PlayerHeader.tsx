import { Users } from "lucide-react";
import type { RoomPlayer, TeamId } from "../../types/room";

type PlayerHeaderProps = {
  player: RoomPlayer | null;
  teamName?: string;
};

const TEAM_COLORS: Record<
  TeamId,
  { bg: string; border: string; text: string }
> = {
  bid: {
    bg: "bg-amber-300/15",
    border: "border-amber-300/40",
    text: "text-amber-100",
  },
  challenge: {
    bg: "bg-cyan-300/15",
    border: "border-cyan-300/40",
    text: "text-cyan-100",
  },
};

const PlayerHeader = ({ player, teamName }: PlayerHeaderProps) => {
  if (!player) {
    return null;
  }

  const colors = TEAM_COLORS[player.team];

  return (
    <div
      className={[
        "rounded-2xl border p-4 backdrop-blur-sm",
        colors.bg,
        colors.border,
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <p
            className={[
              "text-xs uppercase tracking-[0.14em]",
              colors.text,
            ].join(" ")}
          >
            You are playing as
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-lg font-bold text-white">{player.name}</p>
            <span className="text-xs text-white/60">•</span>
            <p className={["text-sm font-semibold", colors.text].join(" ")}>
              {teamName || player.team}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerHeader;
