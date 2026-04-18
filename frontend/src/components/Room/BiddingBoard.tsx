import { BadgeInfo, Shield, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { resolveApiUrl } from "../../api/baseUrl";
import type { Room, Suit } from "../../types/room";

type BiddingBoardProps = {
  room: Room | null;
  currentPlayerId: string;
  isLoading: boolean;
  onPlaceBid: (bid: number) => void;
  onSelectTrump: (suit: Suit) => void;
};

const SUITS: Array<{ id: Suit; label: string; color: string }> = [
  { id: "spades", label: "Spades", color: "text-slate-900" },
  { id: "hearts", label: "Hearts", color: "text-rose-200" },
  { id: "diamonds", label: "Diamonds", color: "text-cyan-100" },
  { id: "clubs", label: "Clubs", color: "text-emerald-100" },
];

const BiddingBoard = ({
  room,
  currentPlayerId,
  isLoading,
  onPlaceBid,
  onSelectTrump,
}: BiddingBoardProps) => {
  const [bidInput, setBidInput] = useState(1);

  const playerLookup = useMemo(() => {
    const entries = Object.values(room?.teams ?? {}).flatMap((team) =>
      team.players.map((player) => [player.id, player] as const),
    );

    return new Map(entries);
  }, [room?.teams]);

  const getPlayerName = (playerId?: string | null): string => {
    if (!playerId) {
      return "Waiting";
    }

    return playerLookup.get(playerId)?.name ?? "Unknown player";
  };

  const currentTurnPlayerId = room?.currentBidPlayerId ?? null;
  const currentBidTeamId = room?.currentBidTeamId ?? null;
  const highestBidderId = room?.highestBidderId ?? null;
  const currentBidPhase = room?.bidPhase ?? null;
  const yourHand = room?.hands?.[currentPlayerId] ?? [];
  const yourBid = room?.bids?.[currentPlayerId] ?? null;
  const yourTeamId = useMemo(() => {
    return (room?.teams?.bid?.players ?? []).some(
      (player) => player.id === currentPlayerId,
    )
      ? "bid"
      : (room?.teams?.challenge?.players ?? []).some(
            (player) => player.id === currentPlayerId,
          )
        ? "challenge"
        : null;
  }, [
    currentPlayerId,
    room?.teams?.bid?.players,
    room?.teams?.challenge?.players,
  ]);

  const isYourBidTurn =
    currentBidPhase === "collecting" && currentBidTeamId === yourTeamId;
  const isTrumpTurn =
    currentBidPhase === "chooseTrump" && highestBidderId === currentPlayerId;

  const allBidsPlaced = useMemo(() => {
    const bids = room?.bids ?? {};
    const order = room?.bidOrder ?? [];
    return (
      order.length > 0 &&
      order.every(
        (playerId) => bids[playerId] !== null && bids[playerId] !== undefined,
      )
    );
  }, [room?.bidOrder, room?.bids]);

  useEffect(() => {
    if (yourBid !== null && yourBid !== undefined) {
      setBidInput(yourBid);
    }
  }, [yourBid]);

  return (
    <section className="mt-4 rounded-3xl border border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.72))] p-4 shadow-[0_18px_40px_rgba(2,6,23,0.28)] backdrop-blur-md sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/55">
            Bidding phase
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">
            Cards are open. Each player bids once.
          </h2>
          <p className="mt-2 text-sm leading-6 text-emerald-50/75">
            After the last bid, the highest bidder chooses the trump suit and
            the round moves to play.
          </p>
        </div>

        <div className="grid gap-2 text-sm text-emerald-50/80 sm:grid-cols-2 lg:min-w-[18rem]">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-50/55">
              Active team
            </p>
            <p className="mt-1 font-semibold text-white">
              {currentBidTeamId
                ? (room?.teams?.[currentBidTeamId]?.name ?? currentBidTeamId)
                : "Waiting"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-50/55">
              Highest bid
            </p>
            <p className="mt-1 font-semibold text-white">
              {room?.highestBidValue ?? "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <BadgeInfo className="h-4 w-4 text-amber-200" />
            Bid order
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {(room?.bidOrder ?? []).map((playerId, index) => {
              const player = playerLookup.get(playerId);
              const bidValue = room?.bids?.[playerId];
              const isCurrent = playerId === currentTurnPlayerId;

              return (
                <div
                  key={playerId}
                  className={[
                    "rounded-2xl border px-3 py-2",
                    isCurrent
                      ? "border-amber-300/30 bg-amber-300/10"
                      : "border-white/10 bg-black/20",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {index + 1}. {player?.name ?? "Unknown player"}
                    </p>
                    {isCurrent ? (
                      <span className="rounded-full border border-amber-300/30 bg-amber-300/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100">
                        Now
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-emerald-50/65">
                    Bid: {bidValue ?? "pending"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-cyan-200" />
            Your hand
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-emerald-50/55">
            Cards are visible during bidding
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-2">
            {yourHand.map((card) => (
              <div
                key={card.code}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/95 shadow-[0_8px_20px_rgba(0,0,0,0.16)]"
              >
                <img
                  src={resolveApiUrl(card.svgPath)}
                  alt={card.svgName}
                  className="aspect-3/4 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        {currentBidPhase === "collecting" ? (
          isYourBidTurn ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Your bid turn
                </p>
                <p className="text-sm text-emerald-50/70">
                  You can bid only once. Pick the strongest number you want to
                  commit.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="number"
                  min={1}
                  max={yourHand.length || 20}
                  value={bidInput}
                  onChange={(event) => setBidInput(Number(event.target.value))}
                  disabled={isLoading || yourBid !== null}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-emerald-50/35 sm:w-28"
                />
                <button
                  type="button"
                  onClick={() => onPlaceBid(bidInput)}
                  disabled={isLoading || yourBid !== null}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-300 px-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Place bid
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-emerald-50/75">
              <Shield className="h-4 w-4 text-cyan-200" />
              Waiting for{" "}
              {room?.teams?.[currentBidTeamId ?? "bid"]?.name ??
                "the next team"}{" "}
              to bid.
            </div>
          )
        ) : currentBidPhase === "chooseTrump" ? (
          isTrumpTurn ? (
            <div>
              <p className="text-sm font-semibold text-white">
                You won the bid
              </p>
              <p className="mt-1 text-sm text-emerald-50/70">
                Choose the trump suit to lock in the round.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {SUITS.map((suit) => (
                  <button
                    key={suit.id}
                    type="button"
                    onClick={() => onSelectTrump(suit.id)}
                    disabled={isLoading}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white capitalize disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {suit.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-emerald-50/75">
              <Shield className="h-4 w-4 text-amber-200" />
              {getPlayerName(highestBidderId)} is choosing trump.
            </div>
          )
        ) : null}

        {allBidsPlaced ? (
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-emerald-50/55">
            All bids submitted. Next: trump selection.
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default BiddingBoard;
