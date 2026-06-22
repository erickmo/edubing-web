/**
 * Public event data hooks.
 *
 * Thin React Query wrappers over the Frappe public event API. Data keys are
 * snake_case to mirror the API payload exactly (no client-side renaming).
 * Consumed by FeaturedEvents (home), the Events list, and EventDetail.
 */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { frappeCall } from "../frappe/client";

/** Event type taxonomy used for badges and JSON-LD attendance mode. */
export type EventType = "online" | "offline" | "workshop" | "kompetisi";

/**
 * One agenda/session row within an event. Detail-only — present only in the
 * `get_event` payload (never in the list endpoint). All fields optional so a
 * partially-filled session never breaks rendering.
 */
export interface EventSession {
  /** Session heading (e.g. "Babak Penyisihan"). */
  session_title?: string;
  /** ISO date-time string for this session; null when not scheduled. */
  session_date?: string | null;
  /** Online meeting URL; null for in-person or unset. */
  meeting_link?: string | null;
  /** Venue label; null for online or unset. */
  location?: string | null;
}

/**
 * Public-facing event record returned by the Frappe public API.
 * Keys are snake_case to match the server payload verbatim.
 */
export interface PublicEvent {
  /** Frappe document name (primary key). */
  name: string;
  /** URL-safe slug used in /events/:route. */
  route: string;
  title: string;
  event_type: EventType;
  /** ISO date-time string. */
  start_date: string;
  /** ISO date-time string. */
  end_date: string;
  location: string;
  /** Price in IDR; 0 means free ("Gratis"). */
  price: number;
  capacity: number;
  /**
   * Remaining seats for this event.
   * - `null`  → unlimited capacity (capacity 0 on the backend); never full.
   * - `0`     → genuinely FULL; registration must be blocked.
   * - `N > 0` → N seats still available.
   */
  remaining_seats: number | null;
  /** Cover image URL; null when the API returns null (not yet set). */
  featured_image: string | null;
  /** Brief description; null when the API returns null (not yet set). */
  short_description: string | null;

  // ── Detail-only fields ──────────────────────────────────────────────────
  // Present ONLY in the get_event payload, never in list_events. Typed
  // optional so list-derived `PublicEvent`s (EventCard, RelatedEvents) stay
  // valid without these keys.

  /** Free-form kompetisi/category note shown in "Informasi Kompetisi". */
  category_info?: string | null;
  /** Admin-authored HTML body for "Tentang Event" (trusted source). */
  description_rich?: string | null;
  /** Newline-separated benefits list ("Apa yang Kamu Dapat"). */
  what_you_get?: string | null;
  /** Newline-separated requirements list ("Persyaratan"). */
  requirements?: string | null;
  /** Organizer name shown in "Penyelenggara". */
  organizer?: string | null;
  /** Top-level meeting link (online events). */
  meeting_link?: string | null;
  /** Agenda rows for "Jadwal & Agenda". */
  sessions?: EventSession[];
}

const METHOD_LIST = "vernon_edubing.eb_event.api.public.list_events";
const METHOD_GET = "vernon_edubing.eb_event.api.public.get_event";

/** React Query cache keys for event data. */
export const eventKeys = {
  list: ["events", "list"] as const,
  detail: (route: string) => ["events", "detail", route] as const,
};

/**
 * Fetch the list of public events.
 * Returns a React Query result with `PublicEvent[]` data.
 */
export function useEvents(): UseQueryResult<PublicEvent[], Error> {
  return useQuery({
    queryKey: eventKeys.list,
    queryFn: () => frappeCall<PublicEvent[]>(METHOD_LIST, undefined, { method: "GET" }),
  });
}

/**
 * Fetch a single public event by its `route` slug.
 * Disabled when `slug` is empty so it never fires with a missing param.
 */
export function useEvent(slug: string): UseQueryResult<PublicEvent, Error> {
  return useQuery({
    queryKey: eventKeys.detail(slug),
    queryFn: () => frappeCall<PublicEvent>(METHOD_GET, { route: slug }),
    enabled: slug.length > 0,
  });
}
