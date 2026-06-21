/**
 * Application route tree for vite-react-ssg.
 *
 * Public routes (Home, Events, EventDetail, Masuk, Daftar) are fully
 * prerenderable — no RequireAuth, no client-only data at module scope.
 *
 * Protected routes (Checkout, Akun) are wrapped with RequireAuth so
 * unauthenticated visitors are redirected to /masuk.
 *
 * SSG loaders:
 *  - events       → fetchAllEventsAtBuild() inlined into static HTML
 *  - events/:slug → getStaticPaths + fetchEventAtBuild() per slug
 */
import type { RouteRecord } from "vite-react-ssg";
import AppProviders from "./providers/AppProviders";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Masuk from "./pages/Masuk";
import Daftar from "./pages/Daftar";
import Checkout from "./pages/Checkout";
import Akun from "./pages/Akun";
import { RequireAuth } from "./components/RequireAuth";
// NOTE: ./lib/build/fetchEventsAtBuild is Node-only (uses node:http + process.env).
// It is dynamically imported ONLY inside build-time paths (getStaticPaths / SSG
// loaders) so it never enters the client bundle — a static import here would
// evaluate `process.env` in the browser and crash the app (blank page).

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <AppProviders />,
    children: [
      // Public — prerenderable
      { index: true, element: <Home /> },
      {
        path: "events",
        element: <Events />,
        loader: async () => {
          // Only fetch at build time (SSG); at runtime React Query takes over.
          if (typeof window !== "undefined") return null;
          const { fetchAllEventsAtBuild } = await import("./lib/build/fetchEventsAtBuild");
          return fetchAllEventsAtBuild();
        },
      },
      {
        path: "events/:slug",
        element: <EventDetail />,
        getStaticPaths: async () => {
          // Build-only: dynamic import keeps the Node module out of the client.
          const { fetchAllEventsAtBuild } = await import("./lib/build/fetchEventsAtBuild");
          const events = await fetchAllEventsAtBuild();
          // Filter out events without a route slug so we never generate a
          // broken path like "events/undefined" or "events/".
          return events
            .filter((e) => Boolean(e.route))
            .map((e) => `events/${e.route}`);
        },
        loader: async ({ params }: { params: Record<string, string | undefined> }) => {
          if (typeof window !== "undefined") return null;
          const { fetchEventAtBuild } = await import("./lib/build/fetchEventsAtBuild");
          return fetchEventAtBuild(params["slug"] ?? "");
        },
      },
      { path: "masuk", element: <Masuk /> },
      { path: "daftar", element: <Daftar /> },

      // Protected — RequireAuth redirects guests to /masuk
      {
        path: "checkout/:slug",
        element: (
          <RequireAuth>
            <Checkout />
          </RequireAuth>
        ),
      },
      {
        path: "akun",
        element: (
          <RequireAuth>
            <Akun />
          </RequireAuth>
        ),
      },
    ],
  },
];
