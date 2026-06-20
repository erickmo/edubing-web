/**
 * Application route tree for vite-react-ssg.
 *
 * Public routes (Home, Events, EventDetail, Masuk, Daftar) are fully
 * prerenderable — no RequireAuth, no client-only data at module scope.
 *
 * Protected routes (Checkout, Akun) are wrapped with RequireAuth so
 * unauthenticated visitors are redirected to /masuk.
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

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <AppProviders />,
    children: [
      // Public — prerenderable
      { index: true, element: <Home /> },
      { path: "events", element: <Events /> },
      { path: "events/:slug", element: <EventDetail /> },
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
