/**
 * LoginForm — formulir masuk dengan validasi client-side dan error handling.
 *
 * Alur:
 * 1. Validasi email dan password (required, format email).
 * 2. Panggil login(email, password).
 * 3. Ambil user yang sedang login via getLoggedUser().
 * 4. Simpan sesi via set_session().
 * 5. Navigasi ke safe_redirect(redirect query param).
 *
 * Error dari server (FrappeError) ditampilkan inline dalam bahasa Indonesia.
 */

import { useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { login, getLoggedUser } from "../../lib/frappe/auth";
import { getCsrfToken, FrappeError } from "../../lib/frappe/client";
import { useSession } from "../../store/session";
import { safe_redirect } from "../../lib/auth/redirect";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";

/** Pesan validasi client-side (Bahasa Indonesia). */
const ERR_EMAIL_REQUIRED = "Email wajib diisi.";
const ERR_EMAIL_FORMAT = "Format email tidak valid.";
const ERR_PASSWORD_REQUIRED = "Kata sandi wajib diisi.";

/** Regex format email sederhana. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validasi form login, kembalikan object errors (kosong = valid). */
function validateLogin(email: string, password: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!email.trim()) {
    errors.email = ERR_EMAIL_REQUIRED;
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = ERR_EMAIL_FORMAT;
  }
  if (!password) errors.password = ERR_PASSWORD_REQUIRED;
  return errors;
}

/**
 * Komponen formulir masuk.
 * Render mandiri — tidak membutuhkan AuthLayout (dikomposes di Masuk.tsx).
 */
export function LoginForm(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const set_session = useSession((s) => s.set_session);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setServerError(null);

      const validation = validateLogin(email, password);
      if (Object.keys(validation).length > 0) {
        setErrors(validation);
        return;
      }
      setErrors({});
      setSubmitting(true);

      try {
        await login(email, password);
        const user = await getLoggedUser();
        set_session(user, null, getCsrfToken());
        navigate(safe_redirect(searchParams.get("redirect")));
      } catch (err) {
        if (err instanceof FrappeError) {
          setServerError(err.message);
        } else {
          setServerError("Terjadi kesalahan. Coba lagi.");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [email, password, navigate, searchParams, set_session],
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="font-display text-2xl font-black text-ink">Masuk</h1>
      <p className="mt-1 text-sm text-ink-soft/70">
        Selamat datang kembali di Edubing.
      </p>

      {serverError && (
        <div
          role="alert"
          className="mt-4 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {serverError}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="kamu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <Field
          label="Kata Sandi"
          type="password"
          autoComplete="current-password"
          placeholder="Kata sandi kamu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
      </div>

      <Button
        type="submit"
        className="mt-6 w-full"
        disabled={submitting}
      >
        {submitting ? "Memproses…" : "Masuk"}
      </Button>

      <p className="mt-4 text-center text-sm text-ink-soft/70">
        Belum punya akun?{" "}
        <Link to="/daftar" className="font-semibold text-brand-600 hover:underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}
