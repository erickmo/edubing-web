import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dockerized Frappe: the frontend nginx publishes :8080; the site is selected by
// the Host header. So we proxy to localhost:8080 and rewrite Host to the site name.
const API_TARGET = process.env.VITE_API_TARGET ?? "http://localhost:8080";
const FRAPPE_SITE_HOST = process.env.VITE_FRAPPE_SITE_HOST ?? "edubing.localhost";

// Frappe routes by Host header; rewrite it to the site name on every proxied req.
const rewriteHost = (proxy: { on: (e: string, cb: (req: { setHeader: (k: string, v: string) => void }) => void) => void }) =>
  proxy.on("proxyReq", (req) => req.setHeader("Host", FRAPPE_SITE_HOST));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true, configure: rewriteHost },
      // Frappe static assets (also Host-routed)
      "/assets": { target: API_TARGET, changeOrigin: true, configure: rewriteHost },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
