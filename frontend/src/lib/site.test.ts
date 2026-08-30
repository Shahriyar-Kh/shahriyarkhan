import { describe, expect, it } from "vitest";
import { SITE_URL, canonicalUrl } from "@/lib/site";

describe("SITE_URL / canonicalUrl", () => {
  it("uses the approved temporary canonical origin", () => {
    // P01A decision: shahriyarkhan.dev has no working DNS, so the
    // temporary canonical is the live Vercel deployment.
    expect(SITE_URL).toBe("https://shahriyarkhan.vercel.app");
  });

  it("never generates a URL on the non-resolving shahriyarkhan.dev domain", () => {
    expect(SITE_URL).not.toContain("shahriyarkhan.dev");
    expect(canonicalUrl("/about")).not.toContain("shahriyarkhan.dev");
  });

  it("builds a canonical URL for the home route with a trailing slash", () => {
    expect(canonicalUrl("/")).toBe("https://shahriyarkhan.vercel.app/");
  });

  it("builds a canonical URL for a nested route without a trailing slash", () => {
    expect(canonicalUrl("/about")).toBe("https://shahriyarkhan.vercel.app/about");
    expect(canonicalUrl("/projects/sk-learntrack-ai-learning-platform")).toBe(
      "https://shahriyarkhan.vercel.app/projects/sk-learntrack-ai-learning-platform"
    );
  });
});
