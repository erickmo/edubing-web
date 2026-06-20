/**
 * RegisterCta — sticky call-to-action card for the /events/:slug page.
 *
 * Shows the event price and a "Daftar Event Ini" button linking to
 * /checkout/:slug. When remaining_seats === 0 the button is disabled and
 * the label changes to "Kursi penuh".
 */

import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import type { PublicEvent } from "../../lib/api/events";
import { formatPrice } from "../home/eventFormat";

/** Props for RegisterCta. */
export interface RegisterCtaProps {
  /** Fully-loaded public event record. */
  event: PublicEvent;
}

/**
 * Renders a price-summary card with a registration button.
 * Disabled state applies when no seats remain.
 */
export function RegisterCta({ event }: RegisterCtaProps): JSX.Element {
  const isFull = event.remaining_seats === 0;

  return (
    <Card className="p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
        Harga
      </p>
      <p className="mt-1 font-display text-2xl font-black text-brand-600">
        {formatPrice(event.price)}
      </p>

      {isFull ? (
        <Button
          variant="primary"
          className="mt-4 w-full"
          disabled
          aria-disabled="true"
        >
          Kursi penuh
        </Button>
      ) : (
        <Link to={`/checkout/${event.route}`} className="block mt-4">
          <Button variant="primary" className="w-full">
            Daftar Event Ini
          </Button>
        </Link>
      )}

      {!isFull && event.remaining_seats <= 10 && (
        <p className="mt-2 text-center text-xs font-semibold text-brand-600">
          Sisa {event.remaining_seats} kursi — segera daftar!
        </p>
      )}
    </Card>
  );
}
