import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/method", label: "Method" },
  { to: "/evolution", label: "Evolution" },
  { to: "/metrics", label: "Metrics" },
  { to: "/explore", label: "Explore" },
  { to: "/blank", label: "Blank canvas" },
  { to: "/paper", label: "Paper" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="flex items-baseline gap-2 no-underline">
          <span className="font-display text-2xl font-semibold tracking-tight text-ul">CounterStroke</span>
          <span className="hidden text-xs text-muted sm:inline">BDS · UL</span>
        </NavLink>
        <nav className="flex flex-wrap items-center justify-end gap-1 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 transition ${
                  isActive ? "bg-ul text-white" : "text-muted hover:bg-white hover:text-ink"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <img
            src={`${import.meta.env.BASE_URL}affiliations/bds.png`}
            alt="BDS"
            className="ml-2 hidden h-9 w-auto sm:block"
          />
        </nav>
      </div>
    </header>
  );
}
