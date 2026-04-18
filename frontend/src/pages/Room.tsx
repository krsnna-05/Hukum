import { Crown, RefreshCcw, Repeat2, Shield, Users } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useLocation, useParams } from "react-router";
import Navbar from "../components/Navbar";
import { useRoomStore } from "../store/roomStore";
import { useUserStore } from "../store/userStore";
import type { TeamId } from "../types/room";

const Room = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const userId = useUserStore((state) => state.userId);
  const playerName = useUserStore((state) => state.playerName);
  const activeRoom = useRoomStore((state) => state.activeRoom);
  const isLoading = useRoomStore((state) => state.isLoading);
  const error = useRoomStore((state) => state.error);
  const fetchRoom = useRoomStore((state) => state.fetchRoom);
  const joinRoom = useRoomStore((state) => state.joinRoom);
  const switchTeam = useRoomStore((state) => state.switchTeam);
  const params = new URLSearchParams(location.search);
  const status = params.get("status") ?? "lobby";

  const normalizedCode = roomCode?.toUpperCase() ?? "";

  useEffect(() => {
    if (!normalizedCode || !playerName) {
      return;
    }

    void joinRoom(userId, playerName, normalizedCode);
  }, [joinRoom, normalizedCode, playerName, userId]);

  useEffect(() => {
    if (!normalizedCode) {
      return;
    }

    void fetchRoom(normalizedCode);
    const timer = window.setInterval(() => {
      void fetchRoom(normalizedCode);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [fetchRoom, normalizedCode]);

  const currentPlayer = useMemo(() => {
    if (!activeRoom) {
      return null;
    }

    const players = [
      ...activeRoom.teams.guerrilla.players,
      ...activeRoom.teams.police.players,
    ];

    return players.find((player) => player.id === userId) ?? null;
  }, [activeRoom, userId]);

  const otherTeam: TeamId | null =
    currentPlayer?.team === "guerrilla"
      ? "police"
      : currentPlayer?.team === "police"
        ? "guerrilla"
        : null;

  const targetTeamFull = otherTeam
    ? activeRoom
      ? activeRoom.teams[otherTeam].players.length >=
        activeRoom.teams[otherTeam].capacity
      : false
    : false;

  const handleSwitch = async () => {
    if (!activeRoom || !currentPlayer || !otherTeam) {
      return;
    }

    await switchTeam(activeRoom.roomCode, currentPlayer.id, otherTeam);
  };

  if (!playerName) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%),linear-gradient(180deg,#0f4a2f_0%,#0b2f21_100%)] text-emerald-50">
        <Navbar />
        <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-4xl border border-white/12 bg-black/20 p-6 backdrop-blur-md sm:p-8">
            <p className="text-sm text-amber-100/90">
              Set your name in home page before joining a room.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-amber-300 px-4 text-sm font-semibold text-slate-950"
            >
              Go to home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%),linear-gradient(180deg,#0f4a2f_0%,#0b2f21_100%)] text-emerald-50">
      <Navbar />

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-4xl border border-white/12 bg-black/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-md sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-50/55">
                Room lobby
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {activeRoom?.roomCode ?? roomCode ?? "Unknown room"}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">
                Status <span className="font-semibold text-white">{status}</span>. Creator is room handler.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (normalizedCode) {
                  void fetchRoom(normalizedCode);
                }
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-sm"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-emerald-50/55">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Lobby capacity
              </span>
              <span>{activeRoom?.totalPlayers ?? 0}/8</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-amber-100/90">
                  <span>Guerrilla</span>
                  <span>{activeRoom?.teams.guerrilla.players.length ?? 0}/4</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-amber-300 transition-all"
                    style={{
                      width: `${((activeRoom?.teams.guerrilla.players.length ?? 0) / 4) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-cyan-100/90">
                  <span>Police</span>
                  <span>{activeRoom?.teams.police.players.length ?? 0}/4</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-cyan-300 transition-all"
                    style={{
                      width: `${((activeRoom?.teams.police.players.length ?? 0) / 4) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {currentPlayer && otherTeam ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-sm text-emerald-50/80">
                You are in <span className="font-semibold text-white">{currentPlayer.team}</span>.
              </p>
              <button
                type="button"
                onClick={handleSwitch}
                disabled={isLoading || targetTeamFull}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Repeat2 className="h-4 w-4" />
                {targetTeamFull
                  ? `${otherTeam} full`
                  : `Switch to ${otherTeam}`}
              </button>
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {["guerrilla", "police"].map((teamKey) => {
              const teamId = teamKey as TeamId;
              const team = activeRoom?.teams[teamId];

              return (
                <article
                  key={teamId}
                  className="rounded-2xl border border-white/10 bg-black/25 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">{team?.name ?? teamId}</h2>
                    <span className="text-xs uppercase tracking-[0.16em] text-emerald-50/60">
                      {team?.players.length ?? 0}/4
                    </span>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {(team?.players ?? []).map((player) => (
                      <li
                        key={player.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                      >
                        <span className="text-sm text-white">{player.name}</span>
                        <div className="flex items-center gap-2">
                          {player.isHandler ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100">
                              <Crown className="h-3 w-3" />
                              Handler
                            </span>
                          ) : null}

                          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100">
                            <Shield className="h-3 w-3" />
                            {player.team}
                          </span>
                        </div>
                      </li>
                    ))}

                    {Array.from({ length: Math.max(0, 4 - (team?.players.length ?? 0)) }).map((_, index) => (
                      <li
                        key={`${teamId}-slot-${index}`}
                        className="rounded-xl border border-dashed border-white/15 px-3 py-2 text-sm text-emerald-50/45"
                      >
                        Waiting for player...
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          {error ? <p className="mt-4 text-sm text-rose-200">{error}</p> : null}
        </div>
      </section>
    </main>
  );
};

export default Room;
