/**
 * AppProviders — root layout component.
 *
 * Wraps the entire app with global providers so all child routes
 * have access to QueryClient, session hydration, etc.
 *
 * SSG-safe QueryClient: the client is created per provider instance via
 * useState (lazy initialiser), preventing cache bleed between pages during
 * SSG prerender where each route renders in the same Node.js process.
 */
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { useHydrateSession } from "../hooks/useHydrateSession";

/** staleTime constant — avoids magic numbers. */
const QUERY_STALE_TIME_MS = 60_000;

/**
 * Inner component that must live inside QueryClientProvider.
 * Calls useHydrateSession so the hook has access to all providers.
 * During SSG prerender the hydration hook is a no-op (no useEffect in Node).
 */
function AppInner() {
  useHydrateSession();
  return <Outlet />;
}

/**
 * Root provider wrapper rendered as the root element in the route tree.
 * All pages are children of this component via react-router's <Outlet />.
 */
export default function AppProviders() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_STALE_TIME_MS,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
