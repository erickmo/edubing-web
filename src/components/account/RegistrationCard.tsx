/**
 * RegistrationCard — satu baris registrasi event di halaman Akun.
 *
 * Menampilkan judul event, tanggal, badge status registrasi,
 * status pembayaran, tombol Batalkan, dan link Lanjutkan pembayaran.
 */
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { formatEventDate } from "../home/eventFormat";
import type { RegistrationRow } from "../../lib/api/account";

// ─── Pemetaan badge status registrasi ────────────────────────────────────────

/** Label Bahasa Indonesia per status registrasi. */
const STATUS_LABEL: Record<RegistrationRow["status"], string> = {
  Registered: "Terdaftar",
  Pending: "Menunggu pembayaran",
  Attended: "Hadir",
  Cancelled: "Dibatalkan",
};

/** Kelas warna Tailwind per status registrasi. */
const STATUS_CLASS: Record<RegistrationRow["status"], string> = {
  Registered: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Attended: "bg-blue-100 text-blue-700",
  Cancelled: "bg-gray-100 text-gray-500",
};

// ─── Pemetaan label status order pembayaran ───────────────────────────────────

/** Label Bahasa Indonesia per status pembayaran. */
const ORDER_STATUS_LABEL: Record<string, string> = {
  Paid: "Lunas",
  Pending: "Menunggu pembayaran",
  Failed: "Gagal",
  Expired: "Kedaluwarsa",
};

// ─── Konstanta status yang dapat dibatalkan ───────────────────────────────────

/** Status registrasi yang boleh menampilkan tombol Batalkan. */
const CANCELLABLE_STATUSES: Array<RegistrationRow["status"]> = [
  "Registered",
  "Pending",
];

/** Props untuk RegistrationCard. */
export interface RegistrationCardProps {
  /** Satu baris data registrasi dari API. */
  row: RegistrationRow;
  /** Callback saat pengguna mengkonfirmasi pembatalan. */
  onCancel: (registration: string) => void;
  /** True saat mutasi cancel sedang berjalan. */
  isCancelling: boolean;
}

/**
 * Kartu satu registrasi: judul, tanggal, badge status,
 * status pembayaran, tombol batalkan, dan link lanjutkan.
 */
export function RegistrationCard({
  row,
  onCancel,
  isCancelling,
}: RegistrationCardProps): JSX.Element {
  const canCancel = CANCELLABLE_STATUSES.includes(row.status);
  const showContinue =
    row.status === "Pending" &&
    row.order_status === "Pending" &&
    Boolean(row.event_route);

  function handleCancel() {
    const ok = window.confirm(
      `Batalkan registrasi untuk "${row.event_title}"?`,
    );
    if (ok) {
      onCancel(row.registration);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Judul + tanggal */}
          <div className="min-w-0 flex-1">
            {row.event_route ? (
              <Link
                to={`/events/${row.event_route}`}
                className="font-display font-bold text-ink hover:text-brand-600 hover:underline"
              >
                {row.event_title}
              </Link>
            ) : (
              <span className="font-display font-bold text-ink">
                {row.event_title}
              </span>
            )}
            <p className="mt-1 text-sm text-ink-soft">
              {formatEventDate(row.start_date)}
            </p>
          </div>

          {/* Badge status registrasi */}
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_CLASS[row.status]}`}
          >
            {STATUS_LABEL[row.status]}
          </span>
        </div>

        {/* Status pembayaran */}
        {row.order_status && (
          <p className="mt-2 text-sm text-ink-soft">
            Pembayaran:{" "}
            <span className="font-semibold">
              {ORDER_STATUS_LABEL[row.order_status] ?? row.order_status}
            </span>
          </p>
        )}

        {/* Tombol aksi */}
        {(canCancel || showContinue) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {showContinue && (
              <Button asChild variant="soft" size="sm">
                <Link to={`/checkout/${row.event_route}`}>
                  Lanjutkan pembayaran
                </Link>
              </Button>
            )}
            {canCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling}
                className="text-red-600 hover:bg-red-50"
              >
                Batalkan
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
