import { RefreshCcw } from "lucide-react";

type RoomHeaderProps = {
  roomCode: string;
  status: string;
  onRefresh: () => void;
};

const RoomHeader = ({ roomCode, status, onRefresh }: RoomHeaderProps) => {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-50/55">
          Room lobby
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {roomCode}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">
          Status <span className="font-semibold text-white">{status}</span>.
          Creator is room handler.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-sm"
      >
        <RefreshCcw className="h-4 w-4" />
        Refresh
      </button>
    </div>
  );
};

export default RoomHeader;
