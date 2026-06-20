/**
 * ProfileCard — ringkasan profil siswa di halaman Akun.
 *
 * Menampilkan nama, jumlah event, jumlah konten, dan status langganan.
 * Fallback ke email sesi jika profil belum lengkap.
 */
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge"; // eslint-disable-line
import type { DashboardData } from "../../lib/api/account";

/** URL portal siswa lengkap (manajemen konten & langganan). */
export const PORTAL_URL =
  "https://edubing.localhost/student"; // TODO: ganti ke URL prod

/** Props untuk ProfileCard. */
export interface ProfileCardProps {
  /** Data dashboard dari useDashboard(). */
  data: DashboardData | undefined;
  /** Status loading query. */
  isLoading: boolean;
  /** Nama pengguna dari sesi (fallback ke email). */
  sessionUser: string | null;
}

/**
 * Kartu profil ringkas: nama, statistik, status langganan.
 * Loading skeleton ditampilkan saat isLoading true.
 * Pesan "Lengkapi profil" muncul jika data.student kosong.
 */
export function ProfileCard({
  data,
  isLoading,
  sessionUser,
}: ProfileCardProps): JSX.Element {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-40 animate-pulse rounded-full bg-ink/10" />
        </CardHeader>
        <CardContent>
          <div className="h-4 w-24 animate-pulse rounded-full bg-ink/10" />
        </CardContent>
      </Card>
    );
  }

  const student = data?.student as
    | { name?: string; full_name?: string; phone?: string; school?: string; grade?: string }
    | undefined;

  const hasProfile =
    student !== undefined &&
    Object.keys(student).length > 0 &&
    Boolean(student.full_name);

  const displayName = hasProfile
    ? student?.full_name
    : (sessionUser ?? "Pengguna");

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-xl font-bold text-ink">{displayName}</h2>
        {!hasProfile && (
          <p className="mt-1 text-sm text-ink-soft">
            Lengkapi profil di aplikasi
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Stat label="Event diikuti" value={data?.event_count ?? 0} />
          <Stat label="Konten diakses" value={data?.content_count ?? 0} />
          {Boolean(data?.subscription) && (
            <Badge variant="brand">Langganan Aktif</Badge>
          )}
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          Kelola konten & langganan di{" "}
          <a
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 underline hover:text-brand-700"
          >
            portal siswa
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}

/** Statistik kecil dengan angka dan label. */
function Stat({ label, value }: { label: string; value: number }): JSX.Element {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-ink/10 px-4 py-2">
      <span className="font-display text-2xl font-black text-brand-600">
        {value}
      </span>
      <span className="text-xs text-ink-soft">{label}</span>
    </div>
  );
}
