import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
import { toHaveNoViolations } from "vitest-axe/dist/matchers";

// vitest-axe@0.1.0 ships two packaging bugs (confirmed by inspection of
// node_modules, not a resolution/config issue on this end): its
// "vitest-axe/extend-expect" entry is an empty file, and its
// "vitest-axe/matchers" root re-export uses `export type *`, which makes
// the real runtime export type-only as far as tsc is concerned. Importing
// straight from "vitest-axe/dist/matchers" (which exports the function as
// a real value) and extending expect() here sidesteps both.
expect.extend({ toHaveNoViolations });

afterEach(() => {
  cleanup();
});

// jsdom implements neither API. Every component using
// usePrefersReducedMotion() (matchMedia) or an IntersectionObserver
// (Reveal, SystemMapActivation) would otherwise throw in every render
// test, not just the ones specifically testing motion behavior.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}

if (!("IntersectionObserver" in window)) {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  // @ts-expect-error - test-only polyfill, not a spec-complete implementation
  window.IntersectionObserver = MockIntersectionObserver;
}
