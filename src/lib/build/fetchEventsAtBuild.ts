/**
 * Build-time event fetchers for vite-react-ssg SSG prerendering.
 *
 * At build time the Vite dev proxy is NOT running, so we must contact the
 * backend directly using an absolute URL with a spoofed `Host` header for
 * Frappe multisite routing.
 *
 * WHY node:http instead of fetch():
 *   Node's undici `fetch()` implementation forbids setting a custom `Host`
 *   header (throws "forbidden header name"). node:http has no such
 *   restriction, so we can set Host=edubing.localhost while connecting to
 *   localhost:8080 — exactly what Frappe needs to route to the right site.
 *
 * GRACEFUL DEGRADATION:
 *   Every function catches ALL errors (network, non-200, non-JSON, timeout)
 *   and returns [] / null so `npm run build` always succeeds even when the
 *   backend is unreachable.
 */

import * as http from "node:http";
import * as https from "node:https";
import type { PublicEvent } from "../api/events";

/**
 * Read an env var safely. This module is Node-only, but guard `process` so an
 * accidental browser import never throws "process is not defined" at eval time.
 */
function readEnv(key: string): string | undefined {
  return typeof process !== "undefined" ? process.env?.[key] : undefined;
}

/** Base URL for direct backend access at build time (no Vite proxy). */
const BUILD_API_URL = readEnv("VITE_BUILD_API_URL") ?? "http://localhost:8080";

/**
 * Host header injected into every request so Frappe's multisite router
 * selects the correct site.
 */
const SITE_HOST = readEnv("VITE_FRAPPE_SITE_HOST") ?? "edubing.localhost";

/** Frappe whitelisted method — public event list. */
const METHOD_LIST = "vernon_edubing.eb_event.api.public.list_events";
/** Frappe whitelisted method — single event by route slug. */
const METHOD_GET = "vernon_edubing.eb_event.api.public.get_event";

/** Request timeout in milliseconds (10 s). */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Build the Frappe `/api/method/…` URL string with optional query params.
 */
function buildUrl(method: string, params?: Record<string, string>): URL {
  const url = new URL(`/api/method/${method}`, BUILD_API_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  return url;
}

/**
 * Perform an HTTP/HTTPS GET using node:http (or node:https).
 *
 * Sets the `Host` header explicitly so Frappe can route multisite requests.
 * Resolves with the parsed response body on 2xx, rejects on any other
 * status, network error, or timeout.
 *
 * @param url - Parsed URL to request.
 * @returns Parsed JSON body.
 */
function nodeGet(url: URL): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const lib = url.protocol === "https:" ? https : http;

    const options: http.RequestOptions = {
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : url.protocol === "https:" ? 443 : 80,
      path: url.pathname + url.search,
      method: "GET",
      headers: {
        Accept: "application/json",
        // Override Host so Frappe's multisite router selects the right site.
        Host: SITE_HOST,
      },
    };

    const req = lib.request(options, (res) => {
      if (res.statusCode == null || res.statusCode < 200 || res.statusCode >= 300) {
        res.resume(); // discard body
        reject(new Error(`HTTP ${res.statusCode ?? "?"} for ${url.href}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
        } catch (err) {
          reject(err);
        }
      });
      res.on("error", reject);
    });

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error(`Timeout after ${REQUEST_TIMEOUT_MS}ms for ${url.href}`));
    });

    req.on("error", reject);
    req.end();
  });
}

/**
 * Fetch the full public event list at build time.
 *
 * Returns `[]` on ANY error (network, non-200, non-JSON, timeout) so SSG
 * prerendering never crashes.
 */
export async function fetchAllEventsAtBuild(): Promise<PublicEvent[]> {
  try {
    const json = (await nodeGet(buildUrl(METHOD_LIST))) as {
      message?: PublicEvent[];
    };
    return Array.isArray(json.message) ? json.message : [];
  } catch (err) {
    console.warn("[build] fetchAllEventsAtBuild failed:", (err as Error).message);
    return [];
  }
}

/**
 * Fetch a single public event by its route slug at build time.
 *
 * Returns `null` on ANY error so SSG prerendering never crashes.
 *
 * @param slug - URL-safe route slug (e.g. "demo-workshop").
 */
export async function fetchEventAtBuild(
  slug: string,
): Promise<PublicEvent | null> {
  if (!slug) return null;
  try {
    const json = (await nodeGet(buildUrl(METHOD_GET, { route: slug }))) as {
      message?: PublicEvent;
    };
    return json.message ?? null;
  } catch (err) {
    console.warn(
      `[build] fetchEventAtBuild("${slug}") failed:`,
      (err as Error).message,
    );
    return null;
  }
}
