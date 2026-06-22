/**
 * RelatedEvents — "Event Lainnya" grid shown below the event detail.
 *
 * Pulls the public event list, drops the current event, and renders up to
 * three EventCards. Renders nothing when there are no other events (or while
 * the list is loading/unavailable) so the page never shows an empty section.
 */

import { EventCard } from "../home/EventCard";
import { useEvents } from "../../lib/api/events";

/** Props for RelatedEvents. */
export interface RelatedEventsProps {
  /** Route slug of the event currently being viewed (excluded from results). */
  currentRoute: string;
}

/** Maximum number of related events to display. */
const MAX_RELATED = 3;

/**
 * Renders a grid of up to three other events.
 * @returns The section, or `null` when there is nothing to show.
 */
export function RelatedEvents({ currentRoute }: RelatedEventsProps): JSX.Element | null {
  const { data } = useEvents();

  const related = (data ?? [])
    .filter((event) => event.route && event.route !== currentRoute)
    .slice(0, MAX_RELATED);

  if (related.length === 0) return null;

  return (
    <section className="border-t-2 border-ink/5 bg-cream">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl font-black text-ink">
          Event Lainnya
        </h2>
        <p className="mt-1 text-ink-soft">
          Jelajahi kegiatan seru lainnya dari Edubing.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((event) => (
            <EventCard key={event.route} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
