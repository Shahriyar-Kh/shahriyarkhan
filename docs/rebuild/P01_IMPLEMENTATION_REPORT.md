# P01 Implementation Report

Written against the finished tree, then revised during a corrective pass (P01-FIX). This is the narrative record of what shipped, what was verified, what was deliberately left undone, and — per the quality-upgrade addendum's own acceptance gate — a direct, citation-backed argument for why this result is not "technically correct but visually generic."

**Status as of the P01-FIX corrective pass: not complete.** All automated gates (typecheck, lint, 123 tests, offline build, live-API build, route smoke, broken-link check, security headers, `npm audit`) now pass under the correct Node runtime — see "P01-FIX: CI runtime alignment" below. **Real-browser visual QA has not been performed and is an explicit, unresolved blocker** — see "Visual QA: owner-review required" below for why, and the checklist to use. This PR must not be merged, marked ready for review, or treated as shipped until that pass happens.

## P01-FIX: CI runtime alignment

The original `web` CI job pinned `node-version: "20"`, inherited unmodified from the scaffold commit's `engines.node: ">=20.9.0"`. This was wrong: the dependency tree added in later commits includes `jsdom@30.0.1` (`engines.node: "^22.22.2 || ^24.15.0 || >=26.0.0"`), `undici@8.10.0` (`>=22.19.0`, a transitive dependency pulled in by `jsdom`), and `@testing-library/jest-dom@7` (`>=22`). `npm ci` doesn't fail on an engine mismatch (`EBADENGINE` is a warning, not an error), so installation succeeded — but every Vitest worker then crashed before running a single test: `TypeError: webidl.util.markAsUncloneable is not a function`, thrown from `undici`'s `CacheStorage` constructor (`node_modules/undici/lib/web/cache/cachestorage.js:20`) — an API that doesn't exist on Node 20's bundled V8/webidl internals. Confirmed directly from the failing run's log (`gh run view ... --log`), not inferred.

**Fix:** the runtime is now pinned consistently in four places, all agreeing on **Node 22.22.2** — the oldest patch in the Node 22 LTS line that satisfies `jsdom`'s range:

- `web/.nvmrc` — `22.22.2`
- `web/package.json`'s `engines.node` — `^22.22.2` (was `>=20.9.0`, which silently allowed the broken Node 20)
- `.github/workflows/ci.yml`'s `web` job — `node-version-file: web/.nvmrc` (was `node-version: "20"`)
- `web/README.md` and `docs/rebuild/P01_ARCHITECTURE.md`'s Stack section — both document the requirement and why

22.22.2 was chosen over the 24.x branch of `jsdom`'s range because it matches `../frontend/package.json`'s own existing `"engines.node": ">=22.12.0"` convention — nothing in this repository favors Node 24 over 22, so the existing convention wins. `web/package.json`'s `@types/node` was bumped `^20` → `^22` to match, and `package-lock.json` was regenerated (`npm ci` was re-run under Node 22.22.2, not just `npm install`, to confirm the lockfile installs reproducibly).

**Corrective-pass verification, all run under an actual Node 22.22.2 binary** (downloaded directly from `nodejs.org`'s official distribution to this session's temp directory, since no Node version manager was available locally and the system default is Node 24):

| Command | Result |
|---|---|
| `npm ci` | Clean install, zero `EBADENGINE` warnings, 0 vulnerabilities |
| `npm run typecheck` | Clean |
| `npm run lint` | Clean (4 harmless warnings, same as before — `next/image` mocks in test files) |
| `npm run test` | **123/123 tests passing across 25 files** — the exact failure mode from CI (`webidl.util.markAsUncloneable is not a function`) does not occur |
| `npm run build` (no API configured) | Clean, offline-deterministic, same 15-route output as before |
| `npm run smoke` / `npm run check-links` | All 14 routes pass; 16 same-origin URLs, zero broken links |
| `npm audit --omit=dev` | 0 vulnerabilities |

## P01-FIX: Linux production build with the real, configured API — now verified

The previous version of this report flagged a Windows-specific build-worker crash (`3221226505`, a native access violation) when building with `NEXT_PUBLIC_API_BASE_URL` pointed at the real Render API, and explicitly declined to treat the unconfigured build as sufficient evidence for the configured path. That gap is now closed: a genuine Linux build was run inside a `node:22.22.2-bookworm` Docker container (not a simulation — real Debian userspace, real Linux kernel via Docker Desktop's Linux VM), with `NEXT_PUBLIC_API_BASE_URL=https://shahriyarkhan.onrender.com` set to the real production API.

**Result: clean success, no crash.** This confirms the earlier crash was specific to the Windows/Turbopack/Node-worker-pool combination on the local dev machine, not a defect in this app's code — exactly as hypothesized (but not proven) in the previous version of this report.

- `npm ci` inside the container: clean, 0 vulnerabilities.
- `npm run build` with the real API configured: **succeeded**, producing 28 routes (15 static/dynamic + 13 `generateStaticParams`-driven detail pages: 6 real projects at `/work/[slug]` — the 5 originally audited plus `techbuilt-open-school-lms`, which the plan for this phase deliberately declined to write a case-study register for — and 7 real services at `/services/[slug]`).
- The built server was then **started** (`npm run start`, still inside the Linux container, port-mapped to the host) and exercised live:
  - `curl http://localhost:3101/` → `200`, homepage HTML contains real project names fetched from the live API (`Yango Wing Fleet`, `NoteAssist`, `SK-LearnTrack`), not placeholder/empty-state content.
  - CSP header correctly widens to include the real API origin only when one is configured: `connect-src 'self' https://shahriyarkhan.onrender.com` and `img-src ... https://shahriyarkhan.onrender.com` (confirms `next.config.ts`'s dynamic CSP construction works correctly against a real value, not just its unconfigured branch).
  - `npm run smoke` against the live-API server: all 14 checks pass.
  - `npm run check-links` against the live-API server: **29 same-origin URLs** discovered and checked (vs. 16 in offline mode, since real project/service links now exist to crawl) — every one of `/work/yango-wing-fleet-...`, `/work/noteassist-...`, `/work/sk-learntrack-...`, `/work/feelwise-...`, `/work/advanced-restaurant-management-system`, `/work/techbuilt-open-school-lms`, and all 7 `/services/[slug]` pages returns `200`. Zero broken links.
  - `techbuilt-open-school-lms` specifically renders `200` with no crash despite having no `live_url`, no distinct `github_url`, no images, and no case-study register entry — confirming the "every empty field renders honestly as absent" design claim in `P01_ARCHITECTURE.md` holds under real data, not just the fixture data used in unit tests.

This closes the "route smoke test, both configured and unconfigured API" definition-of-done item that was previously only partially verified.

## Visual QA: owner-review required, not performed

Requirement, restated plainly: real-browser visual QA at 360/390/768/1024/1440/1920px, covering overflow, typography, spacing, mobile nav, all 10 routes, detail pages, image cropping, contact-form states, focus order, visible focus styles, contrast, reduced motion, JS-disabled rendering, motif consistency, and the "does this feel custom" judgment call. **None of this was performed**, for two compounding reasons, both confirmed directly rather than assumed:

1. **No browser automation tool is available in this environment.** Only `WebFetch` (converts HTML to text/markdown for an LLM to read) and `curl`/Docker (for HTTP-level and build-level checks, both used extensively above) are available — neither can render CSS, evaluate layout at a viewport size, or judge whether something "looks custom."
2. **There is no reachable live preview of `web/` to point a browser at, even if one were available.** Checked directly: the PR's "Vercel Preview" check (`https://shahriyarkhan-git-feat-dfb409-shahriyar-khans-projects-dbef3e31.vercel.app`) returns `302` to `vercel.com/sso-api` — it is gated behind Vercel's team-authentication SSO and reachable only from the account owner's authenticated browser session, not from this session. More importantly: **that preview is almost certainly building `frontend/`, not `web/`, regardless of who views it** — `frontend/vercel.json` exists and configures the Vercel project's build (`buildCommand`/`outputDirectory`/SPA rewrites); no equivalent file exists for `web/`, and nothing in this repository or this engagement's history ever pointed the Vercel project's root directory at `web/` (doing so is explicitly out of scope — see "Stop conditions honored" below). The "Vercel Preview: pass" check cited as evidence in the original P01-FIX request is therefore evidence about the legacy Vite app rebuilding successfully, not about anything in this PR's actual new content.

**Per instruction, this is not marked as passed.** What follows is the exact reviewable target and a structured checklist for the one person who can currently see this app rendered: the repository owner, running it locally.

### How to review it

```bash
git fetch origin feat/p01-next-portfolio-foundation
git checkout feat/p01-next-portfolio-foundation
cd web
nvm use   # or fnm use - reads .nvmrc, needs Node 22.22.2
npm ci
cp .env.example .env.local   # points at the real production API by default
npm run build && npm run start
# open http://localhost:3000 in a real browser
```

For the JS-disabled check specifically: use the browser devtools' "Disable JavaScript" setting (Chrome/Firefox both support this per-tab) and reload every route. For reduced motion: toggle the OS-level "reduce motion" setting (or Chrome DevTools' Rendering tab → "Emulate CSS media feature prefers-reduced-motion: reduce") and reload.

### Owner-review checklist

Copy this into a PR comment or a scratch file when reviewing; check off what's actually been looked at, don't check off what's merely expected to work.

**Breakpoints** (resize the browser or use devtools device emulation) — at each of 360px, 390px, 768px, 1024px, 1440px, 1920px, on every one of the 10 routes (`/`, `/about`, `/work`, `/work/[slug]` on at least 2 real projects, `/experience`, `/resume`, `/services`, `/services/[slug]` on at least 2 real services, `/contact`, `/privacy`):

- [ ] No horizontal overflow/scrollbar anywhere
- [ ] Typography stays readable — no orphaned single words, no measure (line length) that's uncomfortably wide or narrow
- [ ] Section spacing and visual hierarchy hold up — nothing looks cramped or like it's floating with no relationship to its neighbors
- [ ] Mobile nav (below 768px specifically): opens, traps focus, closes on Escape, closes on route change, doesn't leave the page scrolled/locked after closing
- [ ] Images (project screenshots, the hero portrait) crop sensibly, no stretching, no obviously wrong aspect ratio
- [ ] The system-map section (homepage §04, and wherever else it's reused) doesn't overflow or clip at narrow widths

**Interaction and correctness**, real browser, real click-through, on the live-API server from the steps above:

- [ ] Contact form: submit a real test message successfully — confirm the success state appears and reads as "backend accepted it," not an email-delivery promise
- [ ] Contact form: trigger a client-side validation error (e.g. submit empty) — confirm inline errors appear and are legible
- [ ] Contact form: the intent selector (`?intent=` query param, e.g. `/contact?intent=freelance_project`) pre-selects the right option
- [ ] Keyboard-only pass: Tab through the homepage and at least one detail page start to finish — order should be logical (header → hero → down the page), nothing skipped, nothing trapped
- [ ] Every interactive element has a visible focus ring/outline when tabbed to (not just on click)
- [ ] Run the browser's own contrast checker (Chrome/Firefox devtools' accessibility inspector, or a tool like axe DevTools if installed) against body text, `--ink-tertiary`/`--ink-hint` specifically, and button text — these are the tokens `P01_ARCHITECTURE.md` flags as needing manual verification since jsdom can't check them
- [ ] Reduced motion: role-rotator becomes a static list, system map renders fully drawn with no animation, no visible layout jump when the setting is toggled
- [ ] JS disabled: every route still renders its core content (text, images, links); the system map still shows the complete diagram (not blank); the client-only pieces (mobile nav toggle, contact form submission, role rotation) degrade rather than error

**The judgment call the addendum cares about most:**

- [ ] Does this read as a custom-built site, or does it read as a Next.js/Tailwind template with the serial numbers filed off? (See "What makes this design custom to Shahriyar" above for the argument being tested here — confirm or refute it by eye.)

## What shipped

A new Next.js 16 App Router frontend at `web/`, positioned as a senior software-engineering portfolio, a specialist Django/Python practice, and a recruiter/client/CTO-ready professional profile — built alongside, not in place of, the still-live legacy Vite frontend (`frontend/`) and the untouched Django backend (`backend/`). Ten routes (`/`, `/about`, `/work`, `/work/[slug]`, `/experience`, `/resume`, `/services`, `/services/[slug]`, `/contact`, `/privacy`), a custom 404/error/loading set, a sitemap, robots.txt, and dynamic OG images. One additive, non-breaking backend change (the CORS origin addition). Zero gallery/`ProjectImage`/migration work — the gallery freeze held for the entire phase.

## What makes this design custom to Shahriyar

This is the section the addendum made mandatory, with citations rather than assertions, since "technically correct but visually generic" was explicitly defined as not done.

1. **The motif's filled/hollow `Node` is the claim-register status marker — not a coincidence of color, the same system.** `components/motif/node.tsx`'s doc comment says so directly, and `components/work/claim-badge.tsx` uses the identical component for exactly that purpose. No template site has a reason to unify its decorative system with its content-verification system, because no template site verifies its own content.
2. **The site publishes what it does not claim.** `components/work/limitations-note.tsx` renders a "What this page does not claim" block on every project with a case-study register — five real examples exist today (see `content/case-studies/*.ts`), including a direct, on-page acknowledgment that "the GitHub link on this project is a profile link, not a repository link." No marketing template ships a section whose entire purpose is stating what it is *not* asserting.
3. **The signature motif is reused across nine+ distinct surfaces**, not a one-off hero decoration: the active nav underline (`nav-link.tsx`, a `Run` not a pill), the hero portrait frame (`sections/hero.tsx`), the homepage system-map section (`sections/system-map-section.tsx`), project cards (`work/project-card.tsx`), case-study claim badges and evidence rails (`work/claim-badge.tsx`, `work/evidence-rail.tsx`), the services engagement track (`sections/engineering-approach.tsx`, `views/service-detail-view.tsx`), the global scroll-progress rule (`motif/scroll-progress.tsx`), and the favicon/OG images (`app/icon.tsx`, `lib/og-image.tsx`) — the same corner mark at three different scales.
4. **No two adjacent homepage sections share a layout primitive.** §02 is a horizontal Run with inline separators (not tiles); §03 is an editorial numbered index list (not a grid — the grid pattern is reserved for `/work` itself); §04 is a full-bleed diagram with zero cards; §05 is a two-column evidence spread; §06 is a dense `<dl>` with no icons or cards; §07 is a horizontal Run+Node track; §08 is the *inverse orientation* of §07 — a left-rule vertical timeline; §09 is deliberately the least-decorated row on the page; §10 is the only section on the page interactive without JavaScript (native `<details>`); §11 is a split panel mirroring §01's own fork. Verifiable directly against `components/sections/*.tsx` and their composition order in `components/views/home-view.tsx`.
5. **A featured case study is chosen algorithmically, not hardcoded.** `lib/home-selection.ts`'s `selectFeaturedCase()` sorts live projects by verified-claim count, tie-broken by a genuinely distinct repository link — if the underlying evidence for a project changes, the homepage's own featured spread follows automatically, with no template-author intervention required.
6. **The evidence-over-metrics substitution is load-bearing, not decorative.** Every place a generic template would put an invented percentage or client count, this site puts a checkable fact instead: a live URL with a last-confirmed date (`EvidenceLink.verifiedOn`), a real public repository where one genuinely exists, a named auth model, an audited screenshot. `test-guards/content-truth.test.ts` and `content/case-studies/case-studies.test.ts` keep this true mechanically, not just at review time.
7. **The palette is inherited on purpose, and this document says so.** `P01_BRAND_DIRECTION.md` and `P01_DESIGN_RESEARCH.md` both name this as the one deliberately *not*-custom decision — dark-first OKLCH tokens carried over from `frontend/` — and explain why (a rebuild, not a rebrand; the palette's own lightness relationships happen to suit the new motif). Nothing here claims false originality for something that was, correctly, kept the same.

## Homepage with animation off

`RoleRotator` (the only repeating animation on the page) falls back to a static, comma-separated role list under `prefers-reduced-motion`. The system map's authored SVG base state — no `data-enhanced`/`data-active` attributes present — *is* the complete, final diagram; the CSS that would otherwise hide it is scoped entirely inside `@media (prefers-reduced-motion: no-preference)`. Verified directly: `curl`-based header checks confirm the CSP and other security headers render identically regardless of motion preference (headers don't depend on client state), and the reduced-motion CSS path was read and traced by hand against `globals.css` lines ~253–320 rather than only asserted.

## Verification performed

- **Type checking:** `npm run typecheck` — clean, zero errors, across the full app including every test file.
- **Linting:** `npm run lint` (ESLint, `next/core-web-vitals` + `next/typescript` + the full `jsx-a11y` recommended rule set merged in) — zero errors. Four residual warnings, all `@next/next/no-img-element` inside test-only `next/image` mocks, which is expected and correct there.
- **Test suite:** `npm run test` (Vitest + Testing Library + `vitest-axe`) — **123 tests passing across 25 files**, zero failures. Coverage includes: the API client's retry/pagination/error-classification behavior against a mocked `fetch`; every pure page-state resolver (project/service/resume); the claim-register composition rule (`case-study-merge.test.ts`) including the "live API wins" precedence case; `selectFeaturedCase()`; `composeInquiryPayload()`'s allowlist guarantee (never produces a key outside the verified backend contract, for every intent); render tests for `HomeView`, `WorkView`, and `ProjectDetailView` (the explicit home/Work/project-detail requirement) in both populated and honest-empty/unavailable states; a full contact-form success/failure/validation/honeypot test (`InquiryForm`); a keyboard-interaction test for `MobileNav` (open, Escape-to-close, focus return); an axe accessibility pass on `WorkView` in two states; and four guard tests (`content-truth`, `no-dangerous-html`, `privacy-consistency`, and the claim register's own `case-studies.test.ts`) that keep this report's own factual claims mechanically true rather than aspirational.
- **Production build:** `npm run build` (Turbopack) succeeds cleanly with **no** `NEXT_PUBLIC_API_BASE_URL` set — fully offline-deterministic, matching exactly what the new `web` CI job runs. Every route renders its honest `EmptyState`/unavailable path rather than failing.
- **Local server smoke test:** `npm run smoke` against a real `next start` — all 14 checked routes return their expected status, including the two negative checks (`/insights` and an unknown path both correctly 404, proving the insights roadmap item was deliberately not built rather than forgotten).
- **Broken-link check:** `npm run check-links` against the same running server — 16 same-origin URLs discovered and checked from the 8 primary routes, zero broken links.
- **Security headers:** verified via `curl -sI` against the running server — CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` all present with the expected values; the résumé PDF specifically carries `X-Robots-Tag: noindex`.
- **Manual greps:** zero occurrences of `backdrop-filter`/`blur(`, zero raw `Organization` schema, zero raw `target="_blank"` outside `ExternalLink` (two were found and fixed during this pass — `project-card.tsx` and `project-hero.tsx` — see "Errors found and fixed" below), zero gallery/`ProjectImage`/`short_description`/`feature_bullets` usage anywhere outside the explanatory doc comment in `lib/api/types.ts` that lists them as forbidden.
- **`npm audit --omit=dev`:** 0 vulnerabilities.

## Errors found and fixed during this pass

- **Two raw `target="_blank"` anchors** in `components/work/project-card.tsx` and `components/work/project-hero.tsx` bypassed `ExternalLink`, the codebase's own documented single point for that pattern. Both now route through `ExternalLink`; the manual grep re-run confirms zero remaining occurrences outside it.
- **`vitest-axe@0.1.0` ships two real packaging bugs**, discovered while wiring the axe accessibility test: its `vitest-axe/extend-expect` entry is an empty file, and its `vitest-axe/matchers` root re-export is typed as `export type *`, making the real runtime export type-only as far as `tsc` is concerned. Neither is a local configuration mistake — both were confirmed by direct inspection of the installed package. Worked around by importing the matcher from `vitest-axe/dist/matchers` directly, registering it via `expect.extend()` in `vitest.setup.ts`, and supplying the missing Vitest `Assertion` type augmentation by hand in `src/vitest-axe.d.ts`.
- **A real dependency-ordering issue in the original plan's own commit sequencing** was found before it caused a broken intermediate commit: `lib/json-ld.ts`, `lib/case-study-merge.ts`, and `lib/home-selection.ts` were assigned to an earlier commit than `content/case-studies/` and `content/services.ts`, which they import types from. Since even a type-only import must resolve at compile time, that boundary would not have built in isolation. The actual commit sequence on this branch groups these files by their real dependency order instead — recorded in `P01_ARCHITECTURE.md`'s "Known deviation" section, not silently reordered without comment.
- **A content-truth error inherited from the planning pass**, caught during implementation: the draft case study for Yango Wing Fleet claimed "a genuinely distinct public repository," sourced from stale hardcoded data in the legacy frontend's own fallback object. A direct re-check against the live API showed its `github_url` is the same generic profile link as every other project. Corrected before this report was written — see `P01_ARCHITECTURE.md` for the full account.

## Known limitations, stated honestly rather than implied away

- **Manual color-contrast and focus-order verification in a real browser has not been performed.** jsdom (what `vitest-axe` runs against) has no layout engine and cannot evaluate either — the automated a11y test catches structural issues only (missing labels/roles, invalid ARIA, heading order). This is item 1 of the owner-review checklist above, not yet checked off.
- **Full visual QA at the specified breakpoints has not been performed**, for the two compounding reasons detailed in "Visual QA: owner-review required" above (no browser automation tool, no reachable/relevant live preview) — not for lack of trying to find a workaround. A structured checklist and exact local-review steps are provided there instead of a false pass.
- **The Windows-specific local build crash (native access violation, exit `3221226505`) reported in the previous version of this document is now resolved as "environment-specific, not a code defect."** A genuine Linux build (Docker, `node:22.22.2-bookworm`) with the real, configured API base URL succeeded cleanly, and the resulting server was started and exercised live with zero errors across 29 real URLs — see "P01-FIX: Linux production build" above.
- **INP (Interaction to Next Paint)** cannot be measured locally at all in this environment and is given no number in this report, consistent with the plan's own honesty rule about lab-vs-RUM metrics.
- **The résumé PDF indexability decision (owner judgment call #11), the Yango screenshot brand-permission question (owner judgment call #5), and the privacy-retention-period statement (owner judgment call #13)** are all recorded as still-open or intentionally-conservative in `P01_BRAND_DIRECTION.md` and `content/privacy.ts` respectively, not silently resolved.

## Definition of done — status

| Item | Status |
|---|---|
| `frontend/` untouched, still live in production | ✅ verified — no file under `frontend/` was modified |
| No Vercel config change, no deploy | ✅ — none made; `web/` has no `vercel.json` and was never wired into any Vercel project |
| Backend change is the one documented additive fix only | ✅ — `backend/config/settings/base.py`, `manage.py check`/`makemigrations --check` clean, existing test suite unaffected |
| No gallery/`ProjectImage`/migration work | ✅ — grep-verified |
| CI runtime matches the actual dependency tree; Web CI job passes on the exact head SHA | ✅ **as of the P01-FIX corrective commit** — see "P01-FIX: CI runtime alignment"; verify the exact head SHA's Actions run before treating this as durable |
| Typecheck / lint / tests / build all clean, under the correct Node version | ✅ — verified under an actual Node 22.22.2 binary, not just locally-installed Node 24 |
| Route smoke test, both configured and unconfigured API | ✅ **both verified** — see "P01-FIX: Linux production build" |
| Broken-link check clean, both configured and unconfigured API | ✅ — 16 URLs (unconfigured) / 29 URLs (configured, live data) |
| Security headers verified, both configured and unconfigured API | ✅ — CSP's `connect-src`/`img-src` confirmed to correctly widen only when an API origin is actually configured |
| Forbidden-term greps clean | ✅ |
| Reject-if visual checklist reviewed in a real browser at all six breakpoints | ❌ **not performed — explicit blocker.** No browser automation available; no accessible or relevant live preview exists (see above). Owner-review checklist provided instead |
| Manual contrast/focus-order pass | ❌ **not performed — explicit blocker**, same reason |
| Draft PR opened against `main`, not merged, not marked ready for review | ✅ — see the PR itself |

**This PR is not ready to merge.** The two unchecked items above are not process formalities — they are the addendum's own stated acceptance bar ("if the result is technically correct but visually generic, this phase is not complete"), and nothing in this corrective pass could verify or refute that bar from this environment. It requires the repository owner, in a real browser, working through the checklist above.

## Stop conditions honored

No merge was performed. PR #11 was not marked ready for review. Gallery Stage 2 was not started. P02 was not started. `frontend/` was not modified. No DNS, domain, or Vercel production configuration was changed. The original dirty workspace (`D:/Django Projects/shahriyarkhan-portfolio`, branch `main`) was never touched during this engagement.
