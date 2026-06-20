import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import {
  BRAND_DEFINITION,
  HERO_HEADLINE_HIGHLIGHT,
  HERO_HEADLINE_LEAD,
} from "./content";

/** Floating sticker stats shown over the hero artwork. */
const HERO_STATS = [
  { value: "120+", label: "Event seru", tone: "bg-sun text-ink" },
  { value: "8.000+", label: "Pelajar aktif", tone: "bg-teal-400 text-white" },
] as const;

/**
 * Hero — the design-defining first viewport.
 * Big Bahasa headline, GEO definition sentence, dual CTAs, and a playful
 * gradient-blob + inline-SVG artwork (no external image dependency).
 */
export function Hero(): JSX.Element {
  return (
    <section className="relative overflow-hidden">
      {/* Atmosphere: soft gradient blobs + dotted texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-32 h-72 w-72 rounded-full bg-teal-200/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-dots bg-dots opacity-60"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="animate-rise-in">
          <span className="sticker shadow-sticker-brand">
            🎓 Belajar + Event dalam satu aplikasi
          </span>

          <h1 className="mt-6 font-display text-5xl font-black leading-[1.05] text-ink sm:text-6xl md:text-7xl">
            {HERO_HEADLINE_LEAD}
            <br />
            <span className="underline-sketch text-brand-600">
              {HERO_HEADLINE_HIGHLIGHT}
            </span>
          </h1>

          {/* GEO definition sentence — entity establishment near the top */}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            {BRAND_DEFINITION}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg">
              <Link to="/daftar">Daftar Gratis</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/events">Lihat Event</Link>
            </Button>
          </div>

          <p className="mt-5 text-sm font-medium text-ink-muted">
            Gratis dibuat • Tanpa kartu kredit • Langsung bisa belajar
          </p>
        </div>

        {/* Playful artwork: layered cards + floating stickers + inline SVG */}
        <div className="relative mx-auto hidden h-[26rem] w-full max-w-md lg:block">
          <div className="absolute inset-0 rotate-3 rounded-blob bg-gradient-to-br from-brand-400 to-brand-600 shadow-lift" />
          <div className="absolute inset-0 -rotate-2 rounded-blob border-2 border-ink bg-cream p-8">
            <HeroSvg />
          </div>

          {HERO_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`absolute ${
                i === 0
                  ? "-left-6 top-8 animate-float-slow"
                  : "-right-4 bottom-10 animate-float-rev"
              } rounded-2xl border-2 border-ink ${stat.tone} px-4 py-3 shadow-sticker`}
            >
              <div className="font-display text-2xl font-black leading-none">
                {stat.value}
              </div>
              <div className="text-xs font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Decorative inline SVG — abstract "learning + event" scene. */
function HeroSvg(): JSX.Element {
  return (
    <svg
      viewBox="0 0 320 320"
      className="h-full w-full"
      role="img"
      aria-label="Ilustrasi belajar dan event Edubing"
    >
      <defs>
        <linearGradient id="hero-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16A37D" />
          <stop offset="1" stopColor="#0C8366" />
        </linearGradient>
      </defs>
      {/* Open book */}
      <path
        d="M40 210 Q160 170 160 200 Q160 170 280 210 L280 250 Q160 215 160 245 Q160 215 40 250 Z"
        fill="url(#hero-g)"
        stroke="#1E2235"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* Graduation cap */}
      <g transform="translate(160 95)">
        <path
          d="M-70 0 L0 -34 L70 0 L0 34 Z"
          fill="#1E2235"
          stroke="#1E2235"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path d="M0 34 L0 70 L48 56 L48 18" fill="none" stroke="#1E2235" strokeWidth="6" />
        <circle cx="74" cy="2" r="8" fill="#FB5A12" />
      </g>
      {/* Spark / event confetti */}
      <circle cx="56" cy="70" r="10" fill="#FFC857" stroke="#1E2235" strokeWidth="5" />
      <rect x="244" y="60" width="20" height="20" rx="5" fill="#FB5A12" stroke="#1E2235" strokeWidth="5" transform="rotate(15 254 70)" />
      <path d="M250 150 l8 16 l16 -8" fill="none" stroke="#16A37D" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
