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

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

/** Judul event dengan link jika route tersedia, atau teks biasa. */
function CardTitle({ row }: { row: RegistrationRow }): JSX.Element {
  return (
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
  );
}

/** Badge status registrasi berwarna sesuai status. */
function StatusBadge({
  status,
}: {
  status: RegistrationRow["status"];
}): JSX.Element {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Baris status pembayaran, hanya tampil jika order_status ada. */
function PaymentStatus({
  orderStatus,
}: {
  orderStatus: string | null | undefined;
}): JSX.Element | null {
  if (!orderStatus) return null;
  return (
    <p className="mt-2 text-sm text-ink-soft">
      Pembayaran:{" "}
      <span className="font-semibold">
        {ORDER_STATUS_LABEL[orderStatus] ?? orderStatus}
      </span>
    </p>
  );
}

/** Tombol aksi: Lanjutkan pembayaran + Batalkan. */
function ActionButtons({
  row,
  canCancel,
  showContinue,
  isCancelling,
  onCancel,
}: {
  row: RegistrationRow;
  canCancel: boolean;
  showContinue: boolean;
  isCancelling: boolean;
  onCancel: () => void;
}): JSX.Element | null {
  if (!canCancel && !showContinue) return null;
  return (
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
          onClick={onCancel}
          disabled={isCancelling}
          className="text-red-600 hover:bg-red-50"
        >
          Batalkan
        </Button>
      )}
    </div>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

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
          <CardTitle row={row} />
          <StatusBadge status={row.status} />
        </div>
        <PaymentStatus orderStatus={row.order_status} />
        <ActionButtons
          row={row}
          canCancel={canCancel}
          showContinue={showContinue}
          isCancelling={isCancelling}
          onCancel={handleCancel}
        />
      </CardContent>
    </Card>
  );
}
