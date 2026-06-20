import { Head } from "vite-react-ssg";

/** Props for the Seo component. */
export interface SeoProps {
  /** Page title shown in browser tab and OG/Twitter title. */
  title: string;
  /** Meta description for SEO and social previews. */
  description: string;
  /** Absolute canonical URL. Omit on pages where canonical is unnecessary. */
  canonical?: string;
  /** Absolute OG image URL. Used for og:image and twitter:image. */
  image?: string;
  /** Open Graph type. Defaults to "website". */
  type?: "website" | "article" | "event";
  /**
   * One or more JSON-LD schema.org objects.
   * Rendered as <script type="application/ld+json"> in the COMPONENT BODY
   * (not inside <Head>) so they are reliably included in prerendered static
   * HTML. react-helmet-async 1.3.0's toString() only extracts `innerHTML`
   * properties but React's dangerouslySetInnerHTML stores a different key,
   * causing script tags inside <Head> to be silently dropped during SSG.
   */
  jsonLd?: object | object[];
  /** When true, emits <meta name="robots" content="noindex">. */
  noindex?: boolean;
}

/**
 * Renders SEO/GEO head tags via vite-react-ssg <Head> (react-helmet-async).
 * Covers: title, description, canonical, OpenGraph, Twitter card, and
 * optional robots noindex.
 *
 * JSON-LD structured data is rendered in the component body (not in <Head>)
 * because react-helmet-async 1.3.0 (bundled in vite-react-ssg) cannot
 * correctly serialize <script dangerouslySetInnerHTML> to static HTML via
 * helmet.script.toString(). Body rendering is reliable in SSG and is how
 * Faq.tsx emits its FAQPage schema.
 */
export function Seo({
  title,
  description,
  canonical,
  image,
  type = "website",
  jsonLd,
  noindex = false,
}: SeoProps): JSX.Element {
  const jsonLdItems = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />

        {canonical && <link rel="canonical" href={canonical} />}
        {noindex && <meta name="robots" content="noindex" />}

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={type} />
        {canonical && <meta property="og:url" content={canonical} />}
        {image && <meta property="og:image" content={image} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {image && <meta name="twitter:image" content={image} />}
      </Head>

      {/* JSON-LD structured data — rendered in body so SSG prerendering works.
          react-helmet-async 1.3.0 drops dangerouslySetInnerHTML scripts from
          the <head> extraction; body scripts are serialized by React's SSR
          renderer directly and always appear in the static HTML. */}
      {jsonLdItems.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
    </>
  );
}
