// @vitest-environment jsdom
//
// This is the only test in the suite that needs a DOM (jsdom, added as a
// devDependency for this file alone via the per-file environment pragma
// above - every other test stays on the lightweight "node" environment
// configured in vitest.config.ts). It exists to prove the P01A4 hook-order
// fix: the component used to `return` early for an empty `images` array
// *before* its two `useEffect` calls, which changes how many hooks run
// across renders of the same instance - a react-hooks/rules-of-hooks
// violation that React reports via `console.error`, not a thrown
// exception, so the assertion below checks for that warning's absence.
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectImageGallery } from "./ProjectImageGallery";

// Required for React 19's act() outside a testing-library harness.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("ProjectImageGallery hook safety (P01A4)", () => {
  let container: HTMLDivElement;
  let root: Root;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    consoleErrorSpy.mockRestore();
  });

  it("renders an empty state with no images and calls no hooks conditionally", () => {
    act(() => {
      root.render(<ProjectImageGallery images={[]} projectTitle="Test Project" />);
    });
    expect(container.textContent).toContain("No gallery images available");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders images without a React hook-order warning", () => {
    act(() => {
      root.render(
        <ProjectImageGallery
          images={[{ id: 1, image: "/a.jpg" }, { id: 2, image: "/b.jpg" }]}
          projectTitle="Test Project"
        />
      );
    });
    expect(container.querySelector(".pig-shell")).not.toBeNull();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("transitions from empty to populated on the same instance without a hook-order warning", () => {
    act(() => {
      root.render(<ProjectImageGallery images={[]} projectTitle="Test Project" />);
    });
    act(() => {
      root.render(
        <ProjectImageGallery images={[{ id: 1, image: "/a.jpg" }]} projectTitle="Test Project" />
      );
    });
    expect(container.querySelector(".pig-shell")).not.toBeNull();
    // This is the exact scenario the original bug broke: React logs
    // "Rendered more hooks than during the previous render" via
    // console.error (it does not throw) when hook order changes across
    // renders of the same component instance.
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
