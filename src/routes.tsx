import type { RouteRecord } from "vite-react-ssg";
import AppProviders from "./providers/AppProviders";
import Home from "./pages/Home";

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <AppProviders />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
];
