/**
 * RegisterForm — formulir daftar akun baru dengan Turnstile CAPTCHA.
 *
 * Gate utama: tombol submit DISABLED hingga Turnstile mengembalikan token.
 * Jika register gagal (FrappeError), token di-reset dan form membutuhkan
 * re-solve CAPTCHA sebelum bisa submit kembali.
 *
 * Alur:
 * 1. Pengguna mengisi semua field + menyelesaikan Turnstile.
 * 2. Validasi client-side (required, email, password length/match, phone).
 * 3. Panggil register({ email, password, full_name, phone, captcha_token }).
 * 4. Simpan sesi via set_session().
 * 5. Navigasi ke safe_redirect(redirect query param).
 */

import { useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { register } from "../../lib/frappe/auth";
import { FrappeError } from "../../lib/frappe/client";
import { useSession } from "../../store/session";
import { safe_redirect } from "../../lib/auth/redirect";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { TurnstileWidget } from "./TurnstileWidget";

/** Panjang minimum kata sandi. */
const MIN_PASSWORD_LENGTH = 8;

/** Pesan validasi (Bahasa Indonesia). */
const VALIDATION = {
  FULL_NAME_REQUIRED: "Nama lengkap wajib diisi.",
  EMAIL_REQUIRED: "Email wajib diisi.",
  EMAIL_FORMAT: "Format email tidak valid.",
  PHONE_REQUIRED: "Nomor HP wajib diisi.",
  PHONE_FORMAT: "Format nomor HP tidak valid (contoh: 08123456789).",
  PASSWORD_REQUIRED: "Kata sandi wajib diisi.",
  PASSWORD_MIN: `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`,
  CONFIRM_REQUIRED: "Konfirmasi kata sandi wajib diisi.",
  CONFIRM_MATCH: "Kata sandi tidak sama.",
} as const;

/** Regex validasi email. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Regex validasi nomor HP Indonesia (dimulai 08, min 10 digit). */
const PHONE_REGEX = /^0[0-9]{8,13}$/;

/** Validasi semua field RegisterForm, kembalikan object errors. */
function validateRegister(
  full_name: string,
  email: string,
  phone: string,
  password: string,
  confirm_password: string,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!full_name.trim()) errors.full_name = VALIDATION.FULL_NAME_REQUIRED;

  if (!email.trim()) {
    errors.email = VALIDATION.EMAIL_REQUIRED;
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = VALIDATION.EMAIL_FORMAT;
  }

  if (!phone.trim()) {
    errors.phone = VALIDATION.PHONE_REQUIRED;
  } else if (!PHONE_REGEX.test(phone.replace(/\s/g, ""))) {
    errors.phone = VALIDATION.PHONE_FORMAT;
  }

  if (!password) {
    errors.password = VALIDATION.PASSWORD_REQUIRED;
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = VALIDATION.PASSWORD_MIN;
  }

  if (!confirm_password) {
    errors.confirm_password = VALIDATION.CONFIRM_REQUIRED;
  } else if (password !== confirm_password) {
    errors.confirm_password = VALIDATION.CONFIRM_MATCH;
  }

  return errors;
}

/**
 * Komponen formulir daftar akun baru.
 * Submit gate: captcha_token harus ada (dari Turnstile onVerify).
 */
export function RegisterForm(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const set_session = useSession((s) => s.set_session);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /** Dipanggil saat Turnstile berhasil diverifikasi. */
  const handleVerify = useCallback((token: string) => {
    setCaptchaToken(token);
  }, []);

  /** Dipanggil saat token Turnstile kedaluwarsa atau terjadi error. */
  const handleExpire = useCallback(() => {
    setCaptchaToken(null);
  }, []);

  /** Submit hanya diizinkan jika ada captcha token. */
  const isSubmitDisabled = !captchaToken || submitting;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!captchaToken) return;
      setServerError(null);

      const validation = validateRegister(
        fullName,
        email,
        phone,
        password,
        confirmPassword,
      );
      if (Object.keys(validation).length > 0) {
        setErrors(validation);
        return;
      }
      setErrors({});
      setSubmitting(true);

      try {
        const result = await register({
          email,
          password,
          full_name: fullName,
          phone,
          captcha_token: captchaToken,
        });
        set_session(email, result.student, result.csrf_token);
        navigate(safe_redirect(searchParams.get("redirect")));
      } catch (err) {
        if (err instanceof FrappeError) {
          setServerError(err.message);
        } else {
          setServerError("Terjadi kesalahan. Coba lagi.");
        }
        // Reset token Turnstile — pengguna harus solve ulang
        setCaptchaToken(null);
      } finally {
        setSubmitting(false);
      }
    },
    [
      captchaToken,
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      navigate,
      searchParams,
      set_session,
    ],
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="font-display text-2xl font-black text-ink">Daftar</h1>
      <p className="mt-1 text-sm text-ink-soft/70">
        Buat akun Edubing gratis sekarang.
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
          label="Nama Lengkap"
          type="text"
          autoComplete="name"
          placeholder="Nama lengkap kamu"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.full_name}
        />

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
          label="Nomor HP"
          type="tel"
          autoComplete="tel"
          placeholder="08123456789"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
        />

        <Field
          label="Kata Sandi"
          type="password"
          autoComplete="new-password"
          placeholder={`Minimal ${MIN_PASSWORD_LENGTH} karakter`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <Field
          label="Konfirmasi Kata Sandi"
          type="password"
          autoComplete="new-password"
          placeholder="Ulangi kata sandi"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirm_password}
        />

        <div className="mt-1">
          <TurnstileWidget onVerify={handleVerify} onExpire={handleExpire} />
        </div>
      </div>

      <Button
        type="submit"
        className="mt-6 w-full"
        disabled={isSubmitDisabled}
      >
        {submitting ? "Mendaftar…" : "Daftar"}
      </Button>

      <p className="mt-4 text-center text-sm text-ink-soft/70">
        Sudah punya akun?{" "}
        <Link to="/masuk" className="font-semibold text-brand-600 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
