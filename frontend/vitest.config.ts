import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// P01A stabilization: the smallest justified frontend test setup. Most
// tests are pure-function/data-shape checks that need no DOM, so the
// default environment stays the lightweight "node" one. P01A4 adds a
// single DOM-rendering test (ProjectImageGallery.test.tsx, hook-order
// safety) that opts into jsdom per-file via a `// @vitest-environment
// jsdom` pragma - jsdom is a devDependency used only by that file.
export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			environment: "node",
			include: ["src/**/*.test.{ts,tsx}"],
		},
	})
);
