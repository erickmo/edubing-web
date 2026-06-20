import { Link } from "react-router-dom";
import { useEvents } from "../../lib/api/events";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EventCard } from "./EventCard";

/** Max number of featured events shown on the home page. */
const MAX_FEATURED = 3;

/** Skeleton placeholder count while events load. */
const SKELETON_COUNT = 3;

/** Eyebrow + heading for the section. */
function SectionHeader(): JSX.Element {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="sticker shadow-sticker">🔥 Sedang berlangsung</span>
        <h2 className="mt-5 font-display text-3xl font-black text-ink sm:text-4xl">
          Event mendatang
        </h2>
        <p className="mt-2 text-ink-soft">
          Pilih, daftar, dan amankan kursimu sebelum kehabisan.
        </p>
      </div>
      <Button asChild variant="secondary" size="md" className="self-start sm:self-auto">
        <Link to="/events">Lihat semua event</Link>
      </Button>
    </div>
  );
}

/** Animated loading skeleton grid. */
function EventsSkeleton(): JSX.Element {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-36 animate-pulse bg-ink/10" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-ink/10" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-ink/10" />
            <div className="h-4 w-full animate-pulse rounded bg-ink/10" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Centered status panel for empty + error states. */
function StatePanel({ emoji, message }: { emoji: string; message: string }): JSX.Element {
  return (
    <Card className="mt-10 flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <p className="text-lg font-semibold text-ink-soft">{message}</p>
    </Card>
  );
}

/**
 * FeaturedEvents — client-loaded grid of up to three upcoming events.
 * Handles loading (skeleton), error, and empty states — all in Bahasa.
 * On prerender this renders the skeleton; the surrounding marketing copy
 * is the SEO content, so that is acceptable.
 */
export function FeaturedEvents(): JSX.Element {
  const { data, isLoading, isError } = useEvents();
  const events = (data ?? []).slice(0, MAX_FEATURED);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
      <SectionHeader />

      {isLoading && <EventsSkeleton />}

      {!isLoading && isError && (
        <StatePanel
          emoji="⚠️"
          message="Gagal memuat event. Coba muat ulang halaman."
        />
      )}

      {!isLoading && !isError && events.length === 0 && (
        <StatePanel emoji="🗓️" message="Belum ada event" />
      )}

      {!isLoading && !isError && events.length > 0 && (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.name} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}
