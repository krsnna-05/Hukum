import { useEffect, useMemo } from "react";
import { Link, useLocation, useParams } from "react-router";
import LobbyCapacity from "../components/Room/LobbyCapacity";
import Navbar from "../components/Navbar";
import RoomHeader from "../components/Room/RoomHeader";
import RoomReadiness from "../components/Room/RoomReadiness";
import TeamTugOfWar from "../components/Room/TeamTugOfWar";
import TeamColumns from "../components/Room/TeamColumns";
import TeamSwitchPanel from "../components/Room/TeamSwitchPanel";
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
      ...(activeRoom.teams?.bid?.players ?? []),
      ...(activeRoom.teams?.challenge?.players ?? []),
    ];

    return players.find((player) => player.id === userId) ?? null;
  }, [activeRoom, userId]);

  const otherTeam: TeamId | null =
    currentPlayer?.team === "bid"
      ? "challenge"
      : currentPlayer?.team === "challenge"
        ? "bid"
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
          <RoomHeader
            roomCode={activeRoom?.roomCode ?? roomCode ?? "Unknown room"}
            status={status}
            onRefresh={() => {
              if (normalizedCode) {
                void fetchRoom(normalizedCode);
              }
            }}
          />

          <RoomReadiness room={activeRoom} />

          <TeamTugOfWar room={activeRoom} />

          <LobbyCapacity room={activeRoom} />

          {currentPlayer && otherTeam ? (
            <TeamSwitchPanel
              currentPlayer={currentPlayer}
              otherTeam={otherTeam}
              isLoading={isLoading}
              targetTeamFull={targetTeamFull}
              onSwitch={() => {
                void handleSwitch();
              }}
            />
          ) : null}

          <TeamColumns room={activeRoom} />

          {error ? <p className="mt-4 text-sm text-rose-200">{error}</p> : null}
        </div>
      </section>
    </main>
  );
};

export default Room;
