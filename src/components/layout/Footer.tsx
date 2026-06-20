import { Link } from "react-router-dom";
import { BRAND_DEFINITION } from "../home/content";

/** Footer navigation column definitions (Bahasa Indonesia). */
const FOOTER_COLUMNS = [
  {
    title: "Jelajahi",
    links: [
      { label: "Beranda", to: "/" },
      { label: "Event", to: "/events" },
      { label: "Masuk", to: "/masuk" },
      { label: "Daftar", to: "/daftar" },
    ],
  },
  {
    title: "Tentang",
    links: [
      { label: "Tentang Edubing", to: "/#tentang" },
      { label: "Cara Kerja", to: "/#cara-kerja" },
      { label: "FAQ", to: "/#faq" },
    ],
  },
] as const;

/** Social placeholder labels (links not yet live). */
const SOCIALS = ["Instagram", "TikTok", "YouTube"] as const;

/** Current year for the copyright line. */
const YEAR = new Date().getFullYear();

/**
 * Footer — short about blurb, navigation columns, social placeholders,
 * and copyright. The about blurb reuses BRAND_DEFINITION for GEO consistency.
 */
export function Footer(): JSX.Element {
  return (
    <footer className="border-t-2 border-ink/10 bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <span className="font-display text-2xl font-black">
            Edubing<span className="text-brand-400">.</span>
          </span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/70">
            {BRAND_DEFINITION}
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-cream/90">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-cream/65 transition-colors hover:text-brand-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-cream/90">
            Ikuti Kami
          </h3>
          <ul className="mt-4 space-y-2">
            {SOCIALS.map((name) => (
              <li key={name}>
                <a
                  href="#"
                  aria-disabled="true"
                  className="text-sm text-cream/65 transition-colors hover:text-brand-300"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-cream/50 sm:px-6">
          © {YEAR} Edubing. Semua hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
