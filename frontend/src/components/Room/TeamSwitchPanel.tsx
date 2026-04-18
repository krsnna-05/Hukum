import { Repeat2 } from "lucide-react";
import type { RoomPlayer, TeamId } from "../../types/room";

type TeamSwitchPanelProps = {
  currentPlayer: RoomPlayer;
  otherTeam: TeamId;
  isLoading: boolean;
  targetTeamFull: boolean;
  onSwitch: () => void;
};

const TeamSwitchPanel = ({
  currentPlayer,
  otherTeam,
  isLoading,
  targetTeamFull,
  onSwitch,
}: TeamSwitchPanelProps) => {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-emerald-50/80">
        You are in{" "}
        <span className="font-semibold text-white">{currentPlayer.team}</span>.
      </p>
      <button
        type="button"
        onClick={onSwitch}
        disabled={isLoading || targetTeamFull}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <Repeat2 className="h-4 w-4" />
        {targetTeamFull ? `${otherTeam} full` : `Switch to ${otherTeam}`}
      </button>
    </div>
  );
};

export default TeamSwitchPanel;
