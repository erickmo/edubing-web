/**
 * RegistrationList — daftar semua registrasi pengguna di halaman Akun.
 *
 * Menangani status: loading (skeleton), error, empty state, dan daftar penuh.
 * Setiap baris dirender oleh RegistrationCard.
 */
import { Link } from "react-router-dom";
import { RegistrationCard } from "./RegistrationCard";
import type { RegistrationRow } from "../../lib/api/account";
import { useCancelRegistration } from "../../lib/api/account";
import type { FrappeError } from "../../lib/frappe/client";

/** Props untuk RegistrationList. */
export interface RegistrationListProps {
  /** Data registrasi dari useMyRegistrations(). */
  data: RegistrationRow[] | undefined;
  /** True saat query sedang memuat. */
  isLoading: boolean;
  /** True jika query gagal. */
  isError: boolean;
}

/**
 * Daftar registrasi dengan loading skeleton, empty state, dan error state.
 * Mutasi cancel dikelola di sini agar invalidasi query terjadi di level yang sama.
 */
export function RegistrationList({
  data,
  isLoading,
  isError,
}: RegistrationListProps): JSX.Element {
  const { mutate: cancelMutate, isPending, error } = useCancelRegistration();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-3xl bg-ink/5"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
        Gagal memuat registrasi. Coba muat ulang halaman.
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-ink/15 px-6 py-12 text-center">
        <p className="font-display text-lg font-bold text-ink">
          Belum ada registrasi. Yuk ikut event!
        </p>
        <Link
          to="/events"
          className="mt-3 inline-block text-sm text-brand-600 underline hover:text-brand-700"
        >
          Yuk ikut event sekarang
        </Link>
      </div>
    );
  }

  const cancelError = error as FrappeError | null;

  return (
    <div className="flex flex-col gap-4">
      {cancelError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {cancelError.message ?? "Tidak diizinkan"}
        </p>
      )}
      {data.map((row) => (
        <RegistrationCard
          key={row.registration}
          row={row}
          onCancel={(id) => cancelMutate(id)}
          isCancelling={isPending}
        />
      ))}
    </div>
  );
}
