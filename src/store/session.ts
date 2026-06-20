/**
 * Zustand session store — persisted to localStorage under "edubing.session".
 * Mirrors the CSRF token into the frappeCall client via setCsrfToken.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setCsrfToken } from "../lib/frappe/client";
import type { SessionStatus } from "../lib/frappe/types";

/** Shape of the persisted session state. */
export interface SessionState {
  user: string | null;
  student: string | null;
  status: SessionStatus;
  csrf_token: string | null;

  /** Mark session as authenticated. Also wires the CSRF token into the client. */
  set_session(user: string, student: string | null, csrf_token: string | null): void;

  /** Clear session (e.g. on logout). Sets status to "guest" and nulls all fields. */
  clear(): void;

  /** Update only the loading/auth/guest status. */
  set_status(status: SessionStatus): void;
}

const STORAGE_KEY = "edubing.session";

/** Zustand hook — persisted to localStorage. */
export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      student: null,
      status: "loading" as SessionStatus,
      csrf_token: null,

      set_session(user, student, csrf_token) {
        setCsrfToken(csrf_token);
        set({ user, student, csrf_token, status: "authed" });
      },

      clear() {
        setCsrfToken(null);
        set({ user: null, student: null, csrf_token: null, status: "guest" });
      },

      set_status(status) {
        set({ status });
      },
    }),
    { name: STORAGE_KEY },
  ),
);
