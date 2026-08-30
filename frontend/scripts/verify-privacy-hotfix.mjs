#!/usr/bin/env node
// Privacy regression verification for the removed Yango screenshot.
//
// Originally written (P01A5H) for a standalone emergency-hotfix branch
// built directly on origin/main, which had no test framework at all -
// this stayed a plain Node.js script deliberately, rather than adding
// vitest/jsdom, to keep that hotfix minimal. Now reconciled onto the
// full P01A stabilization branch (P01A5R.1), which already has its own
// richer vitest suite - kept as a standalone script anyway (still zero
// new dependencies, still runnable stand-alone via
// `node scripts/verify-privacy-hotfix.mjs`, optionally after
// `npm run build` to also check dist/), but narrowed to what it does
// that the vitest suite doesn't already cover more precisely:
//
//   1. No *application* source file references
//      custom_dashbaord_image2.png outside an explanatory comment
//      (test files are excluded from this scan - a test asserting the
//      filename's absence, like contentVisibility.test.ts, is correct,
//      not a violation).
//   2. If dist/ exists, the built output contains neither the file
//      itself nor a reference to it.
//   3. Yango's fallback content still renders a non-empty, valid
//      gallery (detail_images) after the removal.
//   4. Every remaining Yango image path in source actually exists on
//      disk under public/ (no broken image URL was introduced).
//
// CognoRise/InsightBoard visibility (this hotfix never touched either)
// is verified by frontend/src/routes/contentVisibility.test.ts and the
// backend's apps.portfolio.tests.HiddenDisputedContentExclusionTests -
// both assert the actual behavior directly, which is more precise than
// this script's earlier "no diff on index.tsx/backend" approximation.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { execSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const SENSITIVE = "custom_dashbaord_image2";
let failures = 0;

function fail(msg) {
  failures++;
  console.error(`FAIL: ${msg}`);
}

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

// 1. No active source reference outside a comment.
function scanForActiveReference(dir, exts) {
  const offenders = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      offenders.push(...scanForActiveReference(full, exts));
    } else if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) {
      continue;
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      const lines = readFileSync(full, "utf-8").split("\n");
      let inBlockComment = false;
      for (const line of lines) {
        const trimmed = line.trim();
        const wasInBlockComment = inBlockComment;
        if (inBlockComment) {
          if (line.includes("*/")) inBlockComment = false;
        } else if (trimmed.startsWith("/*") && !line.includes("*/")) {
          inBlockComment = true;
        }
        const isCommentLine = wasInBlockComment || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*");
        if (isCommentLine) continue;
        if (line.includes(SENSITIVE)) offenders.push(full);
      }
    }
  }
  return offenders;
}

const srcOffenders = scanForActiveReference(join(root, "src"), [".ts", ".tsx", ".css", ".html"]);
if (srcOffenders.length === 0) {
  pass("no active source reference to the sensitive asset outside a comment");
} else {
  fail(`active source reference(s) remain: ${srcOffenders.join(", ")}`);
}

// 1b. The physical asset itself must be gone from public/.
const assetPath = join(root, "public", "images", "yangowing_images", `${SENSITIVE}.png`);
if (!existsSync(assetPath)) {
  pass("the physical asset is absent from frontend/public/");
} else {
  fail("the physical asset still exists on disk under frontend/public/");
}

// 2. If dist/ exists (i.e. a build was run), check it too.
const distDir = join(root, "dist");
if (existsSync(distDir)) {
  const distHit = execSync(`grep -rl "${SENSITIVE}" "${distDir}" || true`, { encoding: "utf-8" }).trim();
  const distFile = join(distDir, "images", "yangowing_images", `${SENSITIVE}.png`);
  if (!distHit && !existsSync(distFile)) {
    pass("dist/ contains neither the asset nor a reference to it");
  } else {
    fail(`dist/ still contains the asset or a reference: ${distHit || distFile}`);
  }
} else {
  console.log("SKIP: dist/ not present (run `npm run build` first to check the built output)");
}

// 3 & 4. Yango's fallback gallery is still valid and every path exists on disk.
const slugFile = join(root, "src", "routes", "projects.$slug.tsx");
const slugContent = readFileSync(slugFile, "utf-8");
const yangoBlockMatch = slugContent.match(/"yango-wing-fleet-digital-registration-platform":\s*\{([\s\S]*?)\n {2}\},/);
if (!yangoBlockMatch) {
  fail("could not locate the Yango fallback block in projects.$slug.tsx");
} else {
  const block = yangoBlockMatch[1];
  const detailImagesMatch = block.match(/detail_images:\s*\[([\s\S]*?)\]/);
  if (!detailImagesMatch) {
    fail("Yango's detail_images array could not be parsed");
  } else {
    const paths = [...detailImagesMatch[1].matchAll(/"(\/images\/[^"]+)"/g)].map((m) => m[1]);
    if (paths.length > 0) {
      pass(`Yango's gallery still has ${paths.length} image(s) after removal (not padded with fabricated content)`);
    } else {
      fail("Yango's detail_images array is empty");
    }
    const missing = paths.filter((p) => !existsSync(join(root, "public", p)));
    if (missing.length === 0) {
      pass("every remaining Yango image path resolves to a real file on disk (no broken image URL)");
    } else {
      fail(`these Yango image paths do not exist on disk: ${missing.join(", ")}`);
    }
  }
}

console.log("");
console.log("NOTE: CognoRise/InsightBoard visibility is verified by contentVisibility.test.ts");
console.log("      and the backend's HiddenDisputedContentExclusionTests, not by this script.");
console.log("");
if (failures === 0) {
  console.log("ALL CHECKS PASSED");
  process.exit(0);
} else {
  console.error(`${failures} CHECK(S) FAILED`);
  process.exit(1);
}
