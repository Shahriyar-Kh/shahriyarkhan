# PRE-P01 — WIP Recovery Report

**Date:** 2026-08-30
**Branch:** `feat/pre-p01-wip-recovery`, based on `origin/main` @ `aa7ebc5c53234ffebafdeb1d6915295f27c74725`

---

## What was recovered

The original dirty workspace (`D:/Django Projects/shahriyarkhan-portfolio`) turned out to contain almost no genuinely unique work — the vast majority of its 48 dirty/untracked entries were already carried into `main` through the P01A stabilization branch reconciliation (see `PRE_P01_WIP_RECOVERY_MATRIX.md` for the full file-by-file evidence). The one real, valuable exception was the **backend half of a project-image gallery feature**:

- `Project.short_description`, `Project.feature_bullets` fields
- The `ProjectImage` model (image, type, alt text, caption, ordering, featured flag)
- `ProjectImageSerializer` (read-only, nested under `ProjectSerializer`/`AdminProjectSerializer`)
- `AdminProjectImageSerializer` (writable, for the standalone admin CRUD endpoint — **new**, not in the original workspace; see Fix below)
- `AdminProjectImageViewSet` at `/api/v1/admin/portfolio/project-images/`
- `ProjectImageInline` + `ProjectImageAdmin` in Django admin
- Migration `0002_project_feature_bullets_project_short_description_and_more`

## The frontend needed zero changes

This was the most significant finding of the three-way classification: `main`'s frontend **already has the entire client side of this feature**, shipped separately (apparently via the "premium UI" content that landed directly on `main` during the P01A.4 period) and simply left unable to do anything because the backend didn't exist yet:

- `projects.$slug.tsx` already declares the `images` field on its `ProjectDetail` type, already has a `buildGallery()` branch that reads `project.images`, and already renders a complete, styled, accessible `ProjectGallery` carousel (auto-rotate, prev/next, dot indicators, thumbnail strip) fed by that data.
- `AdminProjectForm.tsx` already has a full "Project Images" upload section that `POST`s multipart form data (`project`, `image`, `image_type`, `alt_text`, `display_order`) to `/api/v1/admin/portfolio/project-images/` — the exact endpoint this recovery adds.
- `styles.css` already has the `pd-gallery*` classes the carousel needs.

Recovering the workspace's original frontend copies of `projects.$slug.tsx`, `projects.tsx`, `AdminProjectForm.tsx`, etc. would have been a **regression** — `main`'s versions are strict supersets. None were touched.

## A bug found and fixed during recovery

The original workspace's own `ProjectImageSerializer` did not include a writable `project` field. Since `AdminProjectImageViewSet` used that same serializer for its standalone CRUD endpoint, every image-creation request from the already-shipped `AdminProjectForm.tsx` (which posts `project` as part of the multipart body) would have failed — either a validation error or an `IntegrityError` on the required, defaultless `ProjectImage.project` foreign key. This was never caught in the original workspace because it had no tests for this code at all.

**Fix:** split into two serializers — `ProjectImageSerializer` (read-only, nested, no `project` field — redundant when already nested under a project) for public/admin project reads, and a new `AdminProjectImageSerializer` (adds `project` as a writable field) for the standalone admin endpoint. `AdminProjectImageViewSet` now uses the latter. Verified end-to-end by `AdminProjectImageApiTests.test_authenticated_admin_can_create_update_and_delete`, which performs the exact create → update → delete cycle the admin form does.

## Verification

| Check | Result |
|---|---|
| `manage.py check` | Pass — 0 issues |
| `manage.py makemigrations --check --dry-run` | Pass — "No changes detected" (before *and* after generating migration 0002) |
| `sqlmigrate portfolio 0002` | Inspected — standard SQLite column-add/table-rebuild pattern, safe defaults backfilled (`'[]'` for `feature_bullets`, `''` for `short_description`) |
| URL reversal (`admin-project-images-list`) | Resolves to `/api/v1/admin/portfolio/project-images/` — the exact path `AdminProjectForm.tsx` already calls |
| Backend: `apps.portfolio` test suite | **23/23 pass** (16 pre-existing + 7 new gallery tests) |
| Backend: full suite (`portfolio site_config resume_builder core inquiries`) | **46/46 pass** (38 pre-existing + 8 new — includes the 2 model, 2 public-API, and 4 admin-API gallery tests) |
| Frontend: `npm ci` | Clean install, 427 packages |
| Frontend: `npx vitest run` | **35/35 pass** (unchanged — no frontend files were modified) |
| Frontend: `npm run lint` | 0 errors, 13 pre-existing warnings (all in files untouched by this recovery) |
| Frontend: `npx tsc --noEmit` | Clean, 0 errors |
| Frontend: `npm run build` | Succeeds, `dist/` produced |
| `git diff --check` | Pass |
| Secret scan | Clean (one false-positive match on a literal string `"not-used-directly"` used as an unused Django test password, not a real credential) |
| Privacy scan | Clean — no Yango screenshot reference, no InsightBoard stock-image reference, no PII pattern in any recovered file |
| Tracked-binary inventory | None — test-run artifacts (`backend/media/projects/gallery/...`, `backend/db.sqlite3`) were generated locally while running the suite and deleted before committing; neither was ever staged |
| Migration inspection | One new migration, `portfolio/0002_...`, matches the model changes exactly; no other app has pending migrations |
| Direct route verification | `admin-project-images-list` reverses correctly; public project detail/list tests confirm `images` is nested and ordered by `display_order` |

## New tests added

`backend/apps/portfolio/tests.py` — 8 new tests across three classes:

- `ProjectImageModelTests` (2): related-name ordering, cascade delete
- `ProjectImagePublicApiTests` (2): project detail and list endpoints nest ordered `images`
- `AdminProjectImageApiTests` (4): unauthenticated rejection, full authenticated create/update/delete cycle, `project_id` query-param filtering, invalid-image-upload rejection (HTTP 400, zero rows created)

## Files changed on this branch

- `backend/apps/portfolio/models.py`
- `backend/apps/portfolio/admin.py`
- `backend/apps/portfolio/api/admin_urls.py`
- `backend/apps/portfolio/api/serializers.py`
- `backend/apps/portfolio/api/views.py`
- `backend/apps/portfolio/tests.py`
- `backend/apps/portfolio/migrations/0002_project_feature_bullets_project_short_description_and_more.py` (new)
- `docs/rebuild/PRE_P01_WIP_BASELINE.md` (new)
- `docs/rebuild/PRE_P01_WIP_RECOVERY_MATRIX.md` (new)
- `docs/rebuild/PRE_P01_WIP_RECOVERY_REPORT.md` (new, this file)

No frontend file, workflow file, or environment file was changed.

## What remains incomplete / explicitly out of scope

- No file-size or MIME-allowlist validator was added beyond Django's built-in `ImageField` validation (which already rejects non-image data via Pillow, as proven by the invalid-upload test). Additional limits (e.g. a max file size) were judged out of scope for this recovery — not something the original workspace had either.
- The frontend's separate, unused `ProjectImageGallery.tsx` + `.test.tsx` component (already on `main`, from the P01A4 premium-UI push) remains unused — `main`'s actual public gallery UI is the inline `ProjectGallery` in `projects.$slug.tsx`. Wiring or removing the orphaned component is a separate, future decision, not part of recovering the workspace's WIP.
- The `backendEmpty` diagnostic banner found in the workspace's `projects.tsx`/`index.tsx` was deliberately excluded (see the matrix) as a production-inappropriate development aid, not carried forward.

## Original workspace preservation

Confirmed byte-for-byte identical to the `PRE_P01_WIP_BASELINE.md` snapshot after this entire recovery: same HEAD (`2d654dd85e60ca5bda9fb39bd8a097ccbe4809ce`), same branch (`main`), same porcelain status (diffed line-by-line against the baseline — zero differences), and spot-checked file-content hashes for every file used as a recovery source (`models.py`, `admin.py`, `serializers.py`, `views.py`, `admin_urls.py`, the migration) confirmed unchanged.
