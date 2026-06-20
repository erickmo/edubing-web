import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { PublicEvent } from "../../lib/api/events";
import {
  EVENT_TYPE_LABEL,
  EVENT_TYPE_VARIANT,
  formatEventDate,
  formatPrice,
} from "./eventFormat";

/** Props for EventCard. */
export interface EventCardProps {
  event: PublicEvent;
}

/** Threshold below which we nudge urgency on remaining seats. */
const LOW_SEATS_THRESHOLD = 10;

/**
 * EventCard — compact upcoming-event tile.
 * Shows the type badge, title, date, price ("Gratis" when free), and
 * remaining seats. Links to the event detail page by its route slug.
 */
export function EventCard({ event }: EventCardProps): JSX.Element {
  const seatsLow = event.remaining_seats <= LOW_SEATS_THRESHOLD;

  return (
    <Card interactive className="flex flex-col overflow-hidden">
      <Link to={`/events/${event.route}`} className="flex flex-1 flex-col">
        {/* Cover: image if present, else a generated gradient band */}
        <div className="relative h-36 bg-gradient-to-br from-brand-300 to-teal-400">
          {event.featured_image && (
            <img
              src={event.featured_image}
              alt={event.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}
          <span className="absolute left-3 top-3">
            <Badge variant={EVENT_TYPE_VARIANT[event.event_type]}>
              {EVENT_TYPE_LABEL[event.event_type]}
            </Badge>
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            {formatEventDate(event.start_date)}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold leading-snug text-ink">
            {event.title}
          </h3>
          {event.short_description && (
            <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
              {event.short_description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="font-display text-base font-black text-brand-600">
              {formatPrice(event.price)}
            </span>
            <span
              className={
                seatsLow
                  ? "text-xs font-bold text-brand-600"
                  : "text-xs font-semibold text-ink-muted"
              }
            >
              {event.remaining_seats > 0
                ? `Sisa ${event.remaining_seats} kursi`
                : "Kursi penuh"}
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
