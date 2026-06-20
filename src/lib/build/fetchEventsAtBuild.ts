/**
 * Build-time event fetchers for vite-react-ssg SSG prerendering.
 *
 * At build time the Vite dev proxy is not running, so we must fetch from the
 * backend directly using an absolute URL with an explicit Host header.
 *
 * All functions are GRACEFUL: any network error returns an empty / null value
 * so the build always succeeds even when the backend is unreachable.
 */

import type { PublicEvent } from "../api/events";

const BUILD_API_URL =
  process.env.VITE_BUILD_API_URL ?? "http://localhost:8080";
const SITE_HOST =
  process.env.VITE_FRAPPE_SITE_HOST ?? "edubing.localhost";

const METHOD_LIST = "vernon_edubing.eb_event.api.public.list_events";
const METHOD_GET = "vernon_edubing.eb_event.api.public.get_event";

/** Build the Frappe method URL for a given resource method. */
function buildUrl(method: string, params?: Record<string, string>): string {
  const url = new URL(
    `/api/method/${method}`,
    BUILD_API_URL,
  );
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

/** Common fetch options: JSON accept + spoofed Host header for Frappe multisite. */
function buildFetchOptions(): RequestInit {
  return {
    headers: {
      Accept: "application/json",
      Host: SITE_HOST,
    },
  };
}

/**
 * Fetch the full public event list at build time.
 * Returns [] on any error so SSG prerendering never fails.
 */
export async function fetchAllEventsAtBuild(): Promise<PublicEvent[]> {
  try {
    const res = await fetch(buildUrl(METHOD_LIST), buildFetchOptions());
    if (!res.ok) return [];
    const json = (await res.json()) as { message?: PublicEvent[] };
    return Array.isArray(json.message) ? json.message : [];
  } catch {
    return [];
  }
}

/**
 * Fetch a single public event by route slug at build time.
 * Returns null on any error so SSG prerendering never fails.
 */
export async function fetchEventAtBuild(
  slug: string,
): Promise<PublicEvent | null> {
  if (!slug) return null;
  try {
    const res = await fetch(
      buildUrl(METHOD_GET, { route: slug }),
      buildFetchOptions(),
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { message?: PublicEvent };
    return json.message ?? null;
  } catch {
    return null;
  }
}
