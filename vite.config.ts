import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildSitemap } from "./src/lib/seo/sitemap";
import { fetchAllEventsAtBuild } from "./src/lib/build/fetchEventsAtBuild";
import { SITE_URL } from "./src/lib/seo/jsonld";

// Dockerized Frappe: the frontend nginx publishes :8080; the site is selected by
// the Host header. So we proxy to localhost:8080 and rewrite Host to the site name.
const API_TARGET = process.env.VITE_API_TARGET ?? "http://localhost:8080";
const FRAPPE_SITE_HOST = process.env.VITE_FRAPPE_SITE_HOST ?? "edubing.localhost";

// Frappe routes by Host header; rewrite it to the site name on every proxied req.
const rewriteHost = (proxy: { on: (e: string, cb: (req: { setHeader: (k: string, v: string) => void }) => void) => void }) =>
  proxy.on("proxyReq", (req) => req.setHeader("Host", FRAPPE_SITE_HOST));

/**
 * Generate sitemap.xml into the build output directory.
 *
 * Called from vite-react-ssg's `onFinished` hook so we can import existing
 * TS functions directly (buildSitemap + fetchAllEventsAtBuild) with zero
 * logic duplication. Graceful: a failed event fetch still produces a
 * static-routes-only sitemap and never crashes the build.
 *
 * @param dir - Absolute path to the dist/ output directory.
 */
async function generateSitemap(dir: string): Promise<void> {
  const STATIC_PATHS = ["/", "/events"] as const;

  // Fetch published events — returns [] gracefully on any error.
  const events = await fetchAllEventsAtBuild();
  const event_slugs = events
    .filter((e) => Boolean(e.route))
    .map((e) => e.route as string);

  const xml = buildSitemap(SITE_URL, [...STATIC_PATHS], event_slugs);

  const dest = join(dir, "sitemap.xml");
  writeFileSync(dest, xml, "utf8");
  console.log(
    `[seo] sitemap.xml written → ${event_slugs.length} event slug(s) + ${STATIC_PATHS.length} static paths`,
  );
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // Allow Cloudflare quick-tunnel hosts to reach the dev server (dev-only).
    allowedHosts: [".trycloudflare.com"],
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true, configure: rewriteHost },
      // Frappe static assets (also Host-routed)
      "/assets": { target: API_TARGET, changeOrigin: true, configure: rewriteHost },
    },
  },
  ssgOptions: {
    /**
     * Post-build hook: generate sitemap.xml into dist/ after all HTML pages
     * have been written. Receives the absolute dist/ path as `dir`.
     */
    onFinished: generateSitemap,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
