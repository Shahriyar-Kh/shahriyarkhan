# P01A — Current Production Incident Stabilization Report

**Date:** 2026-08-27
**Scope:** Narrow stabilization of the existing Vite/React + Django/DRF application. No Next.js migration, redesign, CRM, or admin operating system work was started.
**Base commit:** `2d654dd85e60ca5bda9fb39bd8a097ccbe4809ce` on `main` (unchanged — no commits were made this phase).

---

## 1. Executive summary

This phase investigated and fixed the eight primary incidents P00 identified, verifying each one against the actual repository rather than assuming P00's description was complete. Two incidents had verifiable, fixable root causes found entirely from repository structure and code (no production log/credential access needed): the Vercel 404s were caused by `vercel.json` living at the monorepo root instead of inside the actual Vercel project root (`frontend/`), and the résumé endpoints' 500s came from two DRF views that crashed when serializing a "not found" result instead of returning 404. A third class of failure (every database-backed Django endpoint returning 500) is **consistent with, but not provably caused by,** a missing/misconfigured database connection in the live Render environment — this phase could not access Render's dashboard, environment variables, or logs, so it added a fail-fast startup check (Django now refuses to boot in production without `DATABASE_URL` or `POSTGRES_HOST`, rather than booting "successfully" and then 500ing on every request) and is honest that this cannot be confirmed fixed without an actual deploy.

The canonical-domain incident is fixed: every public metadata reference to the non-resolving `shahriyarkhan.dev` was replaced with the approved temporary canonical, `https://shahriyarkhan.vercel.app`, centralized behind one module (`frontend/src/lib/site.ts`) instead of being scattered. The two disputed-content items (CognoRise InfoTech, InsightBoard CRM) are hidden non-destructively: CognoRise (which has no backend record at all) was moved out of the rendered array into a separate, clearly-labeled, still-present constant; InsightBoard CRM (which does have a backend `Project` record) is now seeded with `status=draft`, which the existing publication mechanism already excludes from every public endpoint and the sitemap, while remaining fully visible and editable in the Django admin. Neither record was deleted.

31 new backend tests and 18 new frontend tests were written and all pass locally, along with Django's system check and migration-consistency check, and the frontend's production build. **Nothing was deployed.** The live-incident status recorded in P00 (2026-08-27) has not been re-checked against production this phase, because doing so would require deploying these fixes first — re-running the same read-only HTTP checks against the *unfixed* live deployment would only reproduce P00's findings, not validate anything new.

## 2. Pre-existing dirty working-tree files

Recorded via `git status --short`/`git diff --name-only` **before** any edit this phase, matching exactly what P00 recorded (confirming no drift between P00 and P01A):

**Modified (10):** `backend/apps/portfolio/admin.py`, `backend/apps/portfolio/api/admin_urls.py`, `backend/apps/portfolio/api/serializers.py`, `backend/apps/portfolio/api/views.py`, `backend/apps/portfolio/models.py`, `frontend/src/components/AdminProjectForm.tsx`, `frontend/src/lib/seo.ts`, `frontend/src/routes/index.tsx`, `frontend/src/routes/projects.$slug.tsx`, `frontend/src/styles-premium-enhancements.css`.

**Untracked (9):** `00_START_HERE.md`, `BATCH_1_COMPLETION_REPORT.md`, `BATCH_1_IMPLEMENTATION_SUMMARY.md`, `IMPLEMENTATION_CODE_GUIDE.md`, `PREMIUM_UI_ENHANCEMENT_PLAN.md`, `VISUAL_QA_CHECKLIST.md`, `backend/apps/portfolio/migrations/0002_project_feature_bullets_project_short_description_and_more.py`, `frontend/src/components/ProjectImageGallery.tsx`, `testing.py`.

Where a required fix touched an already-modified file (`portfolio/admin.py`, `admin_urls.py`, `serializers.py`, `views.py`, `models.py`, `index.tsx`, `projects.$slug.tsx`, `seo.ts`), the existing diff was inspected first (`git diff -- <file>`) and the new edit was made as a small, additive change alongside it — none of the pre-existing uncommitted work (the in-progress project-image-gallery feature) was reverted, reordered, or rewritten. `AdminProjectForm.tsx` and `styles-premium-enhancements.css` were not touched at all this phase.

## 3. Incident root-cause matrix

| # | Incident (from P00) | Verified against repo? | Root cause | Fixable from repo alone? | Fix applied |
|---|---|---|---|---|---|
| 1 | Database-backed Django endpoints return HTTP 500 | Yes — re-read every view in the failing set | **Two confirmed code bugs** (below) plus a pattern **consistent with** missing/invalid production DB configuration (cannot be proven without Render access) | Partially | Fail-fast settings check (§4); two crash-on-empty bugs fixed (§4) |
| 1a | `/api/v1/public/resume/default/` 500s | Yes | `PublicDefaultResumeView.get_object()` returned `None` when no default résumé exists; DRF then tried to serialize `None` and crashed | Yes, fully | Raises `Http404` instead — now a clean 404, test-covered |
| 1b | (latent, not in P00's live-checked list, found during this audit) résumé download-tracking crashes on an unknown slug | Yes | `ResumeVersion.objects.get(slug=slug)` raised an uncaught `DoesNotExist` | Yes, fully | Wrapped in try/except, raises `Http404`, test-covered |
| 1c | Remaining 500s (projects/services/skills/site-settings/sitemap) | Yes, code re-read; empty-database case does **not** crash any of these views | Consistent with DB connectivity/migration failure in the live Render environment | **No** — requires Render dashboard/env/log access this phase does not have | Added a fail-fast production-settings check so a missing DB config fails loudly at boot instead of silently 500ing per request (§4); cannot confirm this was the actual live cause |
| 2 | Frontend returns 404 on direct requests to routes other than `/` | Yes — confirmed `vercel.json` was at the monorepo root while `frontend/` (the only directory with a `package.json`) is the actual Vercel project root | Vercel only reads `vercel.json` from inside the configured project root; a root-level file outside that root is silently ignored | Yes, fully, from repo structure alone | Relocated `vercel.json` to `frontend/vercel.json`; removed the stale root copy (§5) |
| 3 | Canonical/structured metadata reference `shahriyarkhan.dev` | Yes — grepped the whole repo | Three hardcoded references in `frontend/index.html` (canonical link, `og:url`, JSON-LD `url`); `seo.ts`/route components used `window.location.href`/`.origin` as a secondary, less predictable fallback | Yes, fully | All replaced with the approved temporary canonical, centralized in `frontend/src/lib/site.ts` (§6) |
| 4 | Production depends on separate Vercel + Render deployments | Confirmed as architecture, not a bug | This is the current deployment topology, not a defect | N/A | Not "fixed" — documented in §11/§12 as a standing fact this phase must plan around |
| 5 | No automated test/CI safety net | Confirmed — zero test files existed anywhere in the repo | Never built | Yes | 31 backend tests + 18 frontend tests added this phase (§8); still no CI workflow (out of scope — P01A did not add CI infrastructure, only tests) |
| 6 | Frontend calls `/portfolio/experience/`, backend registers `/experiences/` | Yes — confirmed exact mismatch at `index.tsx` (was line ~718) vs `apps/portfolio/api/urls.py` | Typo/drift between frontend and backend | Yes, fully | Frontend now imports a named constant (`EXPERIENCES_ENDPOINT`) pointing at the correct path (§7) |
| 7 | InsightBoard CRM has stock imagery and a dead demo URL | Yes — re-confirmed `insightboard-crm.vercel.app` still returns 404 was not re-checked live this phase (no state-changing/live re-check needed to fix this — it's a content-visibility decision, not a network fact that changes) | Seed scripts published it (`status=published, featured=True`) despite unverified imagery/demo status | Yes | Both seed scripts now create/update it as `status=draft, featured=False` (§9) |
| 8 | CognoRise InfoTech has conflicting employment-history evidence | Yes — re-confirmed it exists only in `index.tsx`'s hardcoded array, absent from `resume.tsx` and both seed scripts | A frontend-only content entry with no backend record to gate | Yes | Moved out of the rendered array into a separate, non-deleted, clearly-labeled constant (§9) |

## 4. Backend fixes

**File: `backend/config/settings/production.py`** — added a fail-fast check: if neither `DATABASE_URL` nor `POSTGRES_HOST` is set (and `USE_SQLITE` isn't explicitly enabled), Django now raises `ImproperlyConfigured` at boot instead of silently falling back to `base.py`'s `localhost`/`postgres` defaults, which cannot work on a deployed server. This turns an indefinite stream of per-request 500s into one clear, loggable startup failure. **Limitation, stated plainly:** this only catches the variable being entirely *absent*. It cannot detect a *present but wrong* `DATABASE_URL` (e.g., an expired credential or a paused database), which is the other plausible explanation for the live 500s and can only be confirmed with Render dashboard/log access.

**File: `backend/config/settings/base.py`** — added `PUBLIC_SITE_URL` (default `https://shahriyarkhan.vercel.app`), distinct from the pre-existing `PUBLIC_BASE_URL` (this backend's own origin). The two were previously conflated: `sitemap_xml()`/`robots_txt()` built public-page URLs using `PUBLIC_BASE_URL`, which — per `DEPLOYMENT_ENV.md` — is the *backend's* own domain, not the domain the public content pages actually live on.

**File: `backend/config/urls.py`** — `sitemap_xml()` and `robots_txt()` now use `PUBLIC_SITE_URL` for their public-facing URLs/pointer, so the sitemap correctly lists pages under the frontend's canonical origin instead of the API's own domain.

**File: `backend/apps/resume_builder/api/views.py`** — two real bugs fixed (see incident matrix rows 1a/1b): `PublicDefaultResumeView.get_object()` now raises `Http404` instead of returning `None`; `PublicResumeDownloadTrackView.post()` now catches `ResumeVersion.DoesNotExist` and raises `Http404` instead of letting it propagate as a 500.

**Files: `backend/apps/core/management/commands/seed_portfolio_data.py`, `seed_insightboard_project.py`** — (a) InsightBoard CRM hiding (§9); (b) remote image downloads are now wrapped in try/except with a 10-second timeout, so a transient Unsplash network failure no longer fails the entire seed command (and, on Render, the entire deploy build — `seed_insightboard_project` runs unconditionally in `render.yaml`'s `buildCommand`).

**Not changed:** `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `DEBUG` handling — these were already correctly restrictive (no wildcards, no hardcoded credentials, `DEBUG` already defaults to `False` and is explicitly forced `False` in `production.py`) and needed no change to satisfy the "do not weaken security" requirement.

## 5. Frontend routing fixes

**Root cause, fully verified from repository structure:** `vercel.json` lived at the monorepo root (`/vercel.json`), declaring `buildCommand: "npm run build"` and `outputDirectory: "dist"` — paths that only make sense relative to `frontend/`, the only directory with a `package.json`. Since the site demonstrably builds and serves content, the Vercel project's dashboard-configured **Root Directory must already be `frontend`** — and per Vercel's documented monorepo behavior, when a Root Directory is configured, Vercel only reads `vercel.json` from *inside* that root, never from the outer monorepo root. The committed rewrite rule (`"/(.*)" -> "/index.html"`) was therefore never being read at all, which is exactly consistent with the observed behavior: `/` (a real static file) returned 200, while every other path returned Vercel's own `404 NOT_FOUND` (confirmed via the `X-Vercel-Error: NOT_FOUND` response header in P00) instead of falling through to the SPA.

**Fix:** created `frontend/vercel.json` with identical `rewrites`/`buildCommand`/`outputDirectory` content, and removed the stale `/vercel.json`. No rewrite-rule logic changed — static assets still resolve as real files before the catch-all rewrite applies (Vercel's documented filesystem-before-rewrites precedence), and there is no same-origin `/api/*` path on the Vercel deployment to accidentally rewrite (the frontend calls the separate Render API by absolute URL via `VITE_API_BASE_URL`), so no special API exclusion rule was needed.

**Fixed the broken experience endpoint:** added `frontend/src/lib/apiEndpoints.ts` exporting `EXPERIENCES_ENDPOINT = "/api/v1/public/portfolio/experiences/"`, and updated `index.tsx` to import and use it instead of the inline, misspelled singular path.

**Extracted, did not duplicate, the router:** `frontend/src/lib/routeMatch.ts` now holds the pure pathname → route mapping that used to be inline in `App.tsx`'s `if`/`else` chain; `App.tsx` calls `matchRoute(pathname)` and switches on the result. This is the same single router (still built on the existing `RouterProvider`/`window.history` in `frontend/src/lib/navigation.tsx`), refactored only so the matching logic is unit-testable without rendering React — no second router was introduced.

**Not changed:** the `NotFoundPage` component (already the intentional 404 experience), `frontend/public/_redirects` (a likely-vestigial Netlify file, unrelated to Vercel, left alone per "do not rewrite unrelated files" — see `OPEN_DECISIONS.md` item #30).

## 6. Canonical/SEO fixes

Created `frontend/src/lib/site.ts`, the single source of truth for the public origin:

```ts
export const SITE_URL = "https://shahriyarkhan.vercel.app";
export function canonicalUrl(pathname: string): string { /* ... */ }
```

Applied everywhere a canonical/OG/JSON-LD URL was previously hardcoded to `shahriyarkhan.dev` or derived from `window.location`:

- `frontend/index.html` — canonical `<link>`, `og:url`, and the static `Person` JSON-LD `url` field.
- `frontend/src/lib/seo.ts` — `applySeo()`'s canonical-link and `og:url` defaults now call `canonicalUrl(window.location.pathname)` instead of `window.location.href` (which could reflect a preview/non-canonical host).
- `frontend/src/routes/index.tsx` — the client-generated `Person` JSON-LD now uses `SITE_URL` instead of `window.location.origin`.
- `frontend/src/routes/projects.$slug.tsx` — both the per-project canonical URL and the `CreativeWork` JSON-LD `url` now use `canonicalUrl(window.location.pathname)` instead of `window.location.href`.
- `backend/config/urls.py`'s `sitemap_xml()`/`robots_txt()` — now use the new `PUBLIC_SITE_URL` setting (§4).

**Sitemap/robots for the actual canonical origin:** P00 found that the *only* robots.txt/sitemap.xml in the system were served by the Django backend, at its own separate domain — meaning the actual public site (the Vercel frontend) served neither (confirmed 404 live). Since this is a static Vite SPA with no server-side rendering, the fix is two static files: `frontend/public/robots.txt` (pointing at the canonical sitemap) and `frontend/public/sitemap.xml` (hand-curated, listing only the 7 static routes plus the 4 verified project detail pages — explicitly **excluding** InsightBoard CRM). Both are confirmed present in the production build output (`dist/robots.txt`, `dist/sitemap.xml`). This is a stopgap: it will not automatically reflect future content changes, which is an explicit, documented limitation for a later phase, not a hidden gap.

**Structured data:** re-reviewed against the "no fake Organization/team/testimonial/review/business-location claims" requirement — none existed before this phase and none were added; the one `Organization` reference (`worksFor: HA Technologies (Private) Limited`) is the current, non-disputed role and was left as-is.

**Not done:** no meta-keyword tags or speculative SEO/GEO hacks were added, per instruction.

## 7. Content visibility decisions

**CognoRise InfoTech** — has no backend record at all (confirmed absent from the `Experience` model, `resume.tsx`'s fallback, and both seed scripts; only ever existed as one object in `index.tsx`'s hardcoded `experienceItems` array). There is nothing to "publish/unpublish" in the database for it. It was moved, verbatim, into a new, separately-named, exported constant — `hiddenExperienceItemsPendingVerification` — with a code comment explaining exactly why and linking to the open decision. `experienceItems` (the array actually rendered) no longer includes it. **No migration was introduced** — none was needed, since this was never database content.

A direct consequence of removing it from the rendered array: the home page's hardcoded "Real Roles" stat (`index.tsx`) said "4," which would have become inconsistent with the now-visibly-3-entry timeline. This was fixed to "3" in the same edit (not left as a newly-introduced inconsistency), with a regression test asserting the stat always equals the rendered list's length.

**InsightBoard CRM** — does have a real `Project` row (via `seed_portfolio_data.py` and the standalone `seed_insightboard_project.py`, both using `update_or_create` against the same slug). `Project` already has an existing, working publication mechanism: `status` (`draft`/`published`), which every public queryset in the codebase already filters on (`PublicProjectListView`, `PublicProjectDetailView`, and now `sitemap_xml()`). Both seed scripts were changed to create/update this project with `status=Project.Status.DRAFT` and `featured=False`, with a code comment explaining why and pointing at the open decision. The `AdminProjectViewSet` (Django admin API) uses an unfiltered `Project.objects.all()` queryset, so the record remains fully visible and editable there. **No migration was introduced** — the existing `status` field already provided everything needed. Verified locally end-to-end (not just by reading code): ran both seed commands against a real, throwaway local SQLite database, then hit the actual Django views with a test client — the record was absent from the public list, its detail endpoint returned 404, and it was absent from the generated sitemap (§10).

Neither disputed record's underlying data (frontend object literal, or database row and its seed-script source) was deleted.

## 8. Tests added

**Backend (31 tests, Django's built-in `TestCase`/DRF's `APITestCase` — no new test framework, since Django's own tooling was sufficient):**

- `backend/apps/portfolio/tests.py` (16 tests) — public projects/services/skills/experiences/education endpoints return 200 with empty results on an empty database; unknown project slug returns 404 not 500; the plural `/experiences/` path is registered and resolves, the singular `/experience/` path is confirmed *not* registered; InsightBoard-style draft projects are excluded from the public list and detail endpoint while remaining in `Project.objects.all()` (proving non-destructive hiding); a draft `Experience` record is excluded from the public experience list (proving the same mechanism would work if a disputed experience record is ever added to the backend); a catch-all test asserting ten representative public GET endpoints never return a 5xx status.
- `backend/apps/site_config/tests.py` (3 tests) — `/api/v1/public/site/settings/` returns 200 both before and after a `SiteSetting` row exists; `get_solo()` always returns the same singleton.
- `backend/apps/resume_builder/tests.py` (6 tests) — the default-résumé 500 fix (404 when no default exists, when a résumé exists but isn't marked default, and when a marked-default résumé is unpublished; 200 when a real published default exists) and the download-tracking 500 fix (404 for an unknown slug, 200 + event recorded for a known one).
- `backend/apps/core/tests.py` (6 tests) — `/healthz` 200; `/robots.txt` 200 and points at the canonical sitemap without referencing `shahriyarkhan.dev`; `/sitemap.xml` 200 on an empty database, uses the canonical site URL, and excludes draft project/service records; a subprocess-based test proving `config.settings.production` now refuses to boot when database configuration is entirely missing, and boots normally when `DATABASE_URL` is present.

**Frontend (18 tests, Vitest — the only new dependency added; run in Vitest's default Node environment, no jsdom/testing-library, since every test here is a pure-function/data-shape check):**

- `frontend/src/lib/routeMatch.test.ts` (5 tests) — every one of the 7 static SPA routes resolves correctly; a project-detail slug is matched and decoded; an unknown path resolves to the intentional not-found route; direct-entry resolution is proven identical to in-app navigation resolution (since both go through the same pure function).
- `frontend/src/lib/site.test.ts` (4 tests) — `SITE_URL` is the approved temporary canonical and never `shahriyarkhan.dev`; `canonicalUrl()` builds correct absolute URLs for the root and nested paths.
- `frontend/src/lib/apiEndpoints.test.ts` (1 test) — the experiences endpoint constant is the correct plural path, not the old broken singular one.
- `frontend/src/metadata.test.ts` (2 tests) — `index.html` contains no reference to `shahriyarkhan.dev` and does contain the correct canonical/JSON-LD URLs.
- `frontend/src/routes/contentVisibility.test.ts` (6 tests) — CognoRise is absent from the rendered experience list but present (and non-empty) in the pending-verification constant; InsightBoard CRM is absent from all three frontend fallback data sources (home page, projects list, project-detail map); the "Real Roles" stat matches the rendered experience count.

## 9. Commands executed

All commands were run locally against a project-local Python 3.13 virtual environment (`backend/.venv/`, created this phase, gitignored) and the frontend's existing Node/npm toolchain. **No command was run against the live Render/Vercel deployments beyond the read-only HTTP checks already reported in P00** (this phase performed no new live checks — see §11).

Backend:
```
py -3.13 -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements/prod.txt
USE_SQLITE=1 .venv/Scripts/python.exe manage.py check
USE_SQLITE=1 .venv/Scripts/python.exe manage.py makemigrations --check --dry-run
USE_SQLITE=1 .venv/Scripts/python.exe manage.py test apps.portfolio apps.site_config apps.resume_builder apps.core -v 2
# one-off local verification (throwaway sqlite db, deleted after):
USE_SQLITE=1 .venv/Scripts/python.exe manage.py migrate --settings=config.settings.development
USE_SQLITE=1 .venv/Scripts/python.exe manage.py seed_portfolio_data --settings=config.settings.development
USE_SQLITE=1 .venv/Scripts/python.exe manage.py seed_insightboard_project --settings=config.settings.development
# production-settings validation with a realistic full env:
DJANGO_SECRET_KEY=... DJANGO_ALLOWED_HOSTS=... DATABASE_URL=... CORS_ALLOWED_ORIGINS=... CSRF_TRUSTED_ORIGINS=... \
  .venv/Scripts/python.exe manage.py check --settings=config.settings.production
  .venv/Scripts/python.exe manage.py collectstatic --noinput --dry-run --settings=config.settings.production
```

Frontend:
```
npm install                     # synced node_modules to the existing lockfile, no version changes
npm install --save-dev vitest   # the one new dependency added this phase
npx vitest run
npx tsc --noEmit
npm run lint
npm run build
```

## 10. Test and build results

All results below are from actual local execution, not predicted.

| Command | Result |
|---|---|
| `manage.py check` (dev settings, SQLite) | **Pass** — "System check identified no issues (0 silenced)." |
| `manage.py check --settings=config.settings.production` (realistic full env) | **Pass** |
| `manage.py makemigrations --check --dry-run` | **Pass** — "No changes detected" (confirms the uncommitted migration `0002_...` is fully consistent with current models) |
| `manage.py collectstatic --dry-run` (production settings) | **Pass** — 154 static files would be collected, no errors |
| Backend test suite (31 tests) | **All 31 pass** |
| End-to-end manual verification (real seeded SQLite DB, real Django test client) | InsightBoard CRM: absent from public list, 404 on detail, absent from sitemap; sitemap uses `shahriyarkhan.vercel.app`; robots.txt correctly points at it and contains no `shahriyarkhan.dev` reference — **all confirmed** |
| Frontend test suite (18 tests, `npx vitest run`) | **All 18 pass** |
| `npx tsc --noEmit` | **2 pre-existing errors**, unrelated to this phase: `src/routes/skills.tsx:226` ("Property 'order' does not exist..."). Confirmed via `git diff`/`git log` that this file has zero uncommitted changes and the error exists in the last committed revision — it predates P01A and was left untouched per "do not rewrite unrelated files." |
| `npm run lint` | **2 pre-existing errors** in `frontend/src/components/ProjectImageGallery.tsx` (conditional `useEffect` calls, a react-hooks rule violation) — this file is part of the uncommitted gallery feature this phase was explicitly told to preserve and not modify, so it was left as-is. Also **12 warnings**, of which **5 are newly introduced by this phase** (`react-refresh/only-export-components`, in `index.tsx` x3, `projects.tsx`, `projects.$slug.tsx`) as a direct, disclosed side effect of exporting previously-private fallback-data constants so tests could import them; the other 7 warnings are pre-existing and unrelated (`button.tsx`, `badge.tsx`, `form.tsx`, `navigation-menu.tsx`, `sidebar.tsx`, `toggle.tsx`, `navigation.tsx`). None of these are build-breaking; `npm run build` does not run lint. |
| `npm run build` | **Pass** — 1746 modules transformed, `dist/index.html`/`dist/robots.txt`/`dist/sitemap.xml` all confirmed present and correct in the output, zero references to `shahriyarkhan.dev` anywhere in the built output |

## 11. Vercel deployment requirements

Not deployed. For whoever performs the actual deployment:

- **Root Directory** must be `frontend` (this phase infers this is already the case, since the site currently builds and serves content despite there being no root-level `package.json` — but it could not be directly confirmed without dashboard access; verify before or during deploy).
- **Build Command**: `npm run build` (per `frontend/vercel.json`, now correctly placed inside the project root).
- **Output Directory**: `dist`.
- **Environment variable required**: `VITE_API_BASE_URL` (name only — set to the backend's public origin, e.g. `https://shahriyarkhan.onrender.com`, at deploy time).
- After deploying, confirm the SPA rewrite is actually honored: request a non-root path directly (e.g. `/about`) and confirm it returns 200 with SPA content, not Vercel's own 404 — this is the single most important post-deploy check for this phase's frontend fix (see §16).
- Confirm `/robots.txt` and `/sitemap.xml` are served from the Vercel origin (they are static files under `public/`, so this should work automatically once routing itself is fixed).

## 12. Render deployment requirements

Not deployed.

- **Build Command** (unchanged): `pip install --upgrade pip setuptools wheel && pip install -r backend/requirements/prod.txt && python backend/manage.py migrate --settings=config.settings.production && python backend/manage.py seed_insightboard_project --settings=config.settings.production && python backend/manage.py collectstatic --noinput --clear --settings=config.settings.production`. Note: `seed_insightboard_project` now seeds a **hidden/draft** record (§7) — it is safe to keep running automatically, but it still adds an external network dependency (Unsplash) to every build; the download failure path was hardened this phase (§4) so a transient failure there no longer fails the whole build.
- **Start Command** (unchanged): `gunicorn config.wsgi:application --chdir backend --bind 0.0.0.0:$PORT`.
- **Critical, newly-enforced requirement**: `DATABASE_URL` (or `POSTGRES_HOST` at minimum) **must** be set, or the service will now refuse to boot (§4) — this is intentional; a boot failure with a clear message is preferable to the previous silent per-request 500s, but it does mean whoever deploys this must confirm the database configuration is actually valid *before* deploying, or the service won't come up at all.
- **Migration strategy**: unchanged (`migrate` runs on every build); this phase's migration-consistency check (`makemigrations --check --dry-run`) confirms no new migration is needed for anything done this phase.
- **Static files**: unchanged (`collectstatic` + WhiteNoise), verified working under production settings this phase (§10).
- **Health check path**: `/healthz` (already exists, does not touch the database, confirmed 200 both live in P00 and locally this phase).

## 13. Environment-variable names required (no values)

No new environment variables are required beyond what P00 already documented in `P01_HANDOFF.md` §6. One new variable was added with a safe built-in default, so it is optional unless the temporary canonical domain needs to change:

- `PUBLIC_SITE_URL` *(new, optional — defaults to `https://shahriyarkhan.vercel.app` if unset)*

All other required variable names are unchanged from `docs/rebuild/P01_HANDOFF.md` §6 (`DATABASE_URL`, `POSTGRES_*`, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `VITE_API_BASE_URL`, etc.). No secret value was read, printed, or added anywhere this phase. A local `backend/.env` file was discovered to exist (gitignored, correctly untracked, confirmed absent from `git status`) — **its contents were never read or printed**; its presence was only relevant because it briefly interfered with one local test's environment isolation (fixed by having that specific test explicitly override the variables it needs to control, rather than by reading or relying on the file's contents — see the test's own comment in `backend/apps/core/tests.py`).

## 14. Remaining risks

1. **The actual live cause of the backend 500s is still unconfirmed.** The fail-fast check (§4) will catch a missing `DATABASE_URL`/`POSTGRES_HOST`, but if Render's actual configuration has a *present but invalid* value (wrong host, expired credential, paused database), this phase's fix will not resolve it — that requires Render dashboard/log access this phase does not have.
2. **The Vercel routing fix is unverified against the real deployment.** The root-cause diagnosis is strong (fully explained by repository structure) but has not been proven by an actual deploy; it is possible (though considered unlikely) that the Vercel project has some other override in play.
3. **Untracked artifacts from local verification were left in place, not deleted**, per the explicit "do not delete untracked files" rule for this phase:
   - `backend/media/projects/previews/` and `backend/media/projects/featured/` now contain 4 real Unsplash image files (2 preview, 2 featured — a naming-collision duplicate of each) downloaded while manually verifying the InsightBoard seed fix against a throwaway local database. These are genuine stock photos of the *disputed* project, sitting in the working tree. **Recommend deleting `backend/media/` locally** (it is not gitignored, unlike `backend/staticfiles/`) once reviewed — this phase did not delete it itself.
   - `backend/.venv/` (this phase's local Python virtual environment) and `backend/db.sqlite3`-adjacent throwaway test artifacts were cleaned up where created (the throwaway `db.sqlite3` was deleted after verification); `.venv/` is gitignored and can be kept or removed freely.
   - A pre-existing, empty `frontend/public/docs/rebuild/` directory was discovered during the build-output check (it appears in `dist/docs/rebuild/` as an empty folder). It contains no files and was not created by any action in this phase — it appears to be a stray artifact from an earlier `mkdir` in the P00 session that resolved against an unexpected working directory. It is harmless (empty, no content exposed) but is recommended for cleanup in a later phase.
4. **The "Real Roles" stat and other hardcoded counters are not derived from real data** (`index.tsx`'s `stats` array) — this phase fixed the one specific number that hiding CognoRise made inconsistent, but the broader pattern (hardcoded counts like "10+ Projects Built") remains exactly as flagged in P00's `CONTENT_TRUTH_INVENTORY.md` as unverified.
5. **No CI was added.** Tests now exist and pass locally, but nothing runs them automatically on push — this remains an open item (`OPEN_DECISIONS.md` #31).
6. **`skills.tsx`'s pre-existing TypeScript error and `ProjectImageGallery.tsx`'s pre-existing hook-rule violations remain unfixed**, deliberately, per the "preserve existing work" / "do not rewrite unrelated files" rules for this phase.
7. **The static frontend `sitemap.xml`/`robots.txt` are hand-maintained**, not generated — they will drift from reality as content changes until a later phase adds real generation.

## 15. Manual deployment checklist

1. Review this diff (`git diff --stat` in §20 below) and confirm intent to deploy.
2. Confirm/obtain Render dashboard access; set `DATABASE_URL` (or `POSTGRES_HOST`+friends) to a **known-valid** connection string before deploying — the service will not boot without it now.
3. Confirm/obtain Vercel dashboard access; confirm **Root Directory = `frontend`**.
4. Deploy backend (Render) first; confirm `/healthz` returns 200 and check Render's boot logs for the new `ImproperlyConfigured` message (if it appears, the database config is the confirmed cause — fix it and redeploy before proceeding).
5. Confirm `https://shahriyarkhan.onrender.com/api/v1/public/site/settings/` returns 200, not 500.
6. Confirm `https://shahriyarkhan.onrender.com/sitemap.xml` returns 200 and does not list InsightBoard CRM.
7. Deploy frontend (Vercel).
8. Run the post-deployment smoke tests in §16.
9. Only after all smoke tests pass, consider the P00 production incidents resolved — do not mark them resolved from a successful build alone.

## 16. Post-deployment smoke-test checklist

Read-only checks, safe to run against production once deployed:

- [ ] `GET https://shahriyarkhan.vercel.app/` → 200
- [ ] `GET https://shahriyarkhan.vercel.app/about` → 200 with SPA content (the core routing fix)
- [ ] `GET https://shahriyarkhan.vercel.app/projects/sk-learntrack-ai-learning-platform` → 200 with SPA content
- [ ] `GET https://shahriyarkhan.vercel.app/robots.txt` → 200, no `shahriyarkhan.dev` reference
- [ ] `GET https://shahriyarkhan.vercel.app/sitemap.xml` → 200, does not list InsightBoard CRM
- [ ] View source of `https://shahriyarkhan.vercel.app/` → canonical link and JSON-LD both reference `shahriyarkhan.vercel.app`, not `shahriyarkhan.dev`
- [ ] `GET https://shahriyarkhan.onrender.com/api/v1/public/site/settings/` → 200
- [ ] `GET https://shahriyarkhan.onrender.com/api/v1/public/portfolio/projects/` → 200, does not list InsightBoard CRM
- [ ] `GET https://shahriyarkhan.onrender.com/api/v1/public/portfolio/projects/insightboard-crm-sales-intelligence-dashboard/` → 404
- [ ] `GET https://shahriyarkhan.onrender.com/api/v1/public/resume/default/` → 200 (or a clean 404 if no default résumé is configured yet — either is now a valid response, neither should be a 500)
- [ ] `GET https://shahriyarkhan.onrender.com/sitemap.xml` → 200
- [ ] Submit the real Contact form once and confirm the notification email arrives (validates the email pipeline is unaffected by these changes)

## 17. Rollback instructions

No commit was made this phase, so there is nothing to revert in git history. If a deploy based on this working tree needs to be rolled back:

- **Vercel**: use the dashboard's "Instant Rollback" to the previously-deployed build, or redeploy the prior commit.
- **Render**: redeploy the prior successful build/commit via the dashboard, or trigger a manual deploy pinned to the previous commit SHA.
- **Working tree**: since nothing was committed, `git status --short`/`git diff` (below) show exactly what changed; discarding is a normal `git checkout -- <file>` per file if any individual change needs to be undone — this report deliberately did not perform that action itself, since undoing uncommitted work is the user's call, not an automatic step.
- **Local-only artifacts** (`backend/.venv/`, `backend/media/`, this phase's throwaway SQLite databases) are not part of any deploy and need no rollback — see §14 item 3 for cleanup recommendations.

## 18. P01 readiness decision

**Not yet ready for the full P01 platform-foundation phase.** This phase's own scope (P01A) is complete and its acceptance criteria are met locally, but per its own `P01_HANDOFF.md`-proposed scope and the explicit five launch blockers in `OPEN_DECISIONS.md`, the platform-foundation phase should not begin until:

1. These P01A fixes are actually deployed and the post-deployment smoke tests in §16 pass — an unverified fix is not a resolved incident.
2. The canonical-domain decision is made *permanent* (this phase only set a *temporary* one, as instructed).
3. The CognoRise InfoTech date conflict is resolved with the owner (still open — this phase only hid it, per instruction, it did not resolve the underlying factual question).
4. The InsightBoard CRM project's authenticity/imagery/demo status is resolved with the owner (still open — this phase only hid it).
5. CI is set up to keep the new test suite meaningful going forward (currently would only be caught by someone manually running `manage.py test`/`npx vitest run`).
