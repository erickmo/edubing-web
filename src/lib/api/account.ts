/**
 * Tipe data, fungsi API, dan React Query hooks untuk halaman Akun.
 *
 * Endpoint yang digunakan (terautentikasi via frappeCall):
 *  - my_registrations → daftar registrasi milik pengguna
 *  - cancel           → batalkan registrasi
 *  - get_dashboard    → ringkasan profil + statistik
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { frappeCall } from "../frappe/client";

// ─── Tipe API ─────────────────────────────────────────────────────────────────

/** Satu baris registrasi dari endpoint my_registrations. */
export interface RegistrationRow {
  /** Primary key dokumen Registration di Frappe. */
  registration: string;
  /** Primary key dokumen Event di Frappe. */
  event: string;
  /** Judul event yang ditampilkan ke pengguna. */
  event_title: string;
  /** Slug URL event, digunakan untuk /events/:route dan /checkout/:route. */
  event_route: string;
  /** ISO date-time tanggal mulai event. */
  start_date: string;
  /** Jenis event (online/offline/workshop/kompetisi). */
  event_type: string;
  /** Harga event dalam IDR; 0 berarti gratis. */
  price: number;
  /** Status registrasi: Pending | Registered | Attended | Cancelled. */
  status: "Pending" | "Registered" | "Attended" | "Cancelled";
  /** Status order pembayaran: Pending | Paid | Failed | Expired | null. */
  order_status: "Pending" | "Paid" | "Failed" | "Expired" | null;
  /** ISO date-time tanggal registrasi. */
  registration_date: string;
}

/** Data profil singkat dari endpoint get_dashboard. */
export interface StudentProfile {
  name: string;
  full_name: string;
  phone: string;
  school: string;
  grade: string;
}

/** Respons lengkap dari endpoint get_dashboard. */
export interface DashboardData {
  /** Profil siswa; object kosong `{}` jika belum ada profil. */
  student: StudentProfile | Record<string, never>;
  /** Info langganan aktif; null jika tidak ada. */
  subscription: unknown;
  /** Jumlah konten yang sudah diakses. */
  content_count: number;
  /** Jumlah event yang sudah diikuti. */
  event_count: number;
}

// ─── Konstanta endpoint ───────────────────────────────────────────────────────

const METHOD_MY_REGISTRATIONS =
  "vernon_edubing.eb_event.api.checkout.my_registrations";
const METHOD_CANCEL = "vernon_edubing.eb_event.api.event.cancel";
const METHOD_DASHBOARD = "vernon_edubing.eb_student.api.student.get_dashboard";

// ─── React Query cache keys ───────────────────────────────────────────────────

/** Kunci cache untuk data akun pengguna. */
export const accountKeys = {
  registrations: ["account", "registrations"] as const,
  dashboard: ["account", "dashboard"] as const,
} as const;

// ─── Fungsi API ───────────────────────────────────────────────────────────────

/**
 * Ambil semua registrasi milik pengguna yang sedang login.
 * Memerlukan sesi terautentikasi.
 */
export function myRegistrations(): Promise<RegistrationRow[]> {
  return frappeCall<RegistrationRow[]>(METHOD_MY_REGISTRATIONS);
}

/**
 * Batalkan satu registrasi berdasarkan primary key.
 * Server memvalidasi kepemilikan (403 jika bukan pemilik).
 *
 * @param registration - Primary key dokumen Registration di Frappe.
 */
export function cancelRegistration(registration: string): Promise<true> {
  return frappeCall<true>(METHOD_CANCEL, { registration });
}

/**
 * Ambil ringkasan profil + statistik pengguna yang sedang login.
 */
export function getDashboard(): Promise<DashboardData> {
  return frappeCall<DashboardData>(METHOD_DASHBOARD);
}

// ─── React Query hooks ────────────────────────────────────────────────────────

/**
 * Hook untuk daftar registrasi pengguna.
 * Data di-cache dengan key accountKeys.registrations.
 */
export function useMyRegistrations(): UseQueryResult<RegistrationRow[], Error> {
  return useQuery({
    queryKey: accountKeys.registrations,
    queryFn: myRegistrations,
  });
}

/**
 * Hook untuk data dashboard pengguna (profil + statistik).
 */
export function useDashboard(): UseQueryResult<DashboardData, Error> {
  return useQuery({
    queryKey: accountKeys.dashboard,
    queryFn: getDashboard,
  });
}

/**
 * Mutation hook untuk membatalkan registrasi.
 * Pada sukses, query registrations diinvalidasi sehingga daftar di-refresh.
 */
export function useCancelRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registration: string) => cancelRegistration(registration),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.registrations });
    },
  });
}
