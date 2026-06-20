import { describe, it, expect } from "vitest";
import { buildSitemap } from "../sitemap";

const BASE = "https://x.id";
const STATIC = ["/", "/events", "/daftar"];
const SLUGS = ["a", "b", "webinar-python-dasar"];

describe("buildSitemap()", () => {
  it("is wrapped in <urlset> element", () => {
    const xml = buildSitemap(BASE, STATIC, SLUGS);
    expect(xml).toContain("<urlset");
    expect(xml).toContain("</urlset>");
  });

  it("urlset has XMLNamespace attribute", () => {
    const xml = buildSitemap(BASE, STATIC, SLUGS);
    expect(xml).toContain("xmlns");
    expect(xml).toContain("sitemaps.org");
  });

  it("contains loc for homepage without double slash", () => {
    const xml = buildSitemap(BASE, STATIC, SLUGS);
    expect(xml).toContain("<loc>https://x.id/</loc>");
    expect(xml).not.toMatch(/<loc>https:\/\/x\.id\/\//);
  });

  it("contains loc for /events", () => {
    const xml = buildSitemap(BASE, STATIC, SLUGS);
    expect(xml).toContain("<loc>https://x.id/events</loc>");
  });

  it("contains loc for /daftar", () => {
    const xml = buildSitemap(BASE, STATIC, SLUGS);
    expect(xml).toContain("<loc>https://x.id/daftar</loc>");
  });

  it("contains loc for /events/a", () => {
    const xml = buildSitemap(BASE, STATIC, SLUGS);
    expect(xml).toContain("<loc>https://x.id/events/a</loc>");
  });

  it("contains loc for /events/b", () => {
    const xml = buildSitemap(BASE, STATIC, SLUGS);
    expect(xml).toContain("<loc>https://x.id/events/b</loc>");
  });

  it("contains loc for /events/webinar-python-dasar", () => {
    const xml = buildSitemap(BASE, STATIC, SLUGS);
    expect(xml).toContain("<loc>https://x.id/events/webinar-python-dasar</loc>");
  });

  it("no double slashes in any loc", () => {
    const xml = buildSitemap(BASE, STATIC, SLUGS);
    const locs = xml.match(/<loc>(.*?)<\/loc>/g) ?? [];
    locs.forEach((loc) => {
      // Allow https:// but no other double slash
      const path = loc.replace("https://", "");
      expect(path).not.toContain("//");
    });
  });

  it("home has highest priority", () => {
    const xml = buildSitemap(BASE, STATIC, SLUGS);
    // Home URL block should contain priority 1.0
    const homeBlock = xml.match(/<url>[\s\S]*?<loc>https:\/\/x\.id\/<\/loc>[\s\S]*?<\/url>/);
    expect(homeBlock).not.toBeNull();
    expect(homeBlock![0]).toContain("<priority>1.0</priority>");
  });

  it("includes <changefreq> for each url", () => {
    const xml = buildSitemap(BASE, STATIC, SLUGS);
    const changefreqCount = (xml.match(/<changefreq>/g) ?? []).length;
    // static paths + event slugs
    expect(changefreqCount).toBe(STATIC.length + SLUGS.length);
  });

  it("is valid XML with declaration", () => {
    const xml = buildSitemap(BASE, STATIC, SLUGS);
    expect(xml).toMatch(/^<\?xml /);
  });
});
