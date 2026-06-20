/**
 * EventDetailHero — above-the-fold hero section for the /events/:slug page.
 *
 * Displays: cover image (or gradient fallback), type badge, title, date
 * range, location or meeting-link info, price, and remaining-seat count.
 */

import { Badge } from "../ui/Badge";
import type { PublicEvent } from "../../lib/api/events";
import {
  EVENT_TYPE_LABEL,
  EVENT_TYPE_VARIANT,
  formatEventDate,
  formatPrice,
  is_sold_out,
  is_seats_low,
  seats_label,
} from "../home/eventFormat";

/** Props for EventDetailHero. */
export interface EventDetailHeroProps {
  /** Fully-loaded public event record. */
  event: PublicEvent;
}

/**
 * Renders the full-width hero panel for an event detail page.
 * Kept under 40 LOC of JSX — layout only, no side-effects.
 */
export function EventDetailHero({ event }: EventDetailHeroProps): JSX.Element {
  const seatsLow = is_seats_low(event.remaining_seats);
  const seatsFull = is_sold_out(event.remaining_seats);

  const dateRange =
    formatEventDate(event.start_date) !== formatEventDate(event.end_date)
      ? `${formatEventDate(event.start_date)} – ${formatEventDate(event.end_date)}`
      : formatEventDate(event.start_date);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-teal-500 text-white">
      {event.featured_image && (
        <img
          src={event.featured_image}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
      )}

      <div className="relative mx-auto max-w-4xl px-6 py-14">
        <Badge variant={EVENT_TYPE_VARIANT[event.event_type]} className="mb-4">
          {EVENT_TYPE_LABEL[event.event_type]}
        </Badge>

        <h1 className="font-display text-3xl font-black leading-tight sm:text-4xl">
          {event.title}
        </h1>

        {event.short_description && (
          <p className="mt-3 max-w-2xl text-base text-white/80">
            {event.short_description}
          </p>
        )}

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-white/60">
              Tanggal
            </dt>
            <dd className="text-sm font-semibold">{dateRange}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-white/60">
              {event.event_type === "online" ? "Tautan Meeting" : "Lokasi"}
            </dt>
            <dd className="text-sm font-semibold">{event.location || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-white/60">
              Harga
            </dt>
            <dd className="text-sm font-semibold">{formatPrice(event.price)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-white/60">
              Kursi Tersisa
            </dt>
            <dd
              className={[
                "text-sm font-semibold",
                seatsFull
                  ? "text-red-300"
                  : seatsLow
                  ? "text-sun-300"
                  : "text-white",
              ].join(" ")}
            >
              {seatsFull
                ? seats_label(event.remaining_seats)
                : event.remaining_seats === null
                ? "Tak terbatas"
                : `${event.remaining_seats} dari ${event.capacity}`}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
