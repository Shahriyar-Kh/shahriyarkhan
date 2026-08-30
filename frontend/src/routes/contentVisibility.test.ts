import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  experienceItems,
  hiddenExperienceItemsPendingVerification,
  fallbackProjects,
  stats,
} from "@/routes/index";
import { projects as projectsListFallback } from "@/routes/projects";
import { projectFallbacks } from "@/routes/projects.$slug";

function containsCognoRise(items: Array<{ company: string }>): boolean {
  return items.some((item) => item.company.toLowerCase().includes("cognorise"));
}

function containsInsightBoard(items: Array<{ title?: string; slug?: string }>): boolean {
  return items.some(
    (item) =>
      item.title?.toLowerCase().includes("insightboard") ||
      item.slug?.toLowerCase().includes("insightboard")
  );
}

describe("CognoRise InfoTech is hidden pending verification (P01A Phase 4)", () => {
  it("is absent from the rendered home-page experience list", () => {
    expect(containsCognoRise(experienceItems)).toBe(false);
  });

  it("is preserved, not deleted, in a clearly-marked pending-verification list", () => {
    expect(hiddenExperienceItemsPendingVerification.length).toBeGreaterThan(0);
    expect(containsCognoRise(hiddenExperienceItemsPendingVerification)).toBe(true);
  });

  it("the 'Real Roles' home-page stat matches the number of roles actually shown", () => {
    const realRolesStat = stats.find((stat) => stat.label === "Real Roles");
    expect(realRolesStat?.value).toBe(experienceItems.length);
  });
});

describe("InsightBoard CRM is hidden pending verification (P01A Phase 4)", () => {
  it("is absent from the home page's fallback project list", () => {
    expect(containsInsightBoard(fallbackProjects)).toBe(false);
  });

  it("is absent from the /projects page's fallback project list", () => {
    expect(containsInsightBoard(projectsListFallback)).toBe(false);
  });

  it("is absent from the /projects/:slug fallback case-study map", () => {
    const slugs = Object.keys(projectFallbacks);
    expect(slugs.some((slug) => slug.toLowerCase().includes("insightboard"))).toBe(false);
    expect(containsInsightBoard(Object.values(projectFallbacks))).toBe(false);
  });
});

describe("Yango Wing Fleet's private registration screenshot stays excluded (P01A4 content audit)", () => {
  it("never references custom_dashbaord_image2.png (real driver names/phone number) from any fallback source", () => {
    const yango = projectFallbacks["yango-wing-fleet-digital-registration-platform"];
    expect(yango).toBeDefined();
    const images = [
      ...(yango.detail_images ?? []),
      yango.preview_image ?? "",
      yango.featured_image ?? "",
    ];
    expect(images.some((src) => src.includes("custom_dashbaord_image2"))).toBe(false);
  });

  it("is not referenced by any CSS background-image either (P01A5 gap fix)", () => {
    // P01A4 only checked the TSX fallback data and missed a CSS
    // background-image: url(...) reference to the same file in
    // styles.css - this scans every source file under src/ (not just
    // the known offender) so the same class of gap can't recur silently.
    // Lines whose trimmed form starts with a comment marker (// or /*)
    // are skipped, since the filename is expected to appear in the
    // explanatory comments documenting this exclusion.
    const offenders: string[] = [];
    function scan(dir: string) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        const full = resolve(dir, entry.name);
        if (entry.isDirectory()) {
          scan(full);
        } else if (/\.(css|ts|tsx|html)$/.test(entry.name) && !entry.name.endsWith(".test.ts") && !entry.name.endsWith(".test.tsx")) {
          const lines = readFileSync(full, "utf-8").split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) continue;
            if (line.includes("custom_dashbaord_image2")) offenders.push(full);
          }
        }
      }
    }
    scan(resolve(__dirname, ".."));
    expect(offenders).toEqual([]);
  });
});
