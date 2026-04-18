import { Sparkles } from "lucide-react";
import CreateGame from "../components/Home/CreateGame";
import EnterName from "../components/Home/EnterName";
import JoinGame from "../components/Home/JoinGame";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-4 text-stone-100 sm:px-6 lg:px-8">
      <Navbar />

      <div className="relative mx-auto mt-6 flex min-h-[calc(100vh-7rem)] w-full max-w-4xl flex-col justify-center gap-6">
        <section className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-amber-100/80 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Card Room
          </div>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.06em] text-white sm:text-6xl">
            Hukum
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-amber-100/85 sm:text-base">
            Real-time multiplayer card battles with a clean room flow and
            server-authoritative fairness.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-emerald-50/80">
            <span className="rounded-full border border-white/12 bg-black/20 px-3 py-1.5">
              Fast Room Setup
            </span>
            <span className="rounded-full border border-white/12 bg-black/20 px-3 py-1.5">
              Team Strategy Gameplay
            </span>
            <span className="rounded-full border border-white/12 bg-black/20 px-3 py-1.5">
              Fair Play Rules
            </span>
          </div>
          <p className="mx-auto mt-2 max-w-xl text-sm text-emerald-50/75 sm:text-base">
            Set your profile name, then create a room or join a room.
          </p>
        </section>

        <EnterName />

        <section className="grid gap-4 md:grid-cols-2">
          <CreateGame />
          <JoinGame />
        </section>
      </div>
    </main>
  );
};

export default Home;
