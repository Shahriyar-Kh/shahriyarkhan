import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/lib/site";

const robotsTxt = readFileSync(resolve(__dirname, "../public/robots.txt"), "utf-8");
const sitemapXml = readFileSync(resolve(__dirname, "../public/sitemap.xml"), "utf-8");

describe("static robots.txt and sitemap.xml consistency (P01A4)", () => {
  it("robots.txt points at the sitemap under the canonical site origin", () => {
    expect(robotsTxt).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  it("neither file references the non-resolving shahriyarkhan.dev domain", () => {
    expect(robotsTxt).not.toContain("shahriyarkhan.dev");
    expect(sitemapXml).not.toContain("shahriyarkhan.dev");
  });

  it("every sitemap <loc> uses the canonical site origin", () => {
    const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) {
      expect(loc.startsWith(`${SITE_URL}/`) || loc === SITE_URL).toBe(true);
    }
  });

  it("includes the verified Yango Wing Fleet project route", () => {
    expect(sitemapXml).toContain("/projects/yango-wing-fleet-digital-registration-platform");
  });

  it("excludes the hidden InsightBoard CRM route", () => {
    const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.some((loc) => loc.toLowerCase().includes("insightboard"))).toBe(false);
  });
});
