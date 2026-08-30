import { afterEach, describe, expect, it, vi } from "vitest";

// api.ts reads import.meta.env.VITE_API_BASE_URL once, at module load, into
// a top-level const - so each scenario needs its own fresh module instance
// (vi.resetModules + dynamic import) after stubbing the env var, rather
// than relying on whatever a local frontend/.env happens to contain.
async function loadApiWithEnv(value: string | undefined) {
  vi.resetModules();
  if (value === undefined) {
    vi.unstubAllEnvs();
  } else {
    vi.stubEnv("VITE_API_BASE_URL", value);
  }
  return import("./api");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("apiUrl() base-URL resolution (P01A4 .env correction)", () => {
  it("falls back to a same-origin relative path when VITE_API_BASE_URL is unset", async () => {
    const { apiUrl } = await loadApiWithEnv(undefined);
    expect(apiUrl("/api/v1/public/site/settings/")).toBe("/api/v1/public/site/settings/");
  });

  it("never silently resolves to localhost when no env value is configured", async () => {
    const { apiUrl } = await loadApiWithEnv(undefined);
    expect(apiUrl("/api/v1/public/portfolio/projects/")).not.toContain("localhost");
  });

  it("prefixes with the configured origin when VITE_API_BASE_URL is set (e.g. production)", async () => {
    const { apiUrl } = await loadApiWithEnv("https://shahriyarkhan.onrender.com");
    expect(apiUrl("/api/v1/public/site/settings/")).toBe(
      "https://shahriyarkhan.onrender.com/api/v1/public/site/settings/"
    );
  });

  it("strips a trailing slash from a configured base URL before joining", async () => {
    const { apiUrl } = await loadApiWithEnv("https://shahriyarkhan.onrender.com/");
    expect(apiUrl("/healthz")).toBe("https://shahriyarkhan.onrender.com/healthz");
  });
});

describe("assetUrl() keeps frontend static assets on the frontend origin", () => {
  it("leaves /images/ paths untouched regardless of API base URL", async () => {
    const { assetUrl } = await loadApiWithEnv("https://shahriyarkhan.onrender.com");
    expect(assetUrl("/images/profile.png")).toBe("/images/profile.png");
  });

  it("prefixes /media/ paths with the API base URL when configured", async () => {
    const { assetUrl } = await loadApiWithEnv("https://shahriyarkhan.onrender.com");
    expect(assetUrl("/media/projects/example.jpg")).toBe(
      "https://shahriyarkhan.onrender.com/media/projects/example.jpg"
    );
  });

  it("returns absolute URLs unchanged", async () => {
    const { assetUrl } = await loadApiWithEnv(undefined);
    expect(assetUrl("https://example.com/image.png")).toBe("https://example.com/image.png");
  });
});
