import type { Room } from "../../types/room";

type RoomReadinessProps = {
  room: Room | null;
};

const RoomReadiness = ({ room }: RoomReadinessProps) => {
  const currentPlayers = room?.totalPlayers ?? 0;
  const minPlayers = room?.minPlayersToStart ?? 4;
  const maxPlayers = room?.maxPlayersTotal ?? 8;
  const canStart = room?.canStartGame ?? false;
  const isEven = currentPlayers % 2 === 0;
  const teamsBalanced =
    (room?.teams.bid.players.length ?? 0) ===
    (room?.teams.challenge.players.length ?? 0);

  return (
    <div
      className={[
        "mt-4 rounded-2xl border p-4",
        canStart
          ? "border-emerald-300/20 bg-emerald-300/10"
          : "border-amber-300/20 bg-amber-300/10",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/60">
            Match readiness
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            {canStart ? "Room ready to start" : "Waiting for more players"}
          </h2>
        </div>

        <div className="text-right text-sm text-emerald-50/80">
          <p>
            {currentPlayers}/{maxPlayers} players
          </p>
          <p>Need {minPlayers} players to start</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-emerald-50/75">
        {canStart
          ? "The lobby is balanced and ready. The handler can start the game now."
          : "Fill the lobby to at least 4 players, keep it evenly split, and reach an even total like 4, 6, or 8. The room can hold up to 8 players total."}
      </p>

      {!canStart ? (
        <p className="mt-2 text-xs text-emerald-50/60">
          {currentPlayers < minPlayers
            ? `Need ${minPlayers - currentPlayers} more player${minPlayers - currentPlayers === 1 ? "" : "s"} to reach the minimum.`
            : !isEven
              ? "Need one more player so the total is even."
              : !teamsBalanced
                ? "Teams must be perfectly balanced before starting."
                : "Waiting for the room to become ready."}
        </p>
      ) : null}
    </div>
  );
};

export default RoomReadiness;
