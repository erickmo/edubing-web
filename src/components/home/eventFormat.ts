/**
 * Formatting helpers for event display (Bahasa Indonesia).
 * Kept separate so both FeaturedEvents and the future Events list can reuse them.
 */
import type { EventType } from "../../lib/api/events";

/** Human-readable Bahasa label per event_type. */
export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  online: "Online",
  offline: "Tatap Muka",
  workshop: "Workshop",
  kompetisi: "Kompetisi",
};

/** Badge variant per event_type. */
export const EVENT_TYPE_VARIANT: Record<
  EventType,
  "brand" | "teal" | "sun" | "ink"
> = {
  online: "teal",
  offline: "brand",
  workshop: "sun",
  kompetisi: "ink",
};

/** Format an ISO date as "12 Agu 2025" in Bahasa Indonesia. */
export function formatEventDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Format a price as "Gratis" or "Rp250.000". */
export function formatPrice(price: number): string {
  if (!price || price <= 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}
