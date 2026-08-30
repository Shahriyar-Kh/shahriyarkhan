# P01A.4 — Change Boundary Matrix

**Date:** 2026-08-30
**Comparisons:** merge base (`2d654dd`) → `origin/main` (`94341e2`); merge base → `fix/p01a-stabilization-clean` (`086c673`); planned integration onto `fix/p01a-stabilization-integrated`.

This document is produced before any integration edit, per the task's Step 3.

---

## 1. Headline finding: zero backend overlap

`git diff --name-only 2d654dd..origin/main` touches **23 files, all under `frontend/`**. Every backend file P01A modified or added (`backend/config/settings/*.py`, `backend/config/urls.py`, `backend/apps/resume_builder/api/views.py`, `backend/apps/core/management/commands/seed_*.py`, and all four new `tests.py` files) is **completely untouched by origin/main's new commits**. These port with zero conflict.

`frontend/src/App.tsx` and `frontend/package.json` are also **unchanged** on `origin/main` — the P01A commits touching them port with zero conflict too.

## 2. Gallery backend completeness audit (Step 5.1 result)

**Verified: `origin/main` has no backend `ProjectImage` support at all.**

```
$ grep -rn "ProjectImage" backend/apps/portfolio/   →  no matches
$ ls backend/apps/portfolio/migrations/             →  0001_initial.py, __init__.py only
```

No model, no migration beyond `0001_initial`, no serializer, no admin registration, no API view, no `admin_urls.py` route. This confirms the task's own observation. Per Step 5.1's explicit instruction, this branch will **not** import the old uncommitted gallery backend implementation (from the original dirty workspace) to paper over this gap.

**Frontend gallery reachability, verified by grep:**

- `frontend/src/components/ProjectImageGallery.tsx` — **not imported anywhere** (`grep -rl "ProjectImageGallery" frontend/src --include=*.tsx --include=*.ts`, excluding its own file, returns nothing).
- `frontend/src/components/AdminProjectForm.tsx` — **not imported anywhere**, and no admin route exists in `App.tsx`/`routeMatch.ts` at all.
- The actually-live gallery on `/projects/:slug` is a **different, self-contained function**, `ProjectGallery` (singular, no "Image"), defined inline in `projects.$slug.tsx`. It already guards correctly: `if (!images.length) return null;` placed **after** its one `useEffect`, and its data source (`buildGallery()`) already degrades gracefully — it reads `project.images` only if present (`if (project.images && Array.isArray(...))`), then falls back to `detail_images`/`featured_image`/`preview_image`. **Public project pages are already stable when `images` is absent** (which it always will be, since the backend never sends this field) — no fix needed here.

**Conclusion:** the only real defects are inside the two **orphaned, unreachable** files. Classification and action:

| File | Reachable from any route? | Defect | Action |
|---|---|---|---|
| `ProjectImageGallery.tsx` | No | React hook-order violation (conditional `return` before two `useEffect` calls); `useRef<NodeJS.Timeout>` (Node type in a browser component) | **Fix in place** (explicitly required by Step 5.1), even though unreachable today — this is dead code a later phase is expected to wire in, and the task explicitly names these exact fixes |
| `AdminProjectForm.tsx` | No (no admin route exists anywhere in the app) | Its gallery-upload path POSTs to `/api/v1/admin/portfolio/project-images/`, which does not exist on this backend | **Not modified.** Since it is not rendered by any reachable route, there is no live UI control calling a nonexistent endpoint today. Documented here and in `P01A4_CONTENT_AND_MEDIA_AUDIT.md` as gallery-completion work for a later phase, per Step 5.1's explicit instruction — building out a real admin upload flow against a currently-nonexistent backend is out of this reconciliation's scope |

## 3. `.env` correction (Step 5.2 result)

`origin/main` has a **tracked** `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:8000
```
Not covered by `.gitignore` (only `backend/.env` is listed). `frontend/src/lib/api.ts` already falls back safely to `""` (same-origin-relative) when `VITE_API_BASE_URL` is unset — this is the existing safe fallback the task refers to. Plan: untrack `frontend/.env`, add `frontend/` env patterns to `.gitignore`, add `frontend/.env.example` with a placeholder value and a comment, verified with a focused test.

## 4. File-by-file matrix

| File | Classification | Notes |
|---|---|---|
| `backend/config/settings/base.py` | Port from P01A | Zero overlap with origin/main; applies cleanly |
| `backend/config/settings/production.py` | Port from P01A | Zero overlap; applies cleanly |
| `backend/config/urls.py` | Port from P01A | Zero overlap; applies cleanly |
| `backend/apps/resume_builder/api/views.py` | Port from P01A | Zero overlap; applies cleanly |
| `backend/apps/core/management/commands/seed_insightboard_project.py` | Port from P01A | Zero overlap; applies cleanly |
| `backend/apps/core/management/commands/seed_portfolio_data.py` | Port from P01A | Zero overlap; applies cleanly |
| `backend/apps/{core,portfolio,resume_builder,site_config}/tests.py` | Port from P01A | New files; zero overlap |
| `frontend/src/App.tsx` | Port from P01A | Zero overlap; applies cleanly |
| `frontend/package.json` / `package-lock.json` | Port from P01A | Zero overlap on `package.json`; lockfile needs a fresh `npm install` pass after `.env`/vitest reconciliation to confirm reproducibility |
| `frontend/index.html` | Port from P01A | No competing edit found on origin/main to this file's canonical/OG/JSON-LD block |
| `frontend/public/robots.txt`, `frontend/public/sitemap.xml` | Port from P01A | New on both sides' respective histories; origin/main has neither — pure add |
| `frontend/vercel.json` (new) + root `vercel.json` (delete) | Port from P01A | origin/main still has the broken root-only `vercel.json` (confirmed: no `frontend/vercel.json` exists there) — the routing bug is **still live** on `origin/main` today; this fix is still required |
| `frontend/vitest.config.ts`, `frontend/src/lib/*.test.ts`, `frontend/src/metadata.test.ts`, `frontend/src/routes/contentVisibility.test.ts` | Port from P01A | New files; zero overlap |
| `frontend/src/lib/site.ts`, `frontend/src/lib/apiEndpoints.ts`, `frontend/src/lib/routeMatch.ts` | Port from P01A | New files; zero overlap |
| `.github/workflows/ci.yml` | Port from P01A | Does not exist on origin/main; pure add (trigger updated per Step 6) |
| `frontend/src/routes/skills.tsx` | Manually combine | origin/main removed the "backend empty" banner (unrelated); P01A's type-only fix applies cleanly on top — no textual overlap between the two changes |
| `frontend/src/lib/seo.ts` | Manually combine | origin/main **committed** the full schema-markup/Twitter-card/robots-meta feature (previously only an uncommitted draft) using `window.location.href` for canonical/`og:url`. Integration: **preserve** the schema-markup infrastructure (real, wired-in, legitimate SEO work) but **replace both `window.location.href` call sites** with `canonicalUrl(window.location.pathname)` from the new `site.ts` — satisfies "canonical URLs must come from centralized site configuration," "do not use `window.location.origin`" |
| `frontend/src/routes/index.tsx` | Manually combine | origin/main's version is a superset rewrite (schema markup, animation polish) but is **completely unaware of any P01A fix**: `Real Roles` stat is still 4, CognoRise is still in the public `experienceItems` array, and the broken singular `/portfolio/experience/` endpoint is still called. All P01A hunks (hide CognoRise into `hiddenExperienceItemsPendingVerification`, stat fix, `EXPERIENCES_ENDPOINT` usage, `export` on `stats`/`experienceItems`/`fallbackProjects`) must be re-applied on top of origin/main's current file. Its own `addSchemaMarkup(...)` call's `url: window.location.origin` must also be switched to `SITE_URL` per Step 5.4 |
| `frontend/src/routes/projects.$slug.tsx` | Manually combine | origin/main added the Yango entry, the `images` API field, and a `CreativeWork` JSON-LD block using `canonicalUrl: window.location.href` (both the `applySeo` field and the schema `url`). Reapply the P01A `canonicalUrl()` swap at both sites; keep `export` on `projectFallbacks` |
| `frontend/src/routes/projects.tsx` | Manually combine | origin/main added the Yango list entry; P01A's only change here was `export const projects` — reapply the `export` keyword on origin/main's updated array |
| `frontend/src/components/ProjectImageGallery.tsx` | Manually combine (bug fix only) | See §2 — hook-order + timer-type fix, no content change |
| `frontend/src/components/AdminProjectForm.tsx` | Exclude as incomplete | See §2 — not modified; documented for a later phase |
| Backend `ProjectImage` model/migration/serializer/admin/views (from the original dirty workspace) | Exclude as incomplete | Never existed on origin/main; not ported — would resurrect exactly the incomplete backend the frontend already safely tolerates the absence of |
| `frontend/src/styles.css` (new) | Preserve from latest main | Real, wired-in Tailwind entry point (`main.tsx` imports it); needed for the site to render at all |
| `frontend/src/styles-premium-enhancements.css` | Preserve from latest main | Unlike in P01A.1-3 (where this was uncommitted, optional, out-of-scope experimental work), it is now `@import`-ed by the committed `styles.css` and is load-bearing for the live design. Excluding it would break the current visual design. Preserved as-is; not audited line-by-line (a full visual-design review is out of this reconciliation's scope) |
| `frontend/public/images/yangowing_images/*.png` (7 files) | Preserve from latest main, pending §5 audit | See `P01A4_CONTENT_AND_MEDIA_AUDIT.md` for the screenshot content/permission review |
| `frontend/.env` (tracked) | Exclude as unverified / correct | See §3 — untrack, gitignore, replace with `.env.example` |
| `.gitignore` | Manually combine | Add `frontend/.env`, `frontend/.env.*.local` patterns without disturbing existing entries |
| `frontend/src/routes/about.tsx`, `resume.tsx` | Preserve from latest main | Cosmetic removal of a dev-facing "backend empty" banner; no overlap with any P01A change; not touched further |
| Root `PROJECT_DOCUMENTATION.md` and other root docs | Exclude as unrelated | Unchanged by origin/main's new commits; per P00's own finding this describes a stale, never-real TanStack Start architecture — not restored or referenced anywhere in this integration's new documentation |
| `docs/rebuild/*` (all P00/P01A docs) | Documentation-only | Does not exist on origin/main at all; ported in full, matching the existing `fix/p01a-stabilization-clean` set, plus this phase's five new `P01A4_*.md` files |

## 5. Not part of this integration

Per Step 4's explicit instruction and per the "do not rewrite the entire portfolio" scope limit: no other frontend route, no hero copy, no service catalog, no unrelated stat, and no pre-existing project claim (NoteAssist/SK-LearnTrack/FeelWise) already present before this whole audit began (verified via `git show 2d654dd:frontend/src/routes/projects.$slug.tsx` — their unverified claims, including the literal "over 60%" NoteAssist figure, predate P00 itself) is rewritten as part of this phase's code changes. They are flagged, not silently carried forward uncritically, in `P01A4_CONTENT_AND_MEDIA_AUDIT.md` for an explicit owner decision, consistent with how CognoRise/InsightBoard were handled (flag and hide/document, don't unilaterally rewrite).
