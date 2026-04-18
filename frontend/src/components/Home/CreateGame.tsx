import { ArrowRight, Copy, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useRoomStore } from "../../store/roomStore";
import { useUserStore } from "../../store/userStore";

const CreateGame = () => {
  const hostName = useUserStore((state) => state.playerName);
  const roomCode = useRoomStore((state) => state.activeRoomCode);
  const requestCreateRoom = useRoomStore((state) => state.requestCreateRoom);
  const [isCopied, setIsCopied] = useState(false);
  const canCreate = Boolean(hostName);

  const handleCreate = () => {
    requestCreateRoom();
    setIsCopied(false);
  };

  const handleCopy = async () => {
    try {
      if (!roomCode) {
        return;
      }

      await window.navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1400);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/12 bg-black/20 p-5 text-emerald-50 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">Create Room</h2>
      <p className="mt-1 text-sm text-emerald-50/75">
        Start a room and share the code with others.
      </p>

      <button
        type="button"
        onClick={handleCreate}
        disabled={!canCreate}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <PlusCircle className="h-4 w-4" />
        Request Room
        <ArrowRight className="h-4 w-4" />
      </button>

      {hostName ? (
        <div className="mt-4 rounded-xl border border-white/12 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/45">
            Room code
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-xl font-bold tracking-[0.12em] text-white">
              {roomCode ?? "Waiting for server"}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!roomCode}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 text-xs text-emerald-50 transition hover:bg-white/10"
            >
              <Copy className="h-3.5 w-3.5" />
              {isCopied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-amber-100/80">
          Set profile name first to create a room.
        </p>
      )}
    </section>
  );
};

export default CreateGame;
