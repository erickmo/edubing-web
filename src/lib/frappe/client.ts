/**
 * Low-level Frappe API client.
 * Handles CSRF token management, credentials, and error parsing.
 */

const API_PREFIX = "/api/method";

/** Stored CSRF token; null means "no token yet". */
let csrfToken: string | null = null;

/**
 * Set the current CSRF token.
 * Pass null to clear (e.g. on logout).
 */
export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

/** Return the current CSRF token, or null if not set. */
export function getCsrfToken(): string | null {
  return csrfToken;
}

/**
 * Parse Frappe _server_messages into a human-readable string.
 * _server_messages is a JSON-stringified array of JSON strings.
 * Each element: { message: string, title?: string }
 */
function parseServerMessages(raw: string): string | null {
  try {
    const outer = JSON.parse(raw) as unknown[];
    if (!Array.isArray(outer) || outer.length === 0) return null;
    const first = JSON.parse(outer[0] as string) as { message?: string };
    return typeof first.message === "string" ? first.message : null;
  } catch {
    return null;
  }
}

/**
 * Error thrown when a Frappe API call returns an HTTP error response.
 */
export class FrappeError extends Error {
  constructor(
    message: string,
    public status?: number,
    public serverMessages?: string[],
  ) {
    super(message);
    this.name = "FrappeError";
  }
}

const GENERIC_ERROR_MSG = "Terjadi kesalahan. Coba lagi.";

/**
 * Call a Frappe API method.
 * Unwraps the { message } envelope and throws FrappeError on HTTP errors.
 */
export async function frappeCall<T = unknown>(
  method: string,
  args?: Record<string, unknown>,
  opts?: { method?: "GET" | "POST" },
): Promise<T> {
  const httpMethod = opts?.method ?? "POST";
  const url = `${API_PREFIX}/${method}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (csrfToken !== null && httpMethod !== "GET") {
    headers["X-Frappe-CSRF-Token"] = csrfToken;
  }

  const fetchOptions: RequestInit = {
    method: httpMethod,
    credentials: "include",
    headers,
  };

  if (httpMethod === "POST" && args !== undefined) {
    fetchOptions.body = JSON.stringify(args);
  }

  const res = await fetch(url, fetchOptions);
  const body = await res.json().catch(() => ({})) as Record<string, unknown>;

  if (!res.ok) {
    const rawServerMsgs = body._server_messages as string | undefined;
    let userMessage = GENERIC_ERROR_MSG;

    if (rawServerMsgs) {
      const parsed = parseServerMessages(rawServerMsgs);
      if (parsed) userMessage = parsed;
    }

    const msgs = rawServerMsgs ? [rawServerMsgs] : undefined;
    throw new FrappeError(userMessage, res.status, msgs);
  }

  return (body as { message: T }).message;
}
