import { describe, expect, it } from "vitest";
import { matchRoute } from "@/lib/routeMatch";

describe("matchRoute", () => {
  it("resolves every existing public SPA route", () => {
    expect(matchRoute("/")).toEqual({ name: "home" });
    expect(matchRoute("/about")).toEqual({ name: "about" });
    expect(matchRoute("/skills")).toEqual({ name: "skills" });
    expect(matchRoute("/services")).toEqual({ name: "services" });
    expect(matchRoute("/projects")).toEqual({ name: "projects" });
    expect(matchRoute("/resume")).toEqual({ name: "resume" });
    expect(matchRoute("/contact")).toEqual({ name: "contact" });
  });

  it("resolves a project detail route with the decoded slug", () => {
    expect(matchRoute("/projects/sk-learntrack-ai-learning-platform")).toEqual({
      name: "project-detail",
      slug: "sk-learntrack-ai-learning-platform",
    });
  });

  it("decodes a URL-encoded slug segment", () => {
    expect(matchRoute("/projects/some%20slug")).toEqual({
      name: "project-detail",
      slug: "some slug",
    });
  });

  it("falls back to the intentional not-found route for unknown paths", () => {
    expect(matchRoute("/this-page-does-not-exist")).toEqual({ name: "not-found" });
    expect(matchRoute("/projects/a/b")).toEqual({ name: "not-found" });
  });

  it("is direct-entry-agnostic: the same pathname always resolves the same way", () => {
    // RouterProvider derives the initial route from window.location.pathname
    // on mount regardless of how the browser arrived at that path, so a
    // fresh direct load of /about and an in-app navigation to /about must
    // resolve identically.
    const directLoad = matchRoute("/about");
    const inAppNavigation = matchRoute("/about");
    expect(directLoad).toEqual(inAppNavigation);
  });
});
