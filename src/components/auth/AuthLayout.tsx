/**
 * AuthLayout — tata letak bersama untuk halaman autentikasi (masuk/daftar).
 *
 * Menyediakan: Navbar, konten terpusat dalam Card, Footer, dan Seo noindex.
 */

import { Navbar } from "../layout/Navbar";
import { Footer } from "../layout/Footer";
import { Card } from "../ui/Card";
import { Seo } from "../Seo";

/** Props untuk AuthLayout. */
export interface AuthLayoutProps {
  /** Judul halaman untuk tag <title> dan SEO. */
  title: string;
  /** Deskripsi meta untuk SEO. */
  description: string;
  /** Konten formulir yang dirender di dalam Card. */
  children: React.ReactNode;
}

/**
 * Layout terpusat untuk halaman auth.
 * Selalu noindex karena halaman auth tidak perlu diindeks mesin pencari.
 */
export function AuthLayout({ title, description, children }: AuthLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Seo title={title} description={description} noindex />
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="p-8">
            {children}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
