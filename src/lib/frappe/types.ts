/**
 * Shared types for the Frappe data layer.
 */

/** Status of the current user session. */
export type SessionStatus = "loading" | "authed" | "guest";

/** Payload required to register a new student account. */
export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  captcha_token: string;
}
