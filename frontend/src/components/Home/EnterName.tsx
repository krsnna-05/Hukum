import { PencilLine, Save, Trash2, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "hukum.playerName";

type EnterNameProps = {
  value: string | null;
  onPlayerNameChange: (value: string | null) => void;
  compact?: boolean;
};

const normalizeName = (value: string) => value.trim().replace(/\s+/g, " ");

const EnterName = ({
  value,
  onPlayerNameChange,
  compact = false,
}: EnterNameProps) => {
  const [draftName, setDraftName] = useState(value ?? "");
  const [isEditing, setIsEditing] = useState(!value);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedName = window.localStorage.getItem(STORAGE_KEY);

    if (storedName) {
      onPlayerNameChange(storedName);
      setDraftName(storedName);
      setIsEditing(false);
    }

    setIsLoaded(true);
  }, [onPlayerNameChange]);

  useEffect(() => {
    setDraftName(value ?? "");
  }, [value]);

  const hasName = Boolean(value);

  const title = useMemo(() => {
    if (hasName) {
      return "Profile ready";
    }

    return "Choose your name";
  }, [hasName]);

  const saveName = () => {
    const nextName = normalizeName(draftName);

    if (!nextName) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, nextName);
    onPlayerNameChange(nextName);
    setDraftName(nextName);
    setIsEditing(false);
  };

  const deleteName = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    onPlayerNameChange(null);
    setDraftName("");
    setIsEditing(true);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <section
      className={[
        "rounded-3xl border border-white/12 bg-black/20 text-emerald-50 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-md",
        compact ? "p-5" : "p-6",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-300 text-slate-950">
          <UserRound className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-emerald-50/75">
            {hasName
              ? "This name will be used for create/join actions."
              : "Set your profile name to continue."}
          </p>

          <div className="mt-3">
            {isEditing || !hasName ? (
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <label className="relative block">
                  <span className="sr-only">Player name</span>
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    placeholder="Your name"
                    className="h-11 w-full rounded-xl border border-white/12 bg-black/25 px-3 pr-10 text-sm text-white outline-none placeholder:text-emerald-50/35 focus:border-amber-300/50"
                    maxLength={24}
                    autoComplete="nickname"
                  />
                  <PencilLine className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-200/80" />
                </label>

                <button
                  type="button"
                  onClick={saveName}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-95"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-black/25 px-3 py-2 text-sm text-white">
                  {value}
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3 text-sm font-medium text-emerald-50 transition hover:bg-white/10"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={deleteName}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 text-sm font-medium text-rose-100 transition hover:bg-rose-500/15"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnterName;
