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

// ─── Seat-availability helpers ───────────────────────────────────────────────
//
// The backend encodes capacity as:
//   remaining_seats === null  → unlimited (capacity 0 in Frappe = no limit)
//   remaining_seats === 0     → genuinely full
//   remaining_seats > 0       → N seats still available
//
// These helpers centralise that contract so no component re-implements it.

/**
 * Returns `true` only when the event has no seats remaining (`=== 0`).
 * `null` (unlimited) and any positive number are NOT sold out.
 */
export function is_sold_out(remaining_seats: number | null): boolean {
  return remaining_seats === 0;
}

/**
 * Returns `true` when remaining seats are low enough to show urgency styling.
 * Unlimited capacity (`null`) is never considered "low" — never show urgency.
 * A genuinely full event (`0`) is handled by `is_sold_out`; it is not "low".
 */
export function is_seats_low(
  remaining_seats: number | null,
  threshold = LOW_SEATS_THRESHOLD,
): boolean {
  return remaining_seats !== null && remaining_seats > 0 && remaining_seats <= threshold;
}

/** Threshold below which remaining seats trigger urgency/red styling. */
const LOW_SEATS_THRESHOLD = 10;

/**
 * Human-readable Bahasa Indonesia label for the remaining-seats state.
 *
 * - `null`  → "Kuota tersedia"  (unlimited; no badge clutter, positive signal)
 * - `0`     → "Kursi penuh"
 * - `N > 0` → "Sisa N kursi"
 */
export function seats_label(remaining_seats: number | null): string {
  if (remaining_seats === null) return "Kuota tersedia";
  if (remaining_seats === 0) return "Kursi penuh";
  return `Sisa ${remaining_seats} kursi`;
}

// ─────────────────────────────────────────────────────────────────────────────

/** Format a price as "Gratis" or "Rp250.000". */
export function formatPrice(price: number): string {
  if (!price || price <= 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}
