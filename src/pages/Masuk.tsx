/**
 * Masuk — halaman login Edubing (/masuk).
 *
 * Jika pengguna sudah autentikasi, langsung redirect ke target yang aman.
 * Menggunakan AuthLayout (Navbar + Card terpusat + Footer) + LoginForm.
 */

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { LoginForm } from "../components/auth/LoginForm";
import { useSession } from "../store/session";
import { safe_redirect } from "../lib/auth/redirect";

/**
 * Halaman Masuk.
 * Redirect otomatis ke safe_redirect jika sudah autentikasi.
 */
export default function Masuk(): JSX.Element {
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
      title="Masuk — Edubing"
      description="Masuk ke akun Edubing kamu untuk mengakses event dan kursus."
    >
      <LoginForm />
    </AuthLayout>
  );
}
