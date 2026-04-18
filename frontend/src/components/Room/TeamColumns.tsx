import { Crown, Shield } from "lucide-react";
import type { Room } from "../../types/room";
import { TEAM_ORDER } from "./teamMeta";

type TeamColumnsProps = {
  room: Room | null;
};

const TeamColumns = ({ room }: TeamColumnsProps) => {
  const currentPlayers = room?.totalPlayers ?? 0;
  const minPlayers = room?.minPlayersToStart ?? 4;
  const canStart = room?.canStartGame ?? false;
  const isEven = currentPlayers % 2 === 0;
  const teamsBalanced =
    (room?.teams.bid.players.length ?? 0) ===
    (room?.teams.challenge.players.length ?? 0);

  const readinessLabel = canStart
    ? "Ready to start"
    : currentPlayers < minPlayers
      ? `Need ${minPlayers - currentPlayers} more player${minPlayers - currentPlayers === 1 ? "" : "s"}`
      : !isEven
        ? "Need 1 more player for even teams"
        : !teamsBalanced
          ? "Teams must be balanced"
          : "Waiting for readiness";

  return (
    <div className="mt-5">
      <div className="mb-3 flex justify-center md:justify-start">
        <span
          className={[
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
            canStart
              ? "border-emerald-300/25 bg-emerald-300/15 text-emerald-100"
              : "border-amber-300/25 bg-amber-300/15 text-amber-100",
          ].join(" ")}
        >
          {readinessLabel}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TEAM_ORDER.map((teamId) => {
          const team = room?.teams[teamId];

          return (
            <article
              key={teamId}
              className="rounded-2xl border border-white/10 bg-black/25 p-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {team?.name ?? teamId}
                </h2>
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
                        {team?.name ?? teamId}
                      </span>
                    </div>
                  </li>
                ))}

                {Array.from({
                  length: Math.max(0, 4 - (team?.players.length ?? 0)),
                }).map((_, index) => (
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
    </div>
  );
};

export default TeamColumns;
