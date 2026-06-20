import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./routes";
import "./styles.css";

/**
 * ViteReactSSG entry point.
 *
 * API (v0.9.1-beta.1):
 *   ViteReactSSG(routerOptions, setupFn?, clientOptions?)
 *
 * Providers (QueryClientProvider) are injected via the root Layout component
 * (AppProviders) in the route tree, which wraps all child routes with
 * <Outlet />. This is the recommended pattern when the setup callback does
 * not expose a root-component wrapper.
 *
 * Head/meta is handled by <Head> exported from 'vite-react-ssg' (wraps
 * react-helmet-async internally). No separate HelmetProvider is needed.
 */
export const createRoot = ViteReactSSG({ routes });
