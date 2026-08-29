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
