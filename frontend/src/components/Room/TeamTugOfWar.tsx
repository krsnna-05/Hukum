import type { Room } from "../../types/room";

type TeamTugOfWarProps = {
  room: Room | null;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const TeamTugOfWar = ({ room }: TeamTugOfWarProps) => {
  const bidPoints = room?.teams?.bid?.points ?? 0;
  const challengePoints = room?.teams?.challenge?.points ?? 0;
  const diff = bidPoints - challengePoints;
  const leadingTeam = diff === 0 ? null : diff > 0 ? "Aces" : "Rogues";
  const totalMagnitude = Math.max(
    10,
    Math.abs(bidPoints) + Math.abs(challengePoints),
    Math.abs(diff),
  );
  const markerPosition = clamp(50 + (diff / totalMagnitude) * 40, 8, 92);

  return (
    <section className="mt-4 rounded-3xl border border-white/12 bg-[linear-gradient(145deg,rgba(2,6,23,0.72),rgba(15,23,42,0.55))] p-4 shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-md sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/55">
            Team points
          </p>
          <h2 className="mt-1 text-base font-semibold text-white sm:text-lg">
            Tug of war board
          </h2>
        </div>
        <div className="text-xs text-emerald-50/75 sm:text-sm">
          Round win: <span className="font-semibold text-white">+bid</span>,
          loss: <span className="font-semibold text-white">-(2 x bid)</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em]">
          <span className="text-amber-100">Aces</span>
          <span className="text-cyan-100">Rogues</span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
          <div className="absolute inset-y-2 left-2 right-2 rounded-full bg-cyan-400/35" />
          <div
            className="absolute inset-y-2 left-2 rounded-full bg-amber-300/85 shadow-[0_0_30px_rgba(252,211,77,0.32)] transition-all duration-300"
            style={{ width: `calc(${markerPosition}% - 8px)` }}
          />

          <div className="absolute inset-y-2 left-2 right-2 rounded-full opacity-45 [background:repeating-linear-gradient(135deg,rgba(255,255,255,0.12)_0_8px,transparent_8px_16px)]" />

          <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-white/55" />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-slate-950" />

          <div
            className="absolute top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white text-xs font-black text-slate-900 shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-all duration-300 sm:h-9 sm:w-9"
            style={{ left: `${markerPosition}%` }}
          >
            ⚓
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <span className="rounded-full border border-amber-300/30 bg-amber-300/15 px-3 py-1 text-amber-100">
            Aces: {bidPoints}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-emerald-50/70">
            {leadingTeam
              ? `${leadingTeam} lead ${diff >= 0 ? `+${diff}` : diff}`
              : "Even match"}
          </span>
          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/15 px-3 py-1 text-cyan-100">
            Rogues: {challengePoints}
          </span>
        </div>
      </div>
    </section>
  );
};

export default TeamTugOfWar;
