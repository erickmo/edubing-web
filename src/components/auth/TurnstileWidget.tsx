/**
 * TurnstileWidget — widget CAPTCHA Cloudflare Turnstile.
 *
 * Memuat script Turnstile secara client-only via useEffect agar tidak
 * crash saat SSG prerender (script injection TIDAK dijalankan di server).
 *
 * Dev note: Jika VITE_TURNSTILE_SITE_KEY tidak dikonfigurasi, gunakan
 * kunci test Cloudflare "1x00000000000000000000AA" (always-pass) untuk
 * pengujian lokal. Backend harus dikonfigurasi dengan secret test yang
 * sesuai (0x0000000000000000000000000000000AA) agar verifikasi end-to-end
 * berfungsi.
 */

import { useEffect, useRef } from "react";

/** URL script Cloudflare Turnstile. */
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js";

/** ID elemen DOM untuk container widget. */
const WIDGET_CONTAINER_ID = "cf-turnstile-widget";

/** Kunci test always-pass Cloudflare (hanya untuk dev). */
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
 * Render widget Cloudflare Turnstile.
 *
 * - Script dimuat client-only (useEffect) — aman untuk SSG.
 * - Jika site key tidak dikonfigurasi, tampilkan pesan dev dan tidak render widget.
 * - Token di-reset (expire callback) saat terjadi error agar form membutuhkan
 *   re-solve sebelum bisa submit kembali.
 */
export function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps): JSX.Element {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const widgetIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveSiteKey = siteKey ?? DEV_TEST_KEY;

  useEffect(() => {
    // Pastikan hanya berjalan di browser (tidak di Node/SSG)
    if (typeof window === "undefined") return;

    /** Inisialisasi widget setelah script dimuat. */
    function initWidget() {
      if (!window.turnstile || !containerRef.current) return;

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

  return (
    <div>
      <div ref={containerRef} />
      {!siteKey && (
        <p className="mt-1 text-xs text-ink-soft/70">
          Turnstile belum dikonfigurasi (mode dev — kunci test digunakan)
        </p>
      )}
    </div>
  );
}
