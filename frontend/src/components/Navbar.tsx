import { Crown, ScrollText } from "lucide-react";
import { NavLink } from "react-router";

const baseClass =
  "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition";

const Navbar = () => {
  return (
    <header className="sticky top-3 z-20 mx-auto w-full max-w-4xl">
      <nav className="flex items-center justify-between rounded-2xl border border-white/12 bg-black/25 p-2 text-emerald-50 backdrop-blur-md">
        <div className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold tracking-[0.04em] text-white">
          <Crown className="h-4 w-4 text-amber-300" />
          Hukum
        </div>

        <div className="inline-flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${baseClass} ${
                isActive
                  ? "bg-amber-300 text-slate-950"
                  : "bg-white/5 text-emerald-50 hover:bg-white/10"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/rules"
            className={({ isActive }) =>
              `${baseClass} ${
                isActive
                  ? "bg-amber-300 text-slate-950"
                  : "bg-white/5 text-emerald-50 hover:bg-white/10"
              }`
            }
          >
            <ScrollText className="h-4 w-4" />
            Rules
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
