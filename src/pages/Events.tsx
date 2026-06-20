/**
 * Events list page — /events
 *
 * Prerendered at build time via vite-react-ssg (loader inlines data into the
 * static HTML). At runtime, React Query re-fetches for fresh data.
 *
 * Filter state is client-side only — no URL param needed for MVP.
 */

import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Seo } from "../components/Seo";
import { EventCard } from "../components/home/EventCard";
import { EventFilters } from "../components/events/EventFilters";
import { useEvents } from "../lib/api/events";
import { breadcrumbLd, SITE_URL } from "../lib/seo/jsonld";
import type { PublicEvent, EventType } from "../lib/api/events";

/** Page title shown in browser tab. */
const PAGE_TITLE = "Semua Event – Edubing";
/** Meta description for SEO. */
const PAGE_DESCRIPTION =
  "Temukan workshop, webinar, dan kompetisi terbaik. Belajar dan berkembang bersama komunitas Edubing.";

/**
 * Events — /events list page.
 * Combines build-time prerendered data (useLoaderData) with client-side
 * React Query for seamless hydration.
 */
export default function Events(): JSX.Element {
  const [activeFilter, setActiveFilter] = useState<"all" | EventType>("all");

  const preloaded = useLoaderData() as PublicEvent[] | null;
  const { data, isLoading, isError } = useEvents();

  // Prefer live React Query data; fall back to prerendered list.
  const events: PublicEvent[] = data ?? preloaded ?? [];

  const filtered =
    activeFilter === "all"
      ? events
      : events.filter((e) => e.event_type === activeFilter);

  const breadcrumb = breadcrumbLd([
    { name: "Beranda", url: SITE_URL },
    { name: "Event", url: `${SITE_URL}/events` },
  ]);

  return (
    <>
      <Seo
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        canonical={`${SITE_URL}/events`}
        jsonLd={breadcrumb}
      />
      <Navbar />

      <main className="min-h-screen bg-cream pb-20 pt-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-black text-ink sm:text-4xl">
              Semua Event
            </h1>
            <p className="mt-2 text-ink-soft">{PAGE_DESCRIPTION}</p>
          </header>

          <EventFilters activeFilter={activeFilter} onFilter={setActiveFilter} />

          <section className="mt-8" aria-label="Daftar event">
            {isLoading && !preloaded && (
              <p className="text-center text-ink-muted">Memuat event…</p>
            )}
            {isError && (
              <p className="text-center text-red-500">
                Gagal memuat event. Coba lagi nanti.
              </p>
            )}
            {!isLoading && filtered.length === 0 && (
              <p className="text-center text-ink-muted">
                Belum ada event untuk kategori ini.
              </p>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => (
                <EventCard key={event.name} event={event} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
