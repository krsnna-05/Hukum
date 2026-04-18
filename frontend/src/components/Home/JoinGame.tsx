import { ArrowRight, Hash, LogIn } from "lucide-react";
import { useNavigate } from "react-router";
import { useRoomStore } from "../../store/roomStore";
import { useUserStore } from "../../store/userStore";

const JoinGame = () => {
  const navigate = useNavigate();
  const playerId = useUserStore((state) => state.userId);
  const playerName = useUserStore((state) => state.playerName);
  const roomCode = useRoomStore((state) => state.roomCodeInput);
  const setRoomCodeInput = useRoomStore((state) => state.setRoomCodeInput);
  const joinRoom = useRoomStore((state) => state.joinRoom);
  const isLoading = useRoomStore((state) => state.isLoading);
  const error = useRoomStore((state) => state.error);

  const canJoin = Boolean(playerName && roomCode.trim());

  const handleJoin = async () => {
    if (!canJoin) {
      return;
    }

    const joinedCode = await joinRoom(playerId, playerName ?? "", roomCode);

    if (joinedCode) {
      navigate(`/room/${encodeURIComponent(joinedCode)}?status=lobby`);
    }
  };

  return (
    <section className="rounded-3xl border border-white/12 bg-black/20 p-5 text-emerald-50 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-md">
      <div className="flex items-center gap-2">
        <LogIn className="h-4 w-4 text-cyan-200" />
        <h2 className="text-lg font-semibold text-white">Join Room</h2>
      </div>
      <p className="mt-1 text-sm text-emerald-50/75">
        Enter room code and join with your profile name.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-emerald-50/45">
            Room code
          </span>
          <div className="relative">
            <input
              value={roomCode}
              onChange={(event) => setRoomCodeInput(event.target.value)}
              placeholder="HUK-7K4D"
              className="h-11 w-full rounded-xl border border-white/12 bg-black/25 px-3 pr-10 text-sm tracking-[0.24em] text-white outline-none placeholder:text-emerald-50/35 focus:border-cyan-300/50"
              maxLength={8}
            />
            <Hash className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200/80" />
          </div>
        </label>

        <button
          type="button"
          onClick={handleJoin}
          disabled={!canJoin || isLoading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Joining..." : "Join room"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {!playerName ? (
        <p className="mt-3 text-sm text-amber-100/80">
          Set profile name first to join a room.
        </p>
      ) : null}

      {error ? <p className="mt-3 text-sm text-rose-200">{error}</p> : null}
    </section>
  );
};

export default JoinGame;
