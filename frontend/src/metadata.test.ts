import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const indexHtml = readFileSync(resolve(__dirname, "../index.html"), "utf-8");

describe("production metadata canonical origin (P01A Phase 3)", () => {
  it("index.html never references the non-resolving shahriyarkhan.dev domain", () => {
    expect(indexHtml).not.toContain("shahriyarkhan.dev");
  });

  it("index.html's canonical link and JSON-LD both use the approved temporary canonical", () => {
    expect(indexHtml).toContain('href="https://shahriyarkhan.vercel.app/"');
    expect(indexHtml).toContain('"url": "https://shahriyarkhan.vercel.app"');
  });
});
