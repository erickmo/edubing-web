/**
 * CheckoutSummary — ringkasan event sebelum pengguna mengkonfirmasi pendaftaran.
 * Menampilkan judul, tipe, tanggal, harga, dan status kursi.
 */
import type { PublicEvent } from "../../lib/api/events";
import {
  formatEventDate,
  formatPrice,
  seats_label,
} from "../home/eventFormat";
import { EVENT_TYPE_LABEL } from "../home/eventFormat";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";

/** Props untuk CheckoutSummary. */
export interface CheckoutSummaryProps {
  event: PublicEvent;
}

/**
 * Kartu ringkasan event yang ditampilkan di halaman checkout.
 * Harga "Gratis" ditampilkan untuk event dengan price === 0.
 */
export function CheckoutSummary({ event }: CheckoutSummaryProps): JSX.Element {
  const priceLabel = formatPrice(event.price);
  const typeLabel = EVENT_TYPE_LABEL[event.event_type] ?? event.event_type;
  const dateLabel = formatEventDate(event.start_date);
  const seatsInfo = seats_label(event.remaining_seats);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">{typeLabel}</Badge>
        </div>
        <h2 className="mt-3 font-display text-xl font-bold text-ink">
          {event.title}
        </h2>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm text-ink-soft">
          <div className="flex justify-between">
            <dt className="font-medium text-ink">Tanggal</dt>
            <dd>{dateLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-ink">Lokasi</dt>
            <dd>{event.location}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-ink">Kursi</dt>
            <dd>{seatsInfo}</dd>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-2">
            <dt className="font-bold text-ink">Harga</dt>
            <dd className="font-bold text-brand-600">{priceLabel}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
