import { ScrollText, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import RulesBoard from "../components/Rules/RulesBoard";

const Rules = () => {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-4 text-stone-100 sm:px-6 lg:px-8">
      <Navbar />

      <div className="relative mx-auto mt-6 w-full max-w-4xl">
        <section className="mb-6 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-amber-100/80 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Rule Book
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
            Hukum Rules
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm text-emerald-50/75 sm:text-base">
            Quick rule reference for bidding, trump selection, trick resolution,
            and winning conditions.
          </p>

          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-xs text-emerald-50/80">
            <ScrollText className="h-3.5 w-3.5 text-cyan-300" />
            Based on project specification
          </div>
        </section>

        <RulesBoard />
      </div>
    </main>
  );
};

export default Rules;
