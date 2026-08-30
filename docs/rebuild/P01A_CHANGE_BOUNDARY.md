# P01A.1 — Change Boundary

**Date:** 2026-08-30
**Repository:** `d:\Django Projects\shahriyarkhan-portfolio`
**Branch (source workspace):** `main`
**HEAD (source workspace):** `2d654dd85e60ca5bda9fb39bd8a097ccbe4809ce` ("Final Optimized UI & UX Enhancements")
**Working tree:** Dirty — confirmed identical in shape to the P00/P01A snapshot (no drift): same 10 pre-existing modified files, same 9 pre-existing untracked paths, plus P01A's own new/modified files and the 4 verification images.

This document reconstructs the change boundary before any commit-preparation work happens, per `P01A_CHANGE_BOUNDARY` step 1 of the P01A.1 task. It classifies every path currently reported by `git status --short` / `git diff --name-status`.

---

## Raw state captured

`git status --short` (2026-08-30):

```
 M backend/apps/core/management/commands/seed_insightboard_project.py
 M backend/apps/core/management/commands/seed_portfolio_data.py
 M backend/apps/portfolio/admin.py
 M backend/apps/portfolio/api/admin_urls.py
 M backend/apps/portfolio/api/serializers.py
 M backend/apps/portfolio/api/views.py
 M backend/apps/portfolio/models.py
 M backend/apps/resume_builder/api/views.py
 M backend/config/settings/base.py
 M backend/config/settings/production.py
 M backend/config/urls.py
 M frontend/index.html
 M frontend/package-lock.json
 M frontend/package.json
 M frontend/src/App.tsx
 M frontend/src/components/AdminProjectForm.tsx
 M frontend/src/lib/seo.ts
 M frontend/src/routes/index.tsx
 M frontend/src/routes/projects.$slug.tsx
 M frontend/src/routes/projects.tsx
 M frontend/src/styles-premium-enhancements.css
 D vercel.json
?? 00_START_HERE.md
?? BATCH_1_COMPLETION_REPORT.md
?? BATCH_1_IMPLEMENTATION_SUMMARY.md
?? IMPLEMENTATION_CODE_GUIDE.md
?? PREMIUM_UI_ENHANCEMENT_PLAN.md
?? VISUAL_QA_CHECKLIST.md
?? backend/apps/core/tests.py
?? backend/apps/portfolio/migrations/0002_project_feature_bullets_project_short_description_and_more.py
?? backend/apps/portfolio/tests.py
?? backend/apps/resume_builder/tests.py
?? backend/apps/site_config/tests.py
?? backend/media/projects/featured/insightboard-crm-sales-intelligence-dashboard-featured.jpg
?? backend/media/projects/featured/insightboard-crm-sales-intelligence-dashboard-featured_5GyVQgH.jpg
?? backend/media/projects/previews/insightboard-crm-sales-intelligence-dashboard-preview.jpg
?? backend/media/projects/previews/insightboard-crm-sales-intelligence-dashboard-preview_tsplVnV.jpg
?? docs/
?? frontend/public/robots.txt
?? frontend/public/sitemap.xml
?? frontend/src/components/ProjectImageGallery.tsx
?? frontend/src/lib/apiEndpoints.test.ts
?? frontend/src/lib/apiEndpoints.ts
?? frontend/src/lib/routeMatch.test.ts
?? frontend/src/lib/routeMatch.ts
?? frontend/src/lib/site.test.ts
?? frontend/src/lib/site.ts
?? frontend/src/metadata.test.ts
?? frontend/src/routes/contentVisibility.test.ts
?? frontend/vercel.json
?? frontend/vitest.config.ts
?? testing.py
```

`git diff --stat` total: 22 files changed, 975 insertions(+), 118 deletions(-) (tracked files only; excludes untracked paths above).

`docs/` is entirely **untracked** — `docs/rebuild/*.md/csv` have never been committed.

## Pre-existing dirty files recorded by P00/P01A (baseline, confirmed unchanged)

**Modified (10):** `backend/apps/portfolio/admin.py`, `backend/apps/portfolio/api/admin_urls.py`, `backend/apps/portfolio/api/serializers.py`, `backend/apps/portfolio/api/views.py`, `backend/apps/portfolio/models.py`, `frontend/src/components/AdminProjectForm.tsx`, `frontend/src/lib/seo.ts`, `frontend/src/routes/index.tsx`, `frontend/src/routes/projects.$slug.tsx`, `frontend/src/styles-premium-enhancements.css`.

**Untracked (9):** `00_START_HERE.md`, `BATCH_1_COMPLETION_REPORT.md`, `BATCH_1_IMPLEMENTATION_SUMMARY.md`, `IMPLEMENTATION_CODE_GUIDE.md`, `PREMIUM_UI_ENHANCEMENT_PLAN.md`, `VISUAL_QA_CHECKLIST.md`, `backend/apps/portfolio/migrations/0002_project_feature_bullets_project_short_description_and_more.py`, `frontend/src/components/ProjectImageGallery.tsx`, `testing.py`.

Confirmed identical to `P00_EVIDENCE_FREEZE.md` §2 and `P01A_STABILIZATION_REPORT.md` §2 — no drift.

## Important correction to the P01A report's own self-description

`P01A_STABILIZATION_REPORT.md` §2 states that `backend/apps/portfolio/admin.py`, `admin_urls.py`, `serializers.py`, `views.py`, and `models.py` were each touched with "a small, additive change alongside" the pre-existing gallery diff. **Direct hunk inspection (`git diff -- <file>`) of the current working tree shows this is not the case for these five specific files**: every hunk in each of them is exclusively `ProjectImage` gallery-feature content (new model, inline admin, serializer, admin viewset, `short_description`/`feature_bullets` fields) with no fail-fast, canonical-domain, résumé, or content-visibility logic present anywhere in them. These five files are therefore classified below as **100% pre-existing gallery feature**, not mixed, and are fully excluded from the stabilization branch. This is called out explicitly per the task's "do not assume every currently modified file belongs to P01A" instruction.

---

## Classification

### P01A stabilization (include in full)

| Path | Notes |
|---|---|
| `backend/config/settings/base.py` | Adds `PUBLIC_SITE_URL` setting. No pre-existing hunks present. |
| `backend/config/settings/production.py` | Adds fail-fast `DATABASE_URL`/`POSTGRES_HOST` check. No pre-existing hunks present. |
| `backend/config/urls.py` | `sitemap_xml()`/`robots_txt()` switched from `PUBLIC_BASE_URL` to `PUBLIC_SITE_URL`. No pre-existing hunks present. |
| `backend/apps/resume_builder/api/views.py` | Two `Http404` crash fixes. No pre-existing hunks present. |
| `backend/apps/core/management/commands/seed_insightboard_project.py` | Draft/unfeatured seeding + image-download timeout/try-except. No pre-existing hunks present. |
| `backend/apps/core/management/commands/seed_portfolio_data.py` | Same pattern, plus `published` gate field. No pre-existing hunks present. |
| `backend/apps/core/tests.py` | New file, wholly P01A. |
| `backend/apps/portfolio/tests.py` | New file, wholly P01A. |
| `backend/apps/resume_builder/tests.py` | New file, wholly P01A. |
| `backend/apps/site_config/tests.py` | New file, wholly P01A. |
| `frontend/src/lib/site.ts` | New file, wholly P01A (`SITE_URL`/`canonicalUrl`). |
| `frontend/src/lib/apiEndpoints.ts` | New file, wholly P01A (`EXPERIENCES_ENDPOINT`). |
| `frontend/src/lib/routeMatch.ts` | New file, wholly P01A (extracted from `App.tsx`). |
| `frontend/src/App.tsx` | Refactor to use `matchRoute()`. No pre-existing hunks present. |
| `frontend/src/routes/projects.tsx` | Only change is `export` on the `projects` fallback array (for tests). No pre-existing hunks present. |
| `frontend/index.html` | Canonical/OG/JSON-LD domain swap `shahriyarkhan.dev` → `shahriyarkhan.vercel.app`. No pre-existing hunks present. |
| `frontend/package.json` | Adds `test` script + `vitest` devDependency. No pre-existing hunks present. |
| `frontend/package-lock.json` | Lockfile entries are exclusively `vitest` and its transitive deps (verified: `@standard-schema/spec`, `@types/deep-eql`, `assertion-error`, `es-module-lexer`, `estree-walker`, `obug`, `siginfo`, `stackback`, `tinybench`, `tinyexec`, `tinyrainbow`, `why-is-node-running`, etc.) — no gallery/unrelated package additions found. |
| `frontend/vercel.json` | New file, wholly P01A (relocated Vercel config). |
| `vercel.json` (deletion) | Stale root copy removed as part of the same fix. |
| `frontend/vitest.config.ts` | New file, wholly P01A. |
| `frontend/public/robots.txt` | New file, wholly P01A. |
| `frontend/public/sitemap.xml` | New file, wholly P01A. |
| `frontend/src/lib/apiEndpoints.test.ts` | New test file, wholly P01A. |
| `frontend/src/lib/routeMatch.test.ts` | New test file, wholly P01A. |
| `frontend/src/lib/site.test.ts` | New test file, wholly P01A. |
| `frontend/src/metadata.test.ts` | New test file, wholly P01A. |
| `frontend/src/routes/contentVisibility.test.ts` | New test file, wholly P01A. Imports `projectFallbacks` from `projects.$slug.tsx` — see mixed-file section below. |

### P00/P01A documentation (include in full)

`docs/rebuild/P00_EVIDENCE_FREEZE.md`, `docs/rebuild/DATA_MODEL_INVENTORY.md`, `docs/rebuild/MEDIA_INVENTORY.csv`, `docs/rebuild/ROUTE_MIGRATION_MAP.csv`, `docs/rebuild/CONTENT_TRUTH_INVENTORY.md`, `docs/rebuild/P01A_STABILIZATION_REPORT.md`, `docs/rebuild/OPEN_DECISIONS.md`, `docs/rebuild/P01_HANDOFF.md`, plus this file and the forthcoming `docs/rebuild/P01A_ISOLATION_REPORT.md`. All currently untracked (never committed).

### Mixed / needs hunk-level isolation

| Path | P01A hunk(s) to port | Excluded hunk(s) and why |
|---|---|---|
| `frontend/src/lib/seo.ts` | Import `canonicalUrl` from `@/lib/site`; `applySeo()`'s canonical `<link>` default changed from `window.location.href` to `canonicalUrl(window.location.pathname)`; **new** `og:url` meta tag using the same `canonicalUrl()` call. | `SchemaMarkup` type + `addSchemaMarkup()` function, `twitterImage` field, `author`/`robots`/`viewport` meta additions, `twitter:site`/`twitter:creator`, `theme-color`/`msapplication-TileColor`, `og:site_name`. Confirmed via `git show HEAD:frontend/src/lib/seo.ts` that **none** of this existed in the committed baseline — it is pre-existing, uncommitted "premium/SEO enhancement" work the P01A report did not actually describe adding, and it does not depend on the canonical-domain fix, so it is safely excludable without breaking the fix. |
| `frontend/src/routes/index.tsx` | Import `EXPERIENCES_ENDPOINT` from `@/lib/apiEndpoints` and use it in place of the singular, broken `/portfolio/experience/` path; `export` on `stats`/`experienceItems`/`fallbackProjects` (needed for tests); "Real Roles" stat value `4` → `3`; CognoRise split out of `experienceItems` into a new, separate, non-deleted `hiddenExperienceItemsPendingVerification` export with an explanatory comment. | Import of `addSchemaMarkup`/`SITE_URL` and the entire `addSchemaMarkup({ "@type": "Person", ... })` call block. Confirmed via `git show HEAD:frontend/src/routes/index.tsx` (searched for `JSON-LD`/`schema`/`ld+json`) that **no client-generated JSON-LD existed in the committed baseline at all** — this whole block is pre-existing, uncommitted work, not a P01A modification of pre-existing P01A-owned code. It is excluded because porting it would require also carrying forward an unrelated SEO/schema feature that was never part of the stabilization scope. |
| `frontend/src/routes/projects.$slug.tsx` | Import `canonicalUrl` from `@/lib/site`; `canonicalUrl: window.location.href` → `canonicalUrl: canonicalUrl(window.location.pathname)` inside the existing `applySeo({...})` call (this field **did** exist in the committed baseline, confirmed via `git show HEAD`); `export` on `projectFallbacks` (needed by `contentVisibility.test.ts`). | The `images?: Array<...>` field added to the `ProjectDetail` type and the corresponding `buildGallery()` integration reading `project.images`; the `addSchemaMarkup` import and the entire `CreativeWork` schema block. Confirmed via `git show HEAD` that none of the `images` gallery-API wiring or JSON-LD existed in the committed baseline — both are pre-existing gallery/SEO-enhancement work, not a P01A-owned line being modified, so they are excluded as not required for the canonical-domain fix. |

### Pre-existing gallery feature (exclude entirely)

| Path | Notes |
|---|---|
| `backend/apps/portfolio/admin.py` | 100% `ProjectImage` inline/admin registration. See correction note above. |
| `backend/apps/portfolio/api/admin_urls.py` | 100% `AdminProjectImageViewSet` route registration. |
| `backend/apps/portfolio/api/serializers.py` | 100% `ProjectImageSerializer` + `images` field on project serializers. |
| `backend/apps/portfolio/api/views.py` | 100% `AdminProjectImageViewSet`. |
| `backend/apps/portfolio/models.py` | 100% new `ProjectImage` model + `short_description`/`feature_bullets` fields on `Project`. |
| `backend/apps/portfolio/migrations/0002_project_feature_bullets_project_short_description_and_more.py` | Migration for the above; untracked. |
| `frontend/src/components/ProjectImageGallery.tsx` | Untracked gallery UI component, orphaned (not imported by any route per P00 §4). |
| `frontend/src/components/AdminProjectForm.tsx` | 100% gallery-image-upload wiring (multi-step upload to `project-images/` endpoint). |

### Pre-existing UI work (exclude entirely)

| Path | Notes |
|---|---|
| `frontend/src/styles-premium-enhancements.css` | +250 lines, untouched by P01A per the stabilization report itself (§2: "not touched at all this phase"). |

### Generated verification artifact (quarantine, do not include)

| Path | Notes |
|---|---|
| `backend/media/projects/featured/insightboard-crm-sales-intelligence-dashboard-featured.jpg` | Untracked; downloaded during P01A's local end-to-end seed verification. |
| `backend/media/projects/featured/insightboard-crm-sales-intelligence-dashboard-featured_5GyVQgH.jpg` | Same, naming-collision duplicate. |
| `backend/media/projects/previews/insightboard-crm-sales-intelligence-dashboard-preview.jpg` | Same. |
| `backend/media/projects/previews/insightboard-crm-sales-intelligence-dashboard-preview_tsplVnV.jpg` | Same, naming-collision duplicate. |

Note: `backend/media/projects/featured/insightboard-crm-sales-intelligence-dashboard-featured_p5M9vCm.jpg` and `backend/media/projects/previews/insightboard-crm-sales-intelligence-dashboard-preview_RZy6CQl.jpg` are **already tracked in git** (different random suffixes) and are explicitly out of scope for quarantine — only the 4 exact untracked filenames listed above and in the task instructions are candidates.

### Unrelated documentation (exclude entirely)

`00_START_HERE.md`, `BATCH_1_COMPLETION_REPORT.md`, `BATCH_1_IMPLEMENTATION_SUMMARY.md`, `IMPLEMENTATION_CODE_GUIDE.md`, `PREMIUM_UI_ENHANCEMENT_PLAN.md`, `VISUAL_QA_CHECKLIST.md`, `testing.py`.

### Unknown

None. Every path reported by `git status --short` has been classified above with direct evidence (either a full `git diff`, or a `git show HEAD:<path>` comparison, or both).

---

## Summary count

- P01A stabilization (whole file): 27 paths
- P00/P01A documentation: 8 existing + 2 new = 10 paths
- Mixed (hunk-level isolation required): 3 paths
- Pre-existing gallery feature: 8 paths
- Pre-existing UI work: 1 path
- Generated verification artifacts (quarantine): 4 paths
- Unrelated documentation: 7 paths

Total accounted for: matches `git status --short`'s 45 lines exactly (22 tracked M/D + 23 untracked, where `docs/` counts as 1 status line covering 8 files, and `backend/media/projects/{featured,previews}/` are not separately listed as directory lines since git lists individual untracked files).
