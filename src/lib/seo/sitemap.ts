/**
 * Builds a valid sitemap XML string for the Edubing web app.
 * Pure function — no I/O, no side effects.
 *
 * @param base_url   - Canonical base URL (e.g. "https://app.edubing.id"), no trailing slash
 * @param static_paths - Static route paths (e.g. ["/", "/events", "/daftar"])
 * @param event_slugs  - Dynamic event slugs; each becomes /events/<slug>
 * @returns Well-formed XML string with <?xml declaration and <urlset> root
 */
export function buildSitemap(
  base_url: string,
  static_paths: string[],
  event_slugs: string[]
): string {
  const base = base_url.replace(/\/$/, "");

  const makeUrl = (loc: string, changefreq: string, priority: string): string => {
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      "  </url>",
    ].join("\n");
  };

  const staticEntries = static_paths.map((path) => {
    const loc = path === "/" ? `${base}/` : `${base}${path}`;
    const isHome = path === "/";
    const isEvents = path === "/events";
    const changefreq = isHome ? "daily" : isEvents ? "hourly" : "weekly";
    const priority = isHome ? "1.0" : isEvents ? "0.9" : "0.7";
    return makeUrl(loc, changefreq, priority);
  });

  const eventEntries = event_slugs.map((slug) => {
    const loc = `${base}/events/${slug}`;
    return makeUrl(loc, "weekly", "0.8");
  });

  const urls = [...staticEntries, ...eventEntries].join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ].join("\n");
}
