import type { Room } from "../../types/room";

type TeamScoreBoardProps = {
  room: Room | null;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const TeamScoreBoard = ({ room }: TeamScoreBoardProps) => {
  const bidPoints = room?.teams?.bid?.points ?? 0;
  const challengePoints = room?.teams?.challenge?.points ?? 0;
  const targetScore = 50;
  const leader =
    bidPoints === challengePoints
      ? null
      : bidPoints > challengePoints
        ? "Aces"
        : "Rogues";
  const bidProgress = clamp((bidPoints / targetScore) * 100, 0, 100);
  const challengeProgress = clamp(
    (challengePoints / targetScore) * 100,
    0,
    100,
  );
  const gameFinished =
    bidPoints >= targetScore || challengePoints >= targetScore;

  return (
    <section className="mt-4 rounded-3xl border border-white/12 bg-[linear-gradient(145deg,rgba(2,6,23,0.72),rgba(15,23,42,0.55))] p-4 shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-md sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/55">
            Team points
          </p>
          <h2 className="mt-1 text-base font-semibold text-white sm:text-lg">
            First to 50 wins
          </h2>
        </div>
        <div className="text-xs text-emerald-50/75 sm:text-sm">
          Attack success: <span className="font-semibold text-white">+bid</span>
          , defense success:{" "}
          <span className="font-semibold text-white">+2 x bid</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em]">
          <span className="text-amber-100">Aces</span>
          <span className="text-white/60">Target {targetScore}</span>
          <span className="text-cyan-100">Rogues</span>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-100/75">
              <span>Aces</span>
              <span>{bidPoints}/50</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-amber-300 shadow-[0_0_24px_rgba(252,211,77,0.28)] transition-all duration-300"
                style={{ width: `${bidProgress}%` }}
              />
            </div>
          </div>

          <div className="mx-auto rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            vs
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-cyan-100/75">
              <span>Rogues</span>
              <span>{challengePoints}/50</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,0.28)] transition-all duration-300"
                style={{ width: `${challengeProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <span className="rounded-full border border-amber-300/30 bg-amber-300/15 px-3 py-1 text-amber-100">
            Aces: {bidPoints}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-emerald-50/70">
            {gameFinished
              ? `${leader} reached 50`
              : leader
                ? `${leader} lead`
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

export default TeamScoreBoard;
