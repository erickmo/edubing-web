/**
 * Shared date utilities for edubing-web.
 *
 * Frappe emits datetime strings in "YYYY-MM-DD HH:MM:SS" format (space
 * separator, no "T"). Safari / WebKit's Date parser is strict about ISO 8601
 * and returns NaN for the space-separated form; V8 (Chrome / Node) is lenient
 * and accepts it — so bugs caused by this mismatch are invisible in tests and
 * Chrome but break silently on Safari.
 *
 * Always parse Frappe datetime/date strings through `parse_frappe_date` rather
 * than `new Date(someString)` directly.
 */

/**
 * Parse a Frappe datetime / date string safely across all browsers.
 *
 * Frappe emits "YYYY-MM-DD HH:MM:SS" (space separator). Safari rejects this
 * as invalid; `new Date("2026-06-22 09:00:00")` returns NaN in WebKit but
 * works in V8. This helper normalises the separator to "T" before parsing.
 *
 * @param value - A Frappe datetime string, an ISO 8601 string, or a falsy
 *   value (null / undefined / "").
 * @returns A valid `Date` object, or `null` when `value` is falsy or the
 *   resulting Date is invalid (isNaN).
 */
export function parse_frappe_date(
  value: string | null | undefined,
): Date | null {
  if (!value) return null;
  const d = new Date(String(value).replace(" ", "T"));
  if (isNaN(d.getTime())) return null;
  return d;
}
