/**
 * Event detail page — /events/:slug
 *
 * Prerendered at build time via vite-react-ssg (loader + getStaticPaths).
 * At runtime, React Query re-fetches for live seat counts and pricing.
 */

import { useParams, useLoaderData, Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Seo } from "../components/Seo";
import { EventDetailHero } from "../components/events/EventDetailHero";
import { RegisterCta } from "../components/events/RegisterCta";
import { useEvent } from "../lib/api/events";
import { breadcrumbLd, eventLd, SITE_URL } from "../lib/seo/jsonld";
import type { PublicEvent } from "../lib/api/events";

/** Page title when slug doesn't resolve. */
const NOT_FOUND_TITLE = "Event Tidak Ditemukan – Edubing";

/**
 * EventDetail — /events/:slug page.
 * Merges prerendered loader data with live React Query for hydration.
 */
export default function EventDetail(): JSX.Element {
  const { slug = "" } = useParams<{ slug: string }>();
  const preloaded = useLoaderData() as PublicEvent | null;
  const { data, isLoading } = useEvent(slug);

  // Prefer live React Query data; fall back to prerendered snapshot.
  const event: PublicEvent | undefined = data ?? preloaded ?? undefined;

  if (isLoading && !preloaded) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-cream">
          <p className="text-ink-muted">Memuat event…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Seo title={NOT_FOUND_TITLE} description="Event tidak ditemukan." noindex />
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-center bg-cream gap-4">
          <h1 className="font-display text-3xl font-black text-ink">
            Event tidak ditemukan
          </h1>
          <p className="text-ink-soft">
            Event yang kamu cari mungkin sudah berakhir atau tidak tersedia.
          </p>
          <Link
            to="/events"
            className="text-brand-600 underline hover:text-brand-700"
          >
            Lihat semua event
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const eventUrl = `${SITE_URL}/events/${event.route}`;

  const jsonLdItems = [
    eventLd({
      name: event.title,
      slug: event.route,
      short_description: event.short_description ?? undefined,
      start_date: event.start_date,
      end_date: event.end_date,
      location: event.location,
      price: event.price,
      event_type: event.event_type,
      remaining_seats: event.remaining_seats,
    }),
    breadcrumbLd([
      { name: "Beranda", url: SITE_URL },
      { name: "Event", url: `${SITE_URL}/events` },
      { name: event.title, url: eventUrl },
    ]),
  ];

  return (
    <>
      <Seo
        title={`${event.title} – Edubing`}
        description={event.short_description || event.title}
        canonical={eventUrl}
        image={event.featured_image || undefined}
        type="event"
        jsonLd={jsonLdItems}
      />
      <Navbar />

      <main>
        <EventDetailHero event={event} />

        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <article className="lg:col-span-2">
              <h2 className="font-display text-xl font-bold text-ink">
                Tentang Event
              </h2>
              <p className="mt-3 text-ink-soft leading-relaxed">
                {event.short_description || "Deskripsi belum tersedia."}
              </p>
            </article>

            <aside>
              <RegisterCta event={event} />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
