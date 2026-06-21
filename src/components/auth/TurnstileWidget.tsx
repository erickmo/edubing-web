/**
 * TurnstileWidget — widget CAPTCHA Cloudflare Turnstile.
 *
 * Memuat script Turnstile secara client-only via useEffect agar tidak
 * crash saat SSG prerender (script injection TIDAK dijalankan di server).
 *
 * Perilaku berdasarkan lingkungan:
 * - DEV  + VITE_TURNSTILE_SITE_KEY tidak ada → gunakan kunci test always-pass
 *   Cloudflare "1x00000000000000000000AA". Backend harus dikonfigurasi dengan
 *   secret test yang sesuai (0x0000000000000000000000000000000AA).
 * - PROD + VITE_TURNSTILE_SITE_KEY tidak ada → tampilkan pesan error dalam
 *   Bahasa Indonesia; onVerify TIDAK pernah dipanggil sehingga form tidak bisa
 *   disubmit (fail-closed).
 */

import { useEffect, useRef } from "react";

/** URL script Cloudflare Turnstile. */
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js";

/** ID elemen DOM untuk container widget. */
const WIDGET_CONTAINER_ID = "cf-turnstile-widget";

/**
 * Kunci test always-pass Cloudflare.
 * HANYA digunakan saat `import.meta.env.DEV` bernilai true.
 */
const DEV_TEST_KEY = "1x00000000000000000000AA";

/** Deklarasi tipe global untuk Cloudflare Turnstile. */
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

/** Props untuk TurnstileWidget. */
export interface TurnstileWidgetProps {
  /** Dipanggil dengan token saat CAPTCHA berhasil diverifikasi. */
  onVerify: (token: string) => void;
  /** Dipanggil saat token kedaluwarsa atau terjadi error. */
  onExpire?: () => void;
}

/**
 * Resolve site key yang efektif berdasarkan lingkungan.
 *
 * - Key terkonfigurasi → gunakan key tersebut (dev maupun prod).
 * - Dev tanpa key      → gunakan kunci test always-pass Cloudflare.
 * - Prod tanpa key     → kembalikan null (fail-closed; tidak ada CAPTCHA).
 *
 * Diekspor agar dapat diuji secara terisolasi tanpa harus memanipulasi
 * `import.meta.env` secara langsung di test.
 */
export function resolveEffectiveSiteKey(
  siteKey: string | undefined,
  isDev: boolean,
): string | null {
  if (siteKey) return siteKey;
  return isDev ? DEV_TEST_KEY : null;
}

/**
 * Render widget Cloudflare Turnstile.
 *
 * - Script dimuat client-only (useEffect) — aman untuk SSG.
 * - Di dev tanpa site key: gunakan kunci test (always-pass) dan tampilkan pesan dev.
 * - Di prod tanpa site key: render pesan error bahasa Indonesia; tidak ada token
 *   yang diproduksi → form tetap disabled (fail-closed).
 * - Token di-reset (expire callback) saat terjadi error agar form membutuhkan
 *   re-solve sebelum bisa submit kembali.
 */
export function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps): JSX.Element {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const isDev = import.meta.env.DEV as boolean;
  const widgetIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dev tanpa key → pakai test key. Prod tanpa key → null (fail-closed).
  const effectiveSiteKey: string | null = resolveEffectiveSiteKey(siteKey, isDev);

  useEffect(() => {
    // Fail-closed: jika tidak ada site key yang valid di prod, jangan render widget.
    if (!effectiveSiteKey) return;

    // Pastikan hanya berjalan di browser (tidak di Node/SSG)
    if (typeof window === "undefined") return;

    /** Inisialisasi widget setelah script dimuat. */
    function initWidget() {
      if (!window.turnstile || !containerRef.current || !effectiveSiteKey) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: effectiveSiteKey,
        callback: onVerify,
        "expired-callback": onExpire,
        "error-callback": onExpire,
      });
    }

    // Jika turnstile sudah dimuat, langsung init
    if (window.turnstile) {
      initWidget();
      return;
    }

    // Cegah duplikasi script
    if (document.getElementById(WIDGET_CONTAINER_ID + "-script")) {
      window.addEventListener("turnstile-ready", initWidget, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = WIDGET_CONTAINER_ID + "-script";
    script.src = `${TURNSTILE_SCRIPT_URL}?onload=onTurnstileReady&render=explicit`;
    script.async = true;
    script.defer = true;

    (window as unknown as Record<string, unknown>)["onTurnstileReady"] = () => {
      initWidget();
    };

    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [effectiveSiteKey, onVerify, onExpire]);

  // Prod tanpa site key: tampilkan error state — tidak ada widget, tidak ada token.
  if (!effectiveSiteKey) {
    return (
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm font-medium text-red-700">
          Verifikasi keamanan tidak tersedia. Coba lagi nanti.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} />
      {!siteKey && isDev && (
        <p className="mt-1 text-xs text-ink-soft/70">
          Turnstile belum dikonfigurasi (mode dev — kunci test digunakan)
        </p>
      )}
    </div>
  );
}
