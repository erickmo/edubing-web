/**
 * Akun — halaman akun pengguna (registrasi + profil).
 *
 * Dilindungi RequireAuth. Menampilkan:
 *  - ProfileCard: ringkasan profil siswa dari useDashboard()
 *  - RegistrationList: daftar registrasi dari useMyRegistrations()
 *
 * Halaman ini client-only (tidak ada loader SSG) karena data bersifat
 * personal dan tidak dapat di-prerender tanpa sesi.
 */
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Seo } from "../components/Seo";
import { ProfileCard } from "../components/account/ProfileCard";
import { RegistrationList } from "../components/account/RegistrationList";
import { useMyRegistrations, useDashboard } from "../lib/api/account";
import { useSession } from "../store/session";

/** Judul halaman Akun (Bahasa Indonesia). */
const PAGE_TITLE = "Akun Saya — Edubing";

/** Deskripsi meta halaman Akun. */
const PAGE_DESCRIPTION =
  "Lihat dan kelola registrasi event serta profil akun Edubing kamu.";

/**
 * Halaman Akun — profil + registrasi pengguna.
 * noindex karena konten personal tidak perlu diindeks mesin pencari.
 */
export default function Akun(): JSX.Element {
  const { user } = useSession();

  const {
    data: registrations,
    isLoading: regLoading,
    isError: regError,
  } = useMyRegistrations();

  const {
    data: dashboard,
    isLoading: dashLoading,
  } = useDashboard();

  return (
    <>
      <Seo title={PAGE_TITLE} description={PAGE_DESCRIPTION} noindex />
      <div className="flex min-h-screen flex-col bg-cream">
        <Navbar />

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
          <h1 className="font-display text-3xl font-black text-ink">
            Akun Saya
          </h1>

          {/* Profil ringkas */}
          <section className="mt-6">
            <ProfileCard
              data={dashboard}
              isLoading={dashLoading}
              sessionUser={user}
            />
          </section>

          {/* Daftar registrasi */}
          <section className="mt-8">
            <h2 className="mb-4 font-display text-xl font-bold text-ink">
              Registrasi Saya
            </h2>
            <RegistrationList
              data={registrations}
              isLoading={regLoading}
              isError={regError}
            />
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
