import { Users } from "lucide-react";
import type { Room } from "../../types/room";
import { TEAM_COLORS, TEAM_ORDER } from "./teamMeta";

type LobbyCapacityProps = {
  room: Room | null;
};

const LobbyCapacity = ({ room }: LobbyCapacityProps) => {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-emerald-50/55">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Lobby capacity
        </span>
        <span>{room?.totalPlayers ?? 0}/8</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {TEAM_ORDER.map((teamId) => {
          const team = room?.teams[teamId];

          return (
            <div key={teamId}>
              <div
                className={`mb-1 flex items-center justify-between text-xs ${TEAM_COLORS[teamId].text}`}
              >
                <span>{team?.name ?? teamId}</span>
                <span>{team?.players.length ?? 0}/4</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className={`h-2 rounded-full transition-all ${TEAM_COLORS[teamId].bar}`}
                  style={{
                    width: `${((team?.players.length ?? 0) / 4) * 100}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LobbyCapacity;
