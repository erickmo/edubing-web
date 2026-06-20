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
  /** One or more JSON-LD schema.org objects rendered as <script> tags. */
  jsonLd?: object | object[];
  /** When true, emits <meta name="robots" content="noindex">. */
  noindex?: boolean;
}

/**
 * Renders SEO/GEO head tags via vite-react-ssg <Head> (react-helmet-async).
 * Covers: title, description, canonical, OpenGraph, Twitter card,
 * optional robots noindex, and JSON-LD structured data.
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

      {/* JSON-LD structured data */}
      {jsonLdItems.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
    </Head>
  );
}
