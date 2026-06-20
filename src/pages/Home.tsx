import { Seo } from "../components/Seo";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Hero } from "../components/home/Hero";
import { ValueProps } from "../components/home/ValueProps";
import { HowItWorks } from "../components/home/HowItWorks";
import { FeaturedEvents } from "../components/home/FeaturedEvents";
import { AppDownload } from "../components/home/AppDownload";
import { Faq } from "../components/home/Faq";
import {
  organizationLd,
  websiteLd,
  SITE_URL,
} from "../lib/seo/jsonld";

/** Page-level SEO copy (Bahasa Indonesia). */
const PAGE_TITLE = "Edubing — Belajar Digital & Event Edukatif untuk Pelajar";
const PAGE_DESCRIPTION =
  "Edubing adalah platform belajar digital sekaligus tempat ikut event edukatif — kelas online, workshop, dan kompetisi — untuk pelajar Indonesia. Daftar gratis.";

/**
 * Home — public landing page and design-system showcase.
 * Composes the full marketing narrative (Navbar → Hero → ValueProps →
 * HowItWorks → FeaturedEvents → AppDownload → Faq → Footer).
 *
 * Organization and WebSite JSON-LD are emitted via <Seo> (rendered in body).
 * FAQPage JSON-LD is emitted inline by <Faq> itself, matching visible content.
 * Deduplication: faqLd() is NOT passed to <Seo> to avoid double JSON-LD.
 */
export default function Home(): JSX.Element {
  return (
    <>
      <Seo
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        canonical={SITE_URL}
        jsonLd={[organizationLd(), websiteLd()]}
      />
      <Navbar />
      <main>
        <Hero />
        <ValueProps />
        <HowItWorks />
        <FeaturedEvents />
        <AppDownload />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
