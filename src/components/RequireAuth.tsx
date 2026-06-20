/**
 * RequireAuth — route guard component.
 *
 * Checks the Zustand session status and either:
 *   - "loading" → shows a lightweight loading fallback
 *   - "guest"   → redirects to /masuk with a `redirect` query param
 *   - "authed"  → renders children
 *
 * The `roles` prop is accepted for future RBAC but currently unused
 * (student-only app — any authenticated user is permitted).
 */
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../store/session";

/** Props accepted by RequireAuth. */
interface RequireAuthProps {
  children: ReactNode;
  /** Reserved for future role-based access control. Currently unused. */
  roles?: string[];
}

/**
 * Wraps protected content — redirects unauthenticated visitors to /masuk.
 *
 * Usage:
 * ```tsx
 * <RequireAuth>
 *   <AkunPage />
 * </RequireAuth>
 * ```
 */
export function RequireAuth({ children }: RequireAuthProps): JSX.Element {
  const status = useSession((s) => s.status);
  const location = useLocation();

  if (status === "loading") {
    return <div>Memuat…</div>;
  }

  if (status === "guest") {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/masuk?redirect=${redirect}`} replace />;
  }

  // status === "authed"
  return <>{children}</>;
}
