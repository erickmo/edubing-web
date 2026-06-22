/**
 * EventQuickFacts — at-a-glance facts card for the event detail sidebar.
 *
 * Surfaces date/time, duration, location (or "Online"), quota, type, and
 * kategori (only for kompetisi). Each row renders only when its value is
 * meaningful, so the card never shows an empty fact.
 */

import { Card } from "../ui/Card";
import type { PublicEvent } from "../../lib/api/events";
import {
  EVENT_TYPE_LABEL,
  formatDuration,
  formatEventDateTime,
} from "../home/eventFormat";

/** Props for EventQuickFacts. */
export interface EventQuickFactsProps {
  event: PublicEvent;
}

/** A single icon + label/value fact row. */
interface Fact {
  icon: string;
  label: string;
  value: string;
}

/** Quota label: 0 capacity → unlimited; else remaining / total. */
function quotaLabel(event: PublicEvent): string {
  if (event.capacity === 0 || event.remaining_seats === null) {
    return "Tak terbatas";
  }
  return `${event.remaining_seats} dari ${event.capacity} kursi`;
}

/** Build the ordered list of facts, dropping rows without a value. */
function buildFacts(event: PublicEvent): Fact[] {
  const isOnline = event.event_type === "online";
  const dateValue = formatEventDateTime(event.start_date);
  const duration = formatDuration(event.start_date, event.end_date);

  const facts: (Fact | null)[] = [
    dateValue ? { icon: "📅", label: "Tanggal & Waktu", value: dateValue } : null,
    duration ? { icon: "⏱", label: "Durasi", value: duration } : null,
    {
      icon: isOnline ? "🔗" : "📍",
      label: isOnline ? "Format" : "Lokasi",
      value: isOnline ? "Online" : event.location || "Akan diumumkan",
    },
    { icon: "👥", label: "Kuota", value: quotaLabel(event) },
    { icon: "🏷", label: "Tipe", value: EVENT_TYPE_LABEL[event.event_type] },
    event.event_type === "kompetisi" && event.category_info
      ? { icon: "🏆", label: "Kategori", value: event.category_info }
      : null,
  ];

  return facts.filter((fact): fact is Fact => fact !== null);
}

/**
 * Renders the quick-facts card. Always shows at least the type + kuota rows.
 */
export function EventQuickFacts({ event }: EventQuickFactsProps): JSX.Element {
  const facts = buildFacts(event);
  return (
    <Card className="p-6">
      <h2 className="font-display text-base font-bold text-ink">Fakta Singkat</h2>
      <dl className="mt-4 space-y-3">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-start gap-3">
            <span aria-hidden="true" className="text-lg leading-none">
              {fact.icon}
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                {fact.label}
              </dt>
              <dd className="text-sm font-semibold text-ink">{fact.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </Card>
  );
}
