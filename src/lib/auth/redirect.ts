/**
 * Modul pengaman redirect untuk halaman auth.
 *
 * Mencegah open-redirect attack dengan memvalidasi bahwa target redirect
 * hanya mengarah ke path internal aplikasi.
 */

/** Default target jika redirect tidak aman atau tidak ada. */
const DEFAULT_REDIRECT = "/akun";

/**
 * Validasi dan kembalikan target redirect yang aman.
 *
 * Aman: dimulai dengan "/" dan BUKAN "//" (protocol-relative URL)
 * dan BUKAN URL absolut (http:, https:, dsb).
 *
 * @param param - Nilai dari query string ?redirect=
 * @returns Path yang aman, atau DEFAULT_REDIRECT jika tidak aman.
 *
 * @example
 * safe_redirect("/akun")              // "/akun"
 * safe_redirect("/checkout/event-1")  // "/checkout/event-1"
 * safe_redirect("http://evil.com")    // "/akun"
 * safe_redirect("//evil.com")         // "/akun"
 * safe_redirect(null)                 // "/akun"
 */
export function safe_redirect(param: string | null): string {
  if (!param) return DEFAULT_REDIRECT;

  // Harus dimulai dengan "/"
  if (!param.startsWith("/")) return DEFAULT_REDIRECT;

  // Blokir protocol-relative URL (dimulai dengan "//")
  if (param.startsWith("//")) return DEFAULT_REDIRECT;

  return param;
}
