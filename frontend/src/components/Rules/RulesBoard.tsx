import {
  Flag,
  Gavel,
  Layers,
  Play,
  ShieldCheck,
  Swords,
  Trophy,
} from "lucide-react";

const RulesBoard = () => {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="rounded-3xl border border-white/12 bg-black/20 p-5 text-emerald-50 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-md md:col-span-2">
        <div className="flex items-center gap-2 text-white">
          <Flag className="h-4 w-4 text-amber-300" />
          <h2 className="text-lg font-semibold">Match Objective</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-emerald-50/80">
          Hukum is a real-time team card game. Win tricks, respect trump and
          lead suit rules, and satisfy the highest bidder's target to win the
          match.
        </p>
      </article>

      <article className="rounded-3xl border border-white/12 bg-black/20 p-5 text-emerald-50 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <div className="flex items-center gap-2 text-white">
          <Layers className="h-4 w-4 text-cyan-300" />
          <h3 className="text-base font-semibold">Game Phases</h3>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-emerald-50/80">
          <li>1. Waiting: players join room (minimum 4).</li>
          <li>2. Bidding: players place bids.</li>
          <li>3. Playing: trick-by-trick card play.</li>
          <li>4. Finished: hands complete, winner decided.</li>
        </ul>
      </article>

      <article className="rounded-3xl border border-white/12 bg-black/20 p-5 text-emerald-50 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <div className="flex items-center gap-2 text-white">
          <Gavel className="h-4 w-4 text-amber-300" />
          <h3 className="text-base font-semibold">Bidding + Trump</h3>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-emerald-50/80">
          <li>Highest bidder becomes leader.</li>
          <li>Leader selects trump suit (hukum).</li>
          <li>Bidder team commits to target trick count.</li>
        </ul>
      </article>

      <article className="rounded-3xl border border-white/12 bg-black/20 p-5 text-emerald-50 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <div className="flex items-center gap-2 text-white">
          <Play className="h-4 w-4 text-cyan-300" />
          <h3 className="text-base font-semibold">Turn Rules</h3>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-emerald-50/80">
          <li>Lead player may play any card.</li>
          <li>Lead suit is set by first card.</li>
          <li>Others must follow lead suit if available.</li>
          <li>If unable to follow, any card may be played.</li>
        </ul>
      </article>

      <article className="rounded-3xl border border-white/12 bg-black/20 p-5 text-emerald-50 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <div className="flex items-center gap-2 text-white">
          <Swords className="h-4 w-4 text-amber-300" />
          <h3 className="text-base font-semibold">
            How Trick Winner Is Chosen
          </h3>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-emerald-50/80">
          <li>Any trump card beats non-trump cards.</li>
          <li>If multiple trumps, highest trump wins.</li>
          <li>If no trump, highest lead-suit card wins.</li>
        </ul>
      </article>

      <article className="rounded-3xl border border-white/12 bg-black/20 p-5 text-emerald-50 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <div className="flex items-center gap-2 text-white">
          <Trophy className="h-4 w-4 text-cyan-300" />
          <h3 className="text-base font-semibold">Win Condition</h3>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-emerald-50/80">
          <li>Bidder team must meet or exceed committed tricks.</li>
          <li>If bidder team fails, opponent team wins.</li>
          <li>Game ends after all hands are played.</li>
        </ul>
      </article>

      <article className="rounded-3xl border border-white/12 bg-black/20 p-5 text-emerald-50 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-md md:col-span-2">
        <div className="flex items-center gap-2 text-white">
          <ShieldCheck className="h-4 w-4 text-amber-300" />
          <h3 className="text-base font-semibold">Fair Play Notes</h3>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-emerald-50/80">
          <li>Backend is server-authoritative and validates every move.</li>
          <li>Players only see their own cards.</li>
          <li>Client only renders state and submits actions.</li>
        </ul>
      </article>
    </section>
  );
};

export default RulesBoard;
