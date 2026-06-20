# Edubing Web

Landing page Edubing — Vite + React + vite-react-ssg + Tailwind CSS.

## Router / SSG Decision

**Router:** `react-router-dom` v6 (data router via `createBrowserRouter`)
**SSG engine:** `vite-react-ssg` — chosen over TanStack Router because the project requires
static prerendering (SEO/GEO), and vite-react-ssg is purpose-built on react-router v6.

## Perintah

```bash
# Install dependensi
npm install

# Dev server (CSR — fast, no SSR overhead in dev)
npm run dev

# SSG build (prerender semua route ke HTML statis)
npm run build

# Preview hasil build
npm run preview

# Run tests
npm run test

# Type check
npm run typecheck
```

Dev server berjalan di `http://localhost:5174`.
Semua request `/api/*` di-proxy ke `VITE_API_TARGET` (default: `http://edubing.localhost`).

## Variabel Lingkungan

Salin `.env.example` ke `.env` lalu isi nilai yang diperlukan:

| Variabel | Keterangan |
|---|---|
| `VITE_API_TARGET` | URL backend Frappe (dev proxy target) |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |
| `VITE_MIDTRANS_CLIENT_KEY` | Midtrans client key |
| `VITE_MIDTRANS_SNAP_URL` | URL Snap.js Midtrans |

## Arsitektur

- `src/main.tsx` — entri `ViteReactSSG`, export `createRoot`
- `src/routes.tsx` — definisi route (react-router `RouteRecord[]`)
- `src/providers/AppProviders.tsx` — root layout yang inject `QueryClientProvider`
- `src/pages/` — komponen halaman
- `src/lib/cn.ts` — utility `cn()` (clsx + tailwind-merge)
- `src/styles.css` — Tailwind directives
