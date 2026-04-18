import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import BiddingBoard from "../components/Room/BiddingBoard";
import LobbyCapacity from "../components/Room/LobbyCapacity";
import PlayingBoard from "../components/Room/PlayingBoard";
import PlayerHeader from "../components/Room/PlayerHeader";
import RoomHeader from "../components/Room/RoomHeader";
import RoomStartPanel from "../components/Room/RoomStartPanel";
import RoomReadiness from "../components/Room/RoomReadiness";
import TeamScoreBoard from "../components/Room/TeamTugOfWar";
import TeamColumns from "../components/Room/TeamColumns";
import TeamSwitchPanel from "../components/Room/TeamSwitchPanel";
import { subscribeRoomUpdates } from "../socket/roomSocket";
import { useRoomStore } from "../store/roomStore";
import { useUserStore } from "../store/userStore";
import type { TeamId } from "../types/room";

const Room = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = useUserStore((state) => state.userId);
  const playerName = useUserStore((state) => state.playerName);
  const activeRoom = useRoomStore((state) => state.activeRoom);
  const isLoading = useRoomStore((state) => state.isLoading);
  const error = useRoomStore((state) => state.error);
  const fetchRoom = useRoomStore((state) => state.fetchRoom);
  const joinRoom = useRoomStore((state) => state.joinRoom);
  const startGame = useRoomStore((state) => state.startGame);
  const placeBid = useRoomStore((state) => state.placeBid);
  const playCard = useRoomStore((state) => state.playCard);
  const selectTrump = useRoomStore((state) => state.selectTrump);
  const switchTeam = useRoomStore((state) => state.switchTeam);
  const setActiveRoom = useRoomStore((state) => state.setActiveRoom);
  const params = new URLSearchParams(location.search);
  const status = params.get("status") ?? "lobby";

  const normalizedCode = roomCode?.toUpperCase() ?? "";
  const isLobby = activeRoom?.status === "lobby";
  const isPlaying = activeRoom?.status === "playing";
  const isFinished = activeRoom?.status === "finished";

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
    const unsubscribe = subscribeRoomUpdates(normalizedCode, (room) => {
      setActiveRoom(room);
    });

    return () => unsubscribe();
  }, [fetchRoom, normalizedCode, setActiveRoom]);

  useEffect(() => {
    if (!activeRoom?.status || !roomCode) {
      return;
    }

    if (status !== activeRoom.status) {
      navigate(
        `/room/${encodeURIComponent(roomCode)}?status=${activeRoom.status}`,
        {
          replace: true,
        },
      );
    }
  }, [activeRoom?.status, navigate, roomCode, status]);

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

  const handleStartGame = async () => {
    if (!activeRoom) {
      return;
    }

    await startGame(activeRoom.roomCode, userId);
  };

  if (!playerName) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%),linear-gradient(180deg,#0f4a2f_0%,#0b2f21_100%)] text-emerald-50">
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
        </div>

        <PlayerHeader
          player={currentPlayer}
          teamName={
            currentPlayer?.team
              ? activeRoom?.teams[currentPlayer.team]?.name
              : undefined
          }
        />

        <div className="rounded-4xl border border-white/12 bg-black/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-md sm:p-8">
          {isLobby ? <RoomReadiness room={activeRoom} /> : null}

          {isLobby ? (
            <RoomStartPanel
              room={activeRoom}
              isHandler={activeRoom.handlerId === userId}
              isLoading={isLoading}
              onStart={() => {
                void handleStartGame();
              }}
            />
          ) : null}

          {isLobby || isPlaying || isFinished ? (
            <TeamScoreBoard room={activeRoom} />
          ) : null}

          {isLobby ? <LobbyCapacity room={activeRoom} /> : null}

          {isLobby && currentPlayer && otherTeam ? (
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

          {activeRoom?.status === "bid" ? (
            <BiddingBoard
              room={activeRoom}
              currentPlayerId={userId}
              isLoading={isLoading}
              onPlaceBid={(bid) => {
                void placeBid(activeRoom.roomCode, userId, bid);
              }}
              onSelectTrump={(trumpSuit) => {
                void selectTrump(activeRoom.roomCode, userId, trumpSuit);
              }}
            />
          ) : null}

          {isPlaying ? (
            <PlayingBoard
              room={activeRoom}
              currentPlayerId={userId}
              isLoading={isLoading}
              onPlayCard={(cardCode) => {
                if (!activeRoom) {
                  return;
                }

                void playCard(activeRoom.roomCode, userId, cardCode);
              }}
            />
          ) : null}

          {isLobby ? <TeamColumns room={activeRoom} /> : null}

          {isFinished ? (
            <p className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
              Match finished. A team reached 50 points.
            </p>
          ) : null}

          {error ? <p className="mt-4 text-sm text-rose-200">{error}</p> : null}
        </div>
      </section>
    </main>
  );
};

export default Room;
