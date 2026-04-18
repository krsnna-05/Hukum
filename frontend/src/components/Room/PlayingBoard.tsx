import { Flag, Swords, Crown, Zap } from "lucide-react";
import { useMemo } from "react";
import { resolveApiUrl } from "../../api/baseUrl";
import type { Room, Suit, TeamId } from "../../types/room";
import { getCurrentTrickWinner } from "../../utils/cardPower";

type PlayingBoardProps = {
  room: Room | null;
  currentPlayerId: string;
  isLoading: boolean;
  onPlayCard: (cardCode: string) => void;
};

const SUIT_META: Record<
  Suit,
  { label: string; symbol: string; accent: string }
> = {
  spades: { label: "Spades", symbol: "S", accent: "text-slate-100" },
  hearts: { label: "Hearts", symbol: "H", accent: "text-rose-200" },
  diamonds: { label: "Diamonds", symbol: "D", accent: "text-cyan-200" },
  clubs: { label: "Clubs", symbol: "C", accent: "text-emerald-200" },
};

const SuitBadge = ({
  title,
  suit,
  icon,
}: {
  title: string;
  suit: Suit | null;
  icon: "lead" | "trump";
}) => {
  const meta = suit ? SUIT_META[suit] : null;

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-50/60">
        {title}
      </p>
      <div className="mt-1.5 flex items-center gap-2.5">
        <span
          className={[
            "inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold",
            meta?.accent ?? "text-emerald-50/55",
          ].join(" ")}
        >
          {meta?.symbol ?? "?"}
        </span>
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
            {icon === "lead" ? (
              <Flag className="h-3.5 w-3.5" />
            ) : (
              <Swords className="h-3.5 w-3.5" />
            )}
            {meta?.label ?? "Not set yet"}
          </p>
          <p className="text-[11px] text-emerald-50/60">
            {meta
              ? `${meta.label} is active`
              : "Waiting for first card of this trick"}
          </p>
        </div>
      </div>
    </div>
  );
};

const PlayingBoard = ({
  room,
  currentPlayerId,
  isLoading,
  onPlayCard,
}: PlayingBoardProps) => {
  const playerLookup = useMemo(() => {
    const entries = Object.values(room?.teams ?? {}).flatMap((team) =>
      team.players.map((player) => [player.id, player] as const),
    );

    return new Map(entries);
  }, [room?.teams]);

  const yourHand = room?.hands?.[currentPlayerId] ?? [];
  const currentTurnPlayerId = room?.playingPlayerId ?? null;
  const isYourTurn =
    room?.status === "playing" && currentTurnPlayerId === currentPlayerId;
  const allPlayers = room?.bidOrder ?? [];

  const teamStats = useMemo(() => {
    const highestBidderId = room?.highestBidderId;
    const contract = room?.highestBidValue ?? 0;

    const bidderTeam = (room?.teams?.bid?.players ?? []).some(
      (player) => player.id === highestBidderId,
    )
      ? ("bid" as TeamId)
      : (room?.teams?.challenge?.players ?? []).some(
            (player) => player.id === highestBidderId,
          )
        ? ("challenge" as TeamId)
        : null;

    if (!room || !bidderTeam || contract <= 0) {
      return null;
    }

    const defenderTeam: TeamId = bidderTeam === "bid" ? "challenge" : "bid";
    const attackersWon = room.teams[bidderTeam].players.reduce(
      (sum, player) => sum + (room.handsWon[player.id] ?? 0),
      0,
    );
    const defendersWon = room.teams[defenderTeam].players.reduce(
      (sum, player) => sum + (room.handsWon[player.id] ?? 0),
      0,
    );

    const totalPlayersCount = Math.max(room.bidOrder.length, 1);
    const remainingCardsTotal = Object.values(room.handCounts ?? {}).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalTricksInRound =
      (room.tricksCompleted ?? 0) +
      Math.ceil(remainingCardsTotal / totalPlayersCount);
    const defendersRequired = Math.max(totalTricksInRound - contract + 1, 0);

    return {
      bidderTeam,
      defenderTeam,
      contract,
      attackersWon,
      defendersWon,
      defendersRequired,
      totalTricksInRound,
    };
  }, [room]);

  const currentTrickWinner = useMemo(() => {
    if (!room || !room.trumpSuit || !room.leadSuit) {
      return null;
    }
    return getCurrentTrickWinner(
      room.currentHand ?? [],
      room.trumpSuit,
      room.leadSuit,
    );
  }, [room?.currentHand, room?.trumpSuit, room?.leadSuit]);

  return (
    <section className="mt-4 rounded-3xl border border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.72))] p-4 shadow-[0_18px_40px_rgba(2,6,23,0.28)] backdrop-blur-md sm:p-5">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/55">
          Playing phase
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">
          Play cards in turn and win tricks
        </h2>
        <p className="mt-2 text-sm text-emerald-50/70">
          Current turn:{" "}
          {currentTurnPlayerId
            ? (playerLookup.get(currentTurnPlayerId)?.name ?? "Unknown")
            : "Waiting"}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SuitBadge
          title="Lead suit"
          suit={room?.leadSuit ?? null}
          icon="lead"
        />
        <SuitBadge
          title="Trump suit"
          suit={room?.trumpSuit ?? null}
          icon="trump"
        />
      </div>

      {teamStats ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-amber-100/80">
              Attackers (
              {room?.teams?.[teamStats.bidderTeam]?.name ??
                teamStats.bidderTeam}
              )
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {teamStats.attackersWon}/{teamStats.contract} hands required to
              win
            </p>
          </div>
          <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/80">
              Defenders (
              {room?.teams?.[teamStats.defenderTeam]?.name ??
                teamStats.defenderTeam}
              )
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {teamStats.defendersWon}/{teamStats.defendersRequired} hands
              required to defend
            </p>
            <p className="mt-0.5 text-[11px] text-cyan-100/75">
              Out of {teamStats.totalTricksInRound} total tricks this round
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">Current trick</p>
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-50/60">
            Tricks completed: {room?.tricksCompleted ?? 0}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(room?.currentHand ?? []).map((move) => {
            const isWinner =
              currentTrickWinner?.playerId === move.playerId &&
              currentTrickWinner?.card.code === move.card.code;

            return (
              <div
                key={`${move.playerId}-${move.card.code}`}
                className={[
                  "w-22 rounded-lg border p-2 sm:w-24",
                  isWinner
                    ? "border-yellow-400/60 bg-yellow-400/15 shadow-[0_0_12px_rgba(250,204,21,0.3)]"
                    : "border-white/10 bg-black/25",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="truncate text-[10px] uppercase tracking-[0.14em] text-emerald-50/65">
                    {playerLookup.get(move.playerId)?.name ?? "Unknown"}
                  </p>
                  {isWinner && (
                    <Crown className="h-3 w-3 flex-shrink-0 text-yellow-400" />
                  )}
                </div>
                <img
                  src={resolveApiUrl(move.card.svgPath)}
                  alt={move.card.svgName}
                  className="mt-1.5 aspect-3/4 w-full rounded-md border border-white/10 bg-white/95 object-cover"
                />
              </div>
            );
          })}

          {(room?.currentHand?.length ?? 0) === 0 ? (
            <p className="text-sm text-emerald-50/65">
              No cards played yet in this trick.
            </p>
          ) : null}
        </div>
      </div>

      {currentTrickWinner && (room?.currentHand?.length ?? 0) > 0 ? (
        <div className="mt-4 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            <p className="text-sm font-semibold text-white">
              Currently winning
            </p>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-yellow-100/70">
                Player
              </p>
              <p className="mt-1 font-semibold text-white">
                {playerLookup.get(currentTrickWinner.playerId)?.name ??
                  "Unknown"}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <Zap className="h-3.5 w-3.5 text-yellow-300" />
                <span className="text-yellow-100/70">Rank strength</span>
                <span className="font-semibold text-yellow-300">
                  {currentTrickWinner.strength}/13
                </span>
              </div>
            </div>
            <div className="ml-auto">
              <img
                src={resolveApiUrl(currentTrickWinner.card.svgPath)}
                alt={currentTrickWinner.card.svgName}
                className="h-20 rounded-lg border border-yellow-400/30 bg-white/95 object-cover"
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-semibold text-white">Player progress</p>
        <p className="mt-1 text-xs text-emerald-50/65">
          Completed by player (hands won)
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {allPlayers.map((playerId) => {
            const player = playerLookup.get(playerId);
            const isCurrent = playerId === currentTurnPlayerId;

            return (
              <div
                key={playerId}
                className={[
                  "rounded-xl border p-3",
                  isCurrent
                    ? "border-amber-300/35 bg-amber-300/10"
                    : "border-white/10 bg-black/25",
                ].join(" ")}
              >
                <p className="truncate text-sm font-semibold text-white">
                  {player?.name ?? "Unknown"}
                </p>
                <p className="mt-1 text-xs text-emerald-50/65">
                  Cards left: {room?.handCounts?.[playerId] ?? 0}
                </p>
                <p className="text-xs text-emerald-50/65">
                  Hands won: {room?.handsWon?.[playerId] ?? 0}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">Your hand</p>
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-50/60">
            {isYourTurn ? "Your turn" : "Wait for your turn"}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {yourHand.map((card) => (
            <button
              key={card.code}
              type="button"
              onClick={() => onPlayCard(card.code)}
              disabled={!isYourTurn || isLoading}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/95 shadow-[0_8px_20px_rgba(0,0,0,0.16)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <img
                src={resolveApiUrl(card.svgPath)}
                alt={card.svgName}
                className="aspect-3/4 w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlayingBoard;
