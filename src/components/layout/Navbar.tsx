import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { cn } from "../../lib/cn";

/** Primary navigation links shown in the navbar (Bahasa Indonesia). */
const NAV_LINKS = [
  { label: "Beranda", to: "/" },
  { label: "Event", to: "/events" },
  { label: "Tentang", to: "/#tentang" },
] as const;

/** Edubing wordmark — display font with a tangerine dot accent. */
function Wordmark(): JSX.Element {
  return (
    <span className="font-display text-2xl font-black tracking-tight text-ink">
      Edubing
      <span className="text-brand-500">.</span>
    </span>
  );
}

/**
 * Navbar — sticky, responsive site header.
 * Collapses links into a toggle menu on mobile. Masuk → /masuk,
 * Daftar (primary CTA) → /daftar.
 */
export function Navbar(): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink/10 bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="Edubing beranda" className="shrink-0">
          <Wordmark />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/masuk">Masuk</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link to="/daftar">Daftar Gratis</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink/15 text-ink md:hidden"
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-4 w-5">
            <span
              className={cn(
                "absolute left-0 top-0 h-0.5 w-5 bg-ink transition-transform",
                open && "translate-y-[7px] rotate-45",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1.5 h-0.5 w-5 bg-ink transition-opacity",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-3 h-0.5 w-5 bg-ink transition-transform",
                open && "-translate-y-[5px] -rotate-45",
              )}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t-2 border-ink/10 bg-cream px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-semibold text-ink hover:bg-ink/5"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Button asChild variant="secondary" size="md">
              <Link to="/masuk" onClick={() => setOpen(false)}>
                Masuk
              </Link>
            </Button>
            <Button asChild variant="primary" size="md">
              <Link to="/daftar" onClick={() => setOpen(false)}>
                Daftar Gratis
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
