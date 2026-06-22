/**
 * useHydrateSession — client-side session hydration hook.
 *
 * Runs once on mount (client only). During SSG prerender there is no `window`,
 * so the useEffect body never executes — public pages stay fully static.
 *
 * Behaviour:
 *   1. If the store status is not "loading", do nothing (already resolved).
 *   2. Call whoami() — a guest-safe probe (no 403 for anonymous visitors,
 *      unlike frappe.auth.get_logged_user).
 *   3. If a real user is returned (not "Guest"):
 *      - Fetch a CSRF token via getCsrf().
 *      - Store the session via set_session(user, student, csrf).
 *   4. If "Guest" or an error occurs: set_status("guest").
 */
import { useEffect } from "react";
import { whoami, getCsrf } from "../lib/frappe/auth";
import { useSession } from "../store/session";

/**
 * Wire into AppProviders so every page benefits from session hydration.
 * Safe to call during SSG prerender — the effect guard ensures no network
 * requests are made in a Node.js context (no window present).
 */
export function useHydrateSession(): void {
  const status = useSession((s) => s.status);
  const set_session = useSession((s) => s.set_session);
  const set_status = useSession((s) => s.set_status);

  useEffect(() => {
    // SSG guard: this block only runs in a real browser (window exists).
    // During Node.js prerender, useEffect is never called.
    if (status !== "loading") return;

    let cancelled = false;

    async function hydrate() {
      try {
        const { user, student } = await whoami();
        if (cancelled) return;

        if (user && user !== "Guest") {
          const csrf = await getCsrf();
          if (cancelled) return;
          set_session(user, student, csrf);
        } else {
          set_status("guest");
        }
      } catch {
        if (!cancelled) set_status("guest");
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount
}
