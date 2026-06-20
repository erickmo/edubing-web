/**
 * PaymentStatus — menampilkan status alur checkout berdasarkan fase funnel.
 *
 * Merender spinner, panel sukses, atau panel gagal sesuai phase.
 * Semua teks dalam Bahasa Indonesia.
 */
import { Link } from "react-router-dom";
import type { FunnelState } from "../../lib/api/registration";
import { Button } from "../ui/Button";

/** Props untuk PaymentStatus. */
export interface PaymentStatusProps {
  state: FunnelState;
  /** Dipanggil ketika pengguna mengklik "Coba lagi". */
  onReset: () => void;
}

/** Spinner sederhana menggunakan Tailwind animate-spin. */
function Spinner(): JSX.Element {
  return (
    <div
      className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"
      role="status"
      aria-label="Memuat..."
    />
  );
}

/**
 * Komponen yang merender UI sesuai fase funnel checkout.
 * Fase idle tidak merender apa pun (null).
 */
export function PaymentStatus({
  state,
  onReset,
}: PaymentStatusProps): JSX.Element | null {
  switch (state.phase) {
    case "idle":
      return null;

    case "registering":
      return (
        <div className="flex flex-col items-center gap-4 py-8">
          <Spinner />
          <p className="text-sm text-ink-soft">Mendaftarkan kamu…</p>
        </div>
      );

    case "paying":
      return (
        <div className="flex flex-col items-center gap-4 py-8">
          <Spinner />
          <p className="text-sm text-ink-soft">
            Membuka halaman pembayaran…
          </p>
          <p className="text-xs text-ink-soft/70">
            Selesaikan pembayaran di popup Midtrans.
          </p>
        </div>
      );

    case "polling":
      return (
        <div className="flex flex-col items-center gap-4 py-8">
          <Spinner />
          <p className="text-sm text-ink-soft">
            Menunggu konfirmasi pembayaran…
          </p>
          <p className="text-xs text-ink-soft/70">
            Ini mungkin memerlukan beberapa detik.
          </p>
        </div>
      );

    case "success":
      return (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className="h-7 w-7 text-brand-600"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-ink">
              Kamu berhasil terdaftar!
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Cek detail pendaftaranmu di halaman Akun.
            </p>
          </div>
          <Button asChild variant="secondary" size="md">
            <Link to="/akun">Lihat Pendaftaran</Link>
          </Button>
        </div>
      );

    case "failed":
      return (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className="h-7 w-7 text-red-500"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-ink">
              Pendaftaran gagal
            </p>
            <p className="mt-1 text-sm text-red-600">{state.message}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="md" onClick={onReset}>
              Coba lagi
            </Button>
            <Button asChild variant="secondary" size="md">
              <Link to="/akun">Ke Akun</Link>
            </Button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
