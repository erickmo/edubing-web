/**
 * Frappe authentication functions.
 * All calls use frappeCall which handles credentials and CSRF.
 */

import { frappeCall, setCsrfToken } from "./client";
import type { RegisterPayload } from "./types";

/** API method paths — no magic strings. */
const METHOD_LOGIN = "login";
const METHOD_LOGOUT = "logout";
const METHOD_GET_LOGGED_USER = "frappe.auth.get_logged_user";
const METHOD_GET_CSRF = "vernon_edubing.eb_student.api.auth.get_csrf";
const METHOD_REGISTER = "vernon_edubing.eb_student.api.auth.register";

/**
 * Log in with email/password.
 * After login, fetches a CSRF token and stores it via setCsrfToken.
 */
export async function login(usr: string, pwd: string): Promise<void> {
  await frappeCall(METHOD_LOGIN, { usr, pwd });
  const token = await getCsrf();
  setCsrfToken(token);
}

/**
 * Register a new student account.
 * Returns the created student name and the new CSRF token.
 */
export async function register(
  payload: RegisterPayload,
): Promise<{ student: string; csrf_token: string }> {
  return frappeCall<{ student: string; csrf_token: string }>(
    METHOD_REGISTER,
    payload as unknown as Record<string, unknown>,
  );
}

/**
 * Log out the current user.
 * Clears the stored CSRF token regardless of server response.
 */
export async function logout(): Promise<void> {
  try {
    await frappeCall(METHOD_LOGOUT);
  } finally {
    setCsrfToken(null);
  }
}

/**
 * Get the currently logged-in user's email.
 * Returns "Guest" if not authenticated.
 */
export async function getLoggedUser(): Promise<string> {
  return frappeCall<string>(METHOD_GET_LOGGED_USER, undefined, {
    method: "GET",
  });
}

/**
 * Fetch or generate a CSRF token from the backend.
 * Call after login to obtain a token for subsequent POST requests.
 */
export async function getCsrf(): Promise<string> {
  const result = await frappeCall<{ csrf_token: string }>(METHOD_GET_CSRF);
  return result.csrf_token;
}
