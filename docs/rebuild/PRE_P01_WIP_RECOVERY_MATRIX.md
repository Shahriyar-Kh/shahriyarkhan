# PRE-P01 — WIP Recovery Matrix

**Date:** 2026-08-30

Three-way classification of every modified, deleted, and untracked file in the original dirty workspace: (1) original committed HEAD (`2d654dd`), (2) original working-tree version, (3) latest `origin/main` (`aa7ebc5c`). All comparisons below were done read-only, from copies in other worktrees — the original workspace was never written to.

Method note: file-content comparisons used content hashes after stripping `\r` (the original workspace's checkout uses CRLF line endings; `origin/main`'s does not), so a "content-identical" verdict below means the actual bytes-of-meaning are identical, not that `git diff` would show zero lines.

---

## Backend — genuinely unique work (RECOVER)

| File | Classification | Notes |
|---|---|---|
| `backend/apps/portfolio/models.py` | **Unique valid gallery work** (+ bundled non-gallery field addition) | Adds `Project.short_description`, `Project.feature_bullets`, and the entire `ProjectImage` model. `main` has none of these — confirmed via direct diff against `origin/main`'s current `models.py` (identical to pre-change HEAD). |
| `backend/apps/portfolio/migrations/0002_project_feature_bullets_project_short_description_and_more.py` | **Unique valid gallery work** | The migration for the above. `main`'s `portfolio/migrations/` only has `0001_initial.py` — this is a clean, uncontested next migration. Verified the operations match the model diff exactly. |
| `backend/apps/portfolio/admin.py` | **Unique valid gallery work** | Adds `ProjectImageInline` and `ProjectImageAdmin`. `main`'s current file is byte-identical to the pre-change HEAD (confirmed), so this is 100% new. |
| `backend/apps/portfolio/api/admin_urls.py` | **Unique valid gallery work** | Registers `AdminProjectImageViewSet` at `project-images`. Not present on `main`. |
| `backend/apps/portfolio/api/serializers.py` | **Unique valid gallery work — required a safety fix** | Adds `ProjectImageSerializer` and nests it as `images` on `ProjectSerializer`/`AdminProjectSerializer`. **Fixed during recovery** (see below): the original workspace's `ProjectImageSerializer` omitted a writable `project` field, which would have made every admin image upload fail (see Security/Fix section). |
| `backend/apps/portfolio/api/views.py` | **Unique valid gallery work — required a safety fix** | Adds `AdminProjectImageViewSet`. **Fixed during recovery**: repointed to a new `AdminProjectImageSerializer` (writable `project` field) instead of the read-only nested serializer. |

## Frontend — already merged into `main` (EXCLUDE, do not reintroduce)

| File | Classification | Evidence |
|---|---|---|
| `frontend/src/routes/projects.$slug.tsx` | **Already merged into main** | Direct diff of the workspace's version against `main`'s current version: **zero lines exist in the workspace version that are absent from `main`**. `main`'s version is a strict superset — it already has the `images` type field, the `buildGallery()` branch that reads `project.images`, `addSchemaMarkup`/`canonicalUrl` SEO wiring, the exported `projectFallbacks`, **and** a fully-built, already-styled, already-wired `ProjectGallery` component (lines 182–255) rendered in the sidebar (line 480) that consumes exactly the same `gallery` array. The public gallery UI requires zero frontend changes — it is already complete and simply has no backend to feed it yet. |
| `frontend/src/components/AdminProjectForm.tsx` | **Already merged into main** | Content-identical to `main` (hash match after line-ending normalization). `main`'s copy already contains a complete "Project Images" upload section that `fetch()`s `POST /api/v1/admin/portfolio/project-images/` with `project`, `image`, `image_type`, `alt_text`, `display_order` fields — i.e. the exact shape the recovered backend now serves. |
| `frontend/src/components/ProjectImageGallery.tsx` | **Duplicated / superseded, not the active implementation** | `main` already has its own, different (153 vs. 148 line) copy of this file, with a hook-order-safety fix and a passing jsdom test suite (`ProjectImageGallery.test.tsx`, part of `main`'s P01A4 work). It is a separate, currently-unused presentational component — `main`'s actual public gallery UI is the inline `ProjectGallery` in `projects.$slug.tsx`, not this component. The workspace's older, unfixed copy must not overwrite `main`'s fixed one. Left untouched; not imported. |
| `frontend/src/routes/projects.tsx` | **Already merged into main, plus one excluded stale feature** | Diffed directly against `main`: the only lines unique to the workspace version are (a) minor fallback-data field ordering (`id`/`display_order` position — cosmetic, no functional difference, `main`'s fallback objects carry the same data) and (b) a `backendEmpty` debug banner (see Exclusions). |
| `frontend/src/routes/index.tsx` | **Already merged into main, plus one excluded stale feature** | Same pattern as above: `main`'s section-wrapper classes (`home-section home-section--media...`) are a richer, later iteration; the only unique workspace content is the `backendEmpty` banner (see Exclusions). |
| `frontend/index.html` | Already merged into main | Content-identical. |
| `frontend/src/App.tsx` | Already merged into main | Content-identical. |
| `frontend/src/lib/seo.ts` | Already merged into main | Content-identical; this is where `addSchemaMarkup` is defined, already present on `main`. |
| `frontend/src/styles-premium-enhancements.css` | Already merged into main | Content-identical. |
| `frontend/package.json` | Already merged into main (main has one additional entry) | Only difference: `main` has `"jsdom": "^30.0.1"` (added for its own `ProjectImageGallery.test.tsx`), which the workspace lacks. Nothing unique to recover from the workspace side. |
| `frontend/package-lock.json` | Already merged into main | Lockfile churn from the same dependency graph; not independently meaningful, not recovered as its own artifact (regenerated by `npm install` on the recovery branch instead). |

## Backend (non-gallery) — already merged into `main` (EXCLUDE)

| File | Classification |
|---|---|
| `backend/apps/core/management/commands/seed_insightboard_project.py` | Already merged into main (content-identical) |
| `backend/apps/core/management/commands/seed_portfolio_data.py` | Already merged into main (content-identical) |
| `backend/apps/resume_builder/api/views.py` | Already merged into main (content-identical) |
| `backend/config/settings/base.py` | Already merged into main (content-identical) |
| `backend/config/settings/production.py` | Already merged into main (content-identical) |
| `backend/config/urls.py` | Already merged into main (content-identical) |
| `vercel.json` (deleted at root) | Already merged into main — `main` also does not have a root-level `vercel.json` (P01A relocated it to `frontend/vercel.json`, which is itself already on `main`, content-identical). The workspace's deletion reflects the same, already-shipped fix. |

## Duplicated tests (EXCLUDE — do not reintroduce, would not add coverage)

All four are content-identical to `main`'s current versions (confirmed via hash comparison), meaning they were fully carried into `main` already through the P01A stabilization branch reconciliation:

- `backend/apps/core/tests.py`
- `backend/apps/portfolio/tests.py`
- `backend/apps/resume_builder/tests.py`
- `backend/apps/site_config/tests.py`

## Duplicated documentation (EXCLUDE — fully superseded)

The entire untracked `docs/rebuild/` directory (10 files: `CONTENT_TRUTH_INVENTORY.md`, `DATA_MODEL_INVENTORY.md`, `MEDIA_INVENTORY.csv`, `OPEN_DECISIONS.md`, `P00_EVIDENCE_FREEZE.md`, `P01A_CHANGE_BOUNDARY.md`, `P01A_ISOLATION_REPORT.md`, `P01A_STABILIZATION_REPORT.md`, `P01_HANDOFF.md`, `ROUTE_MIGRATION_MAP.csv`) already exists on `main`, which additionally has 31 *more* `docs/rebuild/` files from later phases (CFH1/CFH2/P01A4/P01A5/P01A6). `OPEN_DECISIONS.md` and `P01_HANDOFF.md` in particular are **stale, pre-P01A.6 drafts** on the workspace side — `main`'s versions carry substantial additive updates (contact-intake resolution, email-notification status, Yango git-history tracking, etc.). Copying any of these 10 files over `main`'s versions would be a regression. None recovered.

## Duplicated/superseded site helpers and config (EXCLUDE)

All content-identical to `main` (hash match after line-ending normalization) — fully carried into `main` via the P01A stabilization branch already:

- `frontend/public/robots.txt`
- `frontend/public/sitemap.xml` *(differs from main by content — see note)*
- `frontend/src/lib/apiEndpoints.ts` / `.test.ts`
- `frontend/src/lib/routeMatch.ts` / `.test.ts`
- `frontend/src/lib/site.ts` / `.test.ts`
- `frontend/src/metadata.test.ts`
- `frontend/vercel.json`

Note: `frontend/public/sitemap.xml` and `frontend/src/routes/contentVisibility.test.ts` differ from `main` by content (not just line endings) — inspected directly: in both cases `main`'s version is later/richer (the sitemap includes the Yango Wing Fleet route added after the workspace's copy was written; the visibility test covers more cases). Superseded, not reintroduced.

`frontend/vitest.config.ts` also differs: `main`'s version additionally supports `.test.tsx` and a per-file jsdom pragma (needed for `ProjectImageGallery.test.tsx`, unrelated to this recovery). Superseded, not reintroduced — the recovery branch's new backend tests use `manage.py test`, not Vitest, so no config change is needed there either.

## Temporary/debug files (EXCLUDE, per Step 6 default exclusions)

| File | Reason |
|---|---|
| `00_START_HERE.md` | Root-level scratch/planning document, not part of the shipped product |
| `BATCH_1_COMPLETION_REPORT.md` | Same |
| `BATCH_1_IMPLEMENTATION_SUMMARY.md` | Same |
| `IMPLEMENTATION_CODE_GUIDE.md` | Same |
| `PREMIUM_UI_ENHANCEMENT_PLAN.md` | Same |
| `VISUAL_QA_CHECKLIST.md` | Same |
| `testing.py` (root, 4 lines) | Ad hoc scratch script, not a real test module (not under any Django app, not discoverable by `manage.py test`) |

None of these were deleted from the original workspace — they remain exactly where they were.

## Stale/obsolete implementation fragments found inside otherwise-superseded files (EXCLUDE)

- **`backendEmpty` diagnostic banner** in `frontend/src/routes/projects.tsx` and `frontend/src/routes/index.tsx` (workspace-only, not on `main`). Surfaces internal, admin-facing language directly to public site visitors (*"No published projects are available in Django admin yet, so sample projects are being shown."* / *"...Django site settings or SEO record is missing or unpublished."*). This reads as a development-time diagnostic aid from when production's database was actually broken (pre-P01A.6), not production-appropriate copy — main's current, healthy-database state also makes it moot. Not recovered.

## Requires owner review / exclude from recovery

None identified beyond what's already listed above as excluded. No fixtures, seed data, or media files were found anywhere in the dirty/untracked set (confirmed: `git status --porcelain | grep -iE "\.(png|jpg|jpeg|gif|webp|ico|pdf|db|sqlite)$"` → no matches).

## Privacy/security risk

None found in the recovery-candidate files. See `PRE_P01_WIP_SECURITY_SCAN.md`-equivalent findings inlined in the final report (Step 3 was folded into this matrix's evidence rather than a separate file, since every finding was "clean" and there was nothing sensitive to document beyond the negative results already listed there).

---

## Summary counts

| Classification | Count |
|---|---|
| Unique valid gallery work (recovered) | 6 backend files (5 modified + 1 new migration) |
| Already merged into `main` (frontend) | 10 files |
| Already merged into `main` (backend, non-gallery) | 6 modified + 1 deletion |
| Duplicated tests (excluded) | 4 files |
| Duplicated documentation (excluded) | 10 files (the whole untracked `docs/` tree) |
| Duplicated/superseded site helpers (excluded) | 10 files |
| Temporary/debug files (excluded) | 7 files |
| Stale fragments inside superseded files (excluded) | 2 files (banner only, not the whole file) |
| **Total dirty/untracked entries accounted for** | **48** (21 modified + 1 deleted + 26 untracked, matching the Step 1 baseline exactly) |
