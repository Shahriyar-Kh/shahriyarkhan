import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// P01A stabilization: the smallest justified frontend test setup. All
// current stabilization tests are pure-function/data-shape checks that
// need no DOM, so this deliberately stays on the lightweight "node" test
// environment rather than adding jsdom + a rendering library.
export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			environment: "node",
			include: ["src/**/*.test.ts"],
		},
	})
);
