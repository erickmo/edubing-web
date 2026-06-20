/**
 * Shared home-page content constants (Bahasa Indonesia).
 *
 * FAQ_ITEMS is the SINGLE source of truth for both the visible accordion
 * (Faq.tsx) and the FAQPage JSON-LD (Home.tsx → faqLd), so structured data
 * always matches what users see. HERO_HEADLINE is exported separately so the
 * prerender grep can assert the same static marketing string.
 */

/** Brand definition sentence — establishes the entity for GEO/LLMs. */
export const BRAND_DEFINITION =
  "Edubing adalah platform belajar digital sekaligus tempat ikut event edukatif — dari kelas online, workshop, hingga kompetisi — untuk pelajar Indonesia.";

/** Main hero headline. Kept as a constant so tests + prerender can assert it. */
export const HERO_HEADLINE_LEAD = "Belajar seru,";
export const HERO_HEADLINE_HIGHLIGHT = "ikut event keren.";
/** Full headline used for SEO/test assertions. */
export const HERO_HEADLINE = `${HERO_HEADLINE_LEAD} ${HERO_HEADLINE_HIGHLIGHT}`;

/** A single FAQ question/answer pair. */
export interface FaqItem {
  question: string;
  answer: string;
}

/** FAQ content — feeds BOTH the visible accordion and the FAQPage JSON-LD. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Apa itu Edubing?",
    answer:
      "Edubing adalah platform belajar digital sekaligus tempat ikut event edukatif untuk pelajar Indonesia. Kamu bisa belajar lewat kelas online, mengikuti workshop, dan ikut kompetisi dalam satu aplikasi.",
  },
  {
    question: "Apakah Edubing gratis?",
    answer:
      "Membuat akun Edubing gratis. Ada banyak konten dan event gratis, serta beberapa kelas dan event premium berbayar dengan harga yang transparan.",
  },
  {
    question: "Bagaimana cara mendaftar event?",
    answer:
      "Buka halaman Event, pilih event yang kamu suka, lalu klik Daftar. Untuk event berbayar kamu akan diarahkan ke pembayaran sebelum kursi dikonfirmasi.",
  },
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer:
      "Edubing mendukung pembayaran lewat transfer bank, e-wallet, dan kartu — diproses lewat payment gateway tepercaya. Kursi event langsung dikonfirmasi setelah pembayaran berhasil.",
  },
  {
    question: "Bagaimana cara memasang aplikasi Edubing?",
    answer:
      "Edubing tersedia sebagai aplikasi web (PWA) yang bisa langsung dipasang dari browser tanpa toko aplikasi. Buka portal Edubing, lalu pilih “Pasang Aplikasi”. Versi Google Play dan App Store segera hadir.",
  },
  {
    question: "Apakah ada kelas online?",
    answer:
      "Ada. Selain event tatap muka, Edubing menyediakan kelas dan workshop online yang bisa kamu ikuti dari mana saja, lengkap dengan materi yang bisa diakses kapan pun.",
  },
];
