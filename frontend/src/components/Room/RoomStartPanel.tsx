import { LockKeyhole, Play } from "lucide-react";
import type { Room } from "../../types/room";

type RoomStartPanelProps = {
  room: Room | null;
  isHandler: boolean;
  isLoading: boolean;
  onStart: () => void;
};

const RoomStartPanel = ({
  room,
  isHandler,
  isLoading,
  onStart,
}: RoomStartPanelProps) => {
  const canStart = room?.canStartGame ?? false;
  const totalPlayers = room?.totalPlayers ?? 0;
  const maxPlayers = room?.maxPlayersTotal ?? 8;

  return (
    <section className="mt-4 rounded-3xl border border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(2,6,23,0.62))] p-4 shadow-[0_18px_40px_rgba(2,6,23,0.28)] backdrop-blur-md sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/55">
            Lobby control
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Start bidding round
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/75">
            {canStart
              ? "Teams are balanced and full. Start the round to shuffle, deal cards, and move into bidding."
              : "Fill both teams evenly before the handler can start the round."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-emerald-50/70">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            {totalPlayers}/{maxPlayers} players
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            {room?.teams.bid.players.length ?? 0}v
            {room?.teams.challenge.players.length ?? 0}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-amber-100/80">
          <LockKeyhole className="h-4 w-4" />
          {isHandler ? "You are the handler" : "Only the handler can start"}
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={!canStart || !isHandler || isLoading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Play className="h-4 w-4" />
          Start bidding
        </button>
      </div>
    </section>
  );
};

export default RoomStartPanel;
