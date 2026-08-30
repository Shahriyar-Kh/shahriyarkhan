import { describe, expect, it } from "vitest";
import { EXPERIENCES_ENDPOINT } from "@/lib/apiEndpoints";

describe("EXPERIENCES_ENDPOINT", () => {
  it("points at the actual registered backend route (plural), not the old broken singular path", () => {
    expect(EXPERIENCES_ENDPOINT).toBe("/api/v1/public/portfolio/experiences/");
    expect(EXPERIENCES_ENDPOINT).not.toBe("/api/v1/public/portfolio/experience/");
  });
});
