/**
 * Konfigurasi runtime yang bersumber dari variabel lingkungan Vite.
 *
 * Semua nilai yang perlu berbeda antara dev dan prod harus didefinisikan
 * di sini — bukan di-hardcode di komponen.
 *
 * Variabel lingkungan yang tersedia didokumentasikan di `.env.example`.
 */

/**
 * URL origin portal siswa (termasuk path prefix).
 *
 * Set `VITE_PORTAL_URL` di `.env.local` (dev) atau di environment CI/CD (prod)
 * untuk mengarahkan ke deployment yang benar, misal:
 *   https://app.edubing.id/student
 *
 * Fallback ke localhost hanya berlaku saat development lokal.
 */
export const PORTAL_URL: string =
  (import.meta.env.VITE_PORTAL_URL as string | undefined) ??
  "https://edubing.localhost/student";
