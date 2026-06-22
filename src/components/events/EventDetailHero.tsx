/**
 * EventDetailHero — above-the-fold hero band for the /events/:slug page.
 *
 * Background is the cover image (dimmed) when present, else the brand→teal
 * gradient fallback. Shows the type badge, title, short description, and a
 * single-line meta row: 📅 date · 📍 location|"Online". Detailed facts
 * (price, seats, duration) live in EventQuickFacts, not here.
 */

import { Badge } from "../ui/Badge";
import type { PublicEvent } from "../../lib/api/events";
import {
  EVENT_TYPE_LABEL,
  EVENT_TYPE_VARIANT,
  formatEventDate,
} from "../home/eventFormat";

/** Props for EventDetailHero. */
export interface EventDetailHeroProps {
  /** Fully-loaded public event record. */
  event: PublicEvent;
}

/** Build the date range, collapsing to a single date when start === end. */
function dateRangeLabel(event: PublicEvent): string {
  const start = formatEventDate(event.start_date);
  const end = formatEventDate(event.end_date);
  return start && end && start !== end ? `${start} – ${end}` : start;
}

/**
 * Renders the full-width hero panel for an event detail page.
 * Layout-only, no side-effects.
 */
export function EventDetailHero({ event }: EventDetailHeroProps): JSX.Element {
  const isOnline = event.event_type === "online";
  const placeLabel = isOnline ? "Online" : event.location || "Akan diumumkan";
  const dateRange = dateRangeLabel(event);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-teal-500 text-white">
      {event.featured_image && (
        <img
          src={event.featured_image}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
      )}
      {/* Dotted texture overlay for depth on the gradient fallback. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid-dots bg-dots opacity-30"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <Badge variant={EVENT_TYPE_VARIANT[event.event_type]} className="mb-4">
          {EVENT_TYPE_LABEL[event.event_type]}
        </Badge>

        <h1 className="max-w-3xl font-display text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
          {event.title}
        </h1>

        {event.short_description && (
          <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">
            {event.short_description}
          </p>
        )}

        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-white/90">
          {dateRange && <span>📅 {dateRange}</span>}
          {dateRange && <span aria-hidden="true" className="text-white/50">·</span>}
          <span>📍 {placeLabel}</span>
        </p>
      </div>
    </section>
  );
}
