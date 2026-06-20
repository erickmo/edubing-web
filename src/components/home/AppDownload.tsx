import { Button } from "../ui/Button";

/**
 * Deep link to the installable PWA, which lives on the student PORTAL origin.
 * The landing origin cannot trigger install of a PWA hosted on a different
 * origin, so this CTA simply deep-links the user to the portal where the
 * browser's native install prompt is available.
 *
 * TODO(prod): replace with the real portal URL (e.g. https://app.edubing.id/student).
 */
export const PWA_INSTALL_URL = "https://edubing.localhost/student";

/** App-store badge placeholders — not yet live ("Segera hadir"). */
const STORE_BADGES = [
  { label: "Google Play", sub: "Segera hadir" },
  { label: "App Store", sub: "Segera hadir" },
] as const;

/**
 * AppDownload — promotes installing Edubing as a PWA, plus placeholder
 * native-store badges. The primary CTA deep-links to the portal origin
 * because the installable PWA lives there, not on this landing origin.
 */
export function AppDownload(): JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
      <div className="relative overflow-hidden rounded-blob border-2 border-ink bg-gradient-to-br from-teal-500 to-teal-700 px-6 py-12 text-cream shadow-card sm:px-12 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-sun/30 blur-2xl"
        />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/15 px-3 py-1 text-sm font-bold">
              📱 Aplikasi Edubing
            </span>
            <h2 className="mt-5 font-display text-3xl font-black sm:text-4xl">
              Pasang Aplikasi Edubing
            </h2>
            <p className="mt-3 max-w-md text-cream/85">
              Akses kelas dan event langsung dari layar utama HP-mu. Ringan,
              cepat, dan bisa dipasang tanpa toko aplikasi.
            </p>

            <div className="mt-8 flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                variant="primary"
                size="lg"
                className="shadow-sticker"
              >
                <a href={PWA_INSTALL_URL}>Pasang Aplikasi Web</a>
              </Button>

              <div className="flex flex-wrap gap-3">
                {STORE_BADGES.map((badge) => (
                  <a
                    key={badge.label}
                    href="#"
                    aria-disabled="true"
                    className="flex items-center gap-3 rounded-2xl border-2 border-cream/40 px-4 py-2.5 text-left opacity-80"
                  >
                    <span className="text-xl" aria-hidden>
                      ⬇️
                    </span>
                    <span className="leading-tight">
                      <span className="block text-xs text-cream/70">
                        {badge.sub}
                      </span>
                      <span className="block font-bold">{badge.label}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative phone mock */}
          <div className="relative mx-auto hidden h-72 w-40 md:block">
            <div className="absolute inset-0 rotate-6 rounded-[2rem] border-4 border-ink bg-cream shadow-sticker" />
            <div className="absolute inset-0 -rotate-3 rounded-[2rem] border-4 border-ink bg-white p-3">
              <div className="h-3 w-12 rounded-full bg-ink/10" />
              <div className="mt-3 h-20 rounded-xl bg-brand-100" />
              <div className="mt-3 h-3 w-3/4 rounded bg-ink/10" />
              <div className="mt-2 h-3 w-1/2 rounded bg-ink/10" />
              <div className="mt-4 h-9 rounded-xl bg-brand-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
