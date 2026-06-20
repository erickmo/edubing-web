/**
 * Daftar — halaman registrasi akun baru Edubing (/daftar).
 *
 * Jika pengguna sudah autentikasi, langsung redirect ke target yang aman.
 * Menggunakan AuthLayout (Navbar + Card terpusat + Footer) + RegisterForm.
 */

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { RegisterForm } from "../components/auth/RegisterForm";
import { useSession } from "../store/session";
import { safe_redirect } from "../lib/auth/redirect";

/**
 * Halaman Daftar.
 * Redirect otomatis ke safe_redirect jika sudah autentikasi.
 */
export default function Daftar(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = useSession((s) => s.status);

  useEffect(() => {
    if (status === "authed") {
      navigate(safe_redirect(searchParams.get("redirect")), { replace: true });
    }
  }, [status, navigate, searchParams]);

  // Jangan tampilkan form saat loading atau sudah authed
  if (status === "loading" || status === "authed") {
    return <div />;
  }

  return (
    <AuthLayout
      title="Daftar — Edubing"
      description="Buat akun Edubing gratis dan mulai eksplorasi event serta kursus terbaik."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
