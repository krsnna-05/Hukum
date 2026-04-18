import { RefreshCcw } from "lucide-react";

type RoomHeaderProps = {
  roomCode: string;
  status: string;
  onRefresh: () => void;
};

const RoomHeader = ({ roomCode, status, onRefresh }: RoomHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-50/55">
          Room lobby
        </p>
        <h1 className="mt-3 wrap-break-word text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
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
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-sm sm:w-auto"
      >
        <RefreshCcw className="h-4 w-4" />
        Refresh
      </button>
    </div>
  );
};

export default RoomHeader;
