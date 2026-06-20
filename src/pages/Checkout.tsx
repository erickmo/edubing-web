/**
 * Halaman checkout (/checkout/:slug) — alur daftar + bayar event.
 *
 * Alur:
 *  1. Muat data event via useEvent(slug).
 *  2. Pengguna klik "Konfirmasi & Daftar" / "Bayar & Daftar".
 *  3. Dispatch REGISTER_START → panggil registerForEvent().
 *     - paid === false  → REGISTERED_FREE → success.
 *     - paid + snap_token → PAY_START → loadSnap() + openSnap() → polling.
 *     - paid + redirect_url → PAY_START → window.location.assign (Xendit).
 *  4. Polling checkoutStatus setiap 3 detik (maks 40 kali / 2 menit).
 *
 * Route dilindungi RequireAuth — pengguna sudah autentikasi saat halaman ini dimuat.
 * Catatan Xendit: setelah redirect, pengguna kembali ke /akun (return URL dikonfigurasi
 *   di backend). Alur return tidak ditangani di halaman ini (v1).
 */
import { useReducer, useEffect, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Seo } from "../components/Seo";
import { Button } from "../components/ui/Button";
import { CheckoutSummary } from "../components/checkout/CheckoutSummary";
import { PaymentStatus } from "../components/checkout/PaymentStatus";
import { useEvent } from "../lib/api/events";
import {
  funnelReducer,
  registerForEvent,
  checkoutStatus,
} from "../lib/api/registration";
import type { FunnelState } from "../lib/api/registration";
import { loadSnap, openSnap } from "../lib/payment/snap";
import { is_sold_out, formatPrice } from "../components/home/eventFormat";
import { FrappeError } from "../lib/frappe/client";

/** State awal funnel. */
const INITIAL_STATE: FunnelState = { phase: "idle" };

/** Interval polling (ms). */
const POLL_INTERVAL_MS = 3_000;

/** Maksimal percobaan polling sebelum timeout (~2 menit). */
const POLL_MAX_TRIES = 40;

/** Pesan error Bahasa Indonesia dari server yang menandakan sudah terdaftar. */
const MSG_ALREADY_REGISTERED = "sudah terdaftar";

/** Pesan fallback error generik Bahasa Indonesia. */
const MSG_PAYMENT_FAILED = "Pembayaran gagal. Coba lagi.";

/** Pesan saat polling timeout. */
const MSG_POLL_TIMEOUT =
  "Pembayaran sedang diproses. Cek halaman Akun nanti.";

/**
 * Halaman checkout — daftar dan bayar event.
 */
export default function Checkout(): JSX.Element {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: event, isLoading, isError } = useEvent(slug);

  const [state, dispatch] = useReducer(funnelReducer, INITIAL_STATE);

  // Ref untuk timer polling agar dapat dibatalkan saat unmount / terminal state.
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  // Ref untuk melacak apakah komponen masih terpasang — mencegah dispatch setelah unmount.
  const mountedRef = useRef(true);

  /** Hentikan polling yang sedang berjalan. */
  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  /** Mulai polling checkoutStatus sampai Registered/Paid atau timeout. */
  const startPolling = useCallback(
    (registration: string) => {
      stopPolling();
      dispatch({ type: "POLL_START", registration });

      pollTimerRef.current = setInterval(async () => {
        pollCountRef.current += 1;

        if (pollCountRef.current > POLL_MAX_TRIES) {
          stopPolling();
          if (!mountedRef.current) return;
          dispatch({ type: "FAIL", message: MSG_POLL_TIMEOUT });
          return;
        }

        try {
          const status = await checkoutStatus(registration);
          if (!mountedRef.current) return;

          const isRegistered = status.registration_status === "Registered";
          const isPaid = status.order_status === "Paid";

          if (isRegistered || isPaid) {
            stopPolling();
            dispatch({ type: "SETTLED" });
          }
        } catch {
          // Lanjutkan polling — kesalahan jaringan sementara tidak harus fatal.
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling],
  );

  // Bersihkan timer dan tandai unmount untuk mencegah dispatch setelah unmount.
  useEffect(
    () => () => {
      mountedRef.current = false;
      stopPolling();
    },
    [stopPolling],
  );

  /** Handler CTA utama — daftar dan/atau bayar. */
  const handleRegister = useCallback(async () => {
    if (!event) return;

    dispatch({ type: "REGISTER_START" });

    try {
      const result = await registerForEvent(event.name, "midtrans");

      if (!result.paid) {
        dispatch({ type: "REGISTERED_FREE" });
        return;
      }

      // Event berbayar — mulai alur pembayaran.
      dispatch({ type: "PAY_START", registration: result.registration });

      if (result.snap_token) {
        // Midtrans Snap: muat skrip (idempoten) lalu buka popup.
        await loadSnap();
        openSnap(result.snap_token, {
          onSuccess: () => startPolling(result.registration),
          onPending: () => startPolling(result.registration),
          onError: () =>
            dispatch({ type: "FAIL", message: MSG_PAYMENT_FAILED }),
          onClose: () => {
            // Pengguna menutup popup — kembalikan ke idle agar bisa coba lagi.
            dispatch({ type: "RESET" });
          },
        });
        return;
      }

      if (result.redirect_url) {
        // Xendit: redirect penuh ke halaman pembayaran.
        // Setelah selesai, pengguna diarahkan ke /akun oleh return URL backend.
        window.location.assign(result.redirect_url);
        return;
      }

      // Tidak ada snap_token maupun redirect_url — kondisi tidak terduga.
      dispatch({
        type: "FAIL",
        message: "Konfigurasi pembayaran tidak lengkap. Hubungi admin.",
      });
    } catch (err) {
      const msg =
        err instanceof FrappeError ? err.message : MSG_PAYMENT_FAILED;
      dispatch({ type: "FAIL", message: msg });
    }
  }, [event, startPolling]);

  const handleReset = useCallback(() => {
    stopPolling();
    dispatch({ type: "RESET" });
  }, [stopPolling]);

  // Tentukan apakah CTA harus dinonaktifkan.
  const isBusy = state.phase !== "idle" && state.phase !== "failed";
  const isSoldOut = event ? is_sold_out(event.remaining_seats) : false;
  const ctaDisabled = isBusy || isSoldOut;
  const isPaid = event ? event.price > 0 : false;
  const ctaLabel = isSoldOut
    ? "Kursi penuh"
    : isPaid
      ? "Bayar & Daftar"
      : "Konfirmasi & Daftar";

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <Seo
        title="Checkout — Edubing"
        description="Konfirmasi pendaftaran event kamu di Edubing."
        noindex
      />
      <Navbar />

      <main className="mx-auto min-h-screen max-w-lg px-4 py-12 sm:px-6">
        <h1 className="mb-6 font-display text-2xl font-bold text-ink">
          Konfirmasi Pendaftaran
        </h1>

        {isLoading && (
          <p className="text-sm text-ink-soft">Memuat data event…</p>
        )}

        {isError && !event && (
          <div className="space-y-3 text-center">
            <p className="text-ink">Event tidak ditemukan.</p>
            <Button asChild variant="secondary" size="md">
              <Link to="/events">Kembali ke Daftar Event</Link>
            </Button>
          </div>
        )}

        {event && (
          <div className="space-y-6">
            <CheckoutSummary event={event} />

            {/* CTA — sembunyikan saat sukses agar tidak membingungkan */}
            {state.phase !== "success" && (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={ctaDisabled}
                onClick={handleRegister}
              >
                {ctaLabel}
              </Button>
            )}

            {/* Catatan harga */}
            {event.price > 0 && state.phase === "idle" && (
              <p className="text-center text-sm text-ink-soft">
                Harga:{" "}
                <span className="font-bold text-ink">
                  {formatPrice(event.price)}
                </span>{" "}
                — bayar via Midtrans Snap
              </p>
            )}

            {/* Panel status alur */}
            <PaymentStatus state={state} onReset={handleReset} />

            {/* Catatan jika pengguna menutup popup Snap */}
            {state.phase === "idle" && (
              <p className="text-center text-xs text-ink-soft/70">
                Jika popup pembayaran tertutup, klik tombol di atas untuk
                mencoba kembali.
              </p>
            )}

            {/* Pesan sudah terdaftar — link ke /akun */}
            {state.phase === "failed" &&
              state.message
                .toLowerCase()
                .includes(MSG_ALREADY_REGISTERED) && (
                <p className="text-center text-sm text-ink-soft">
                  <Link to="/akun" className="underline hover:text-brand-600">
                    Lihat pendaftaranmu di halaman Akun
                  </Link>
                </p>
              )}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
