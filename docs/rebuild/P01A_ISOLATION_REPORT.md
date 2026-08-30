# P01A.1 — Stabilization Isolation Report

**Date:** 2026-08-30
**Task:** Create a clean, independently testable, deployment-ready local branch containing only verified P01A stabilization work, isolated from pre-existing uncommitted gallery/UI work, unrelated root docs, and generated verification artifacts.

---

## 1. Original workspace path and branch

`d:\Django Projects\shahriyarkhan-portfolio`, branch `main`.

## 2. Original HEAD

`2d654dd85e60ca5bda9fb39bd8a097ccbe4809ce` ("Final Optimized UI & UX Enhancements") — unchanged throughout this task; no commits were made on `main`.

## 3. Original dirty-work classification

Full classification recorded in [`P01A_CHANGE_BOUNDARY.md`](P01A_CHANGE_BOUNDARY.md). Summary:

- **P01A stabilization** (ported in full): 27 paths.
- **P00/P01A documentation** (ported in full): 8 existing `docs/rebuild/` files + this report + the change-boundary doc.
- **Mixed, hunk-level isolation required**: 3 paths — `frontend/src/lib/seo.ts`, `frontend/src/routes/index.tsx`, `frontend/src/routes/projects.$slug.tsx`. Each had a genuine P01A fix nested alongside pre-existing, uncommitted "premium UI/SEO enhancement" work (a client-generated JSON-LD/schema-markup feature, a gallery-images integration) that was **not present in committed HEAD at all** — confirmed via `git show HEAD:<path>` — and therefore not portable without also carrying that unrelated feature forward. Only the P01A-attributable lines were ported; see the change-boundary doc's per-file hunk tables for exact detail.
- **Pre-existing gallery feature** (excluded entirely): 8 paths, including `backend/apps/portfolio/models.py`/`admin.py`/`api/views.py`/`api/serializers.py`/`api/admin_urls.py`, the `0002_...` migration, `ProjectImageGallery.tsx`, `AdminProjectForm.tsx`.
  - **Correction to the P01A report's own self-description**: `P01A_STABILIZATION_REPORT.md` §2 claims `admin.py`, `admin_urls.py`, `serializers.py`, `views.py`, and `models.py` were each touched with "a small, additive change alongside" the gallery diff. Direct hunk inspection of all five files found **zero** P01A-attributable content in any of them — every hunk is exclusively `ProjectImage` gallery-feature code. This is documented in the change-boundary doc and treated as authoritative over the report's text; all five files were excluded in full.
- **Pre-existing UI work** (excluded): `frontend/src/styles-premium-enhancements.css` (P01A's own report confirms this was "not touched at all this phase").
- **Unrelated documentation** (excluded): `00_START_HERE.md`, `BATCH_1_COMPLETION_REPORT.md`, `BATCH_1_IMPLEMENTATION_SUMMARY.md`, `IMPLEMENTATION_CODE_GUIDE.md`, `PREMIUM_UI_ENHANCEMENT_PLAN.md`, `VISUAL_QA_CHECKLIST.md`, `testing.py`.
- **Generated verification artifacts** (quarantined, not committed): 4 stock images, see §4.
- **Unknown**: none — every path in `git status --short` was classified with direct evidence.

## 4. Quarantined media paths

- `backend/media/projects/featured/insightboard-crm-sales-intelligence-dashboard-featured.jpg`
- `backend/media/projects/featured/insightboard-crm-sales-intelligence-dashboard-featured_5GyVQgH.jpg`
- `backend/media/projects/previews/insightboard-crm-sales-intelligence-dashboard-preview.jpg`
- `backend/media/projects/previews/insightboard-crm-sales-intelligence-dashboard-preview_tsplVnV.jpg`

All four were verified present, untracked (`git status --short` → `??`), and an exact match to the task's listed filenames before being moved. The two pre-existing **tracked** media files with different random-suffix names (`...featured_p5M9vCm.jpg`, `...preview_RZy6CQl.jpg`) were left untouched — they were never candidates. No directory was deleted, only the four individual files were moved.

## 5. Quarantine destination

`../shahriyarkhan-p01a-quarantine/` (sibling to the repo root), preserving the same relative path structure (`backend/media/projects/featured/...`, `backend/media/projects/previews/...`). Recoverable — nothing in the quarantine directory has been deleted; restore by moving the files back to their original paths under `backend/media/projects/...` in the original workspace.

## 6. Clean worktree path

`../shahriyarkhan-p01a-clean/` (sibling to the repo root), created via `git worktree add -b fix/p01a-stabilization-clean ../shahriyarkhan-p01a-clean HEAD`. Both the branch name and destination directory were confirmed absent before creation; no force flags were used.

## 7. Clean branch name

`fix/p01a-stabilization-clean`

## 8. Exact files and hunks ported

**Ported in full** (new files or modified files with zero pre-existing hunks, applied via an exact `git diff`-derived patch or verbatim copy):

- `backend/config/settings/base.py`, `backend/config/settings/production.py`, `backend/config/urls.py`
- `backend/apps/resume_builder/api/views.py`
- `backend/apps/core/management/commands/seed_insightboard_project.py`, `seed_portfolio_data.py`
- `backend/apps/core/tests.py`, `backend/apps/portfolio/tests.py`, `backend/apps/resume_builder/tests.py`, `backend/apps/site_config/tests.py`
- `frontend/src/lib/site.ts`, `apiEndpoints.ts`, `routeMatch.ts` (+ their `.test.ts` files)
- `frontend/src/App.tsx`, `frontend/src/routes/projects.tsx`
- `frontend/index.html`, `frontend/package.json`, `frontend/package-lock.json`
- `frontend/vercel.json` (new; root `vercel.json` deleted)
- `frontend/vitest.config.ts`, `frontend/public/robots.txt`, `frontend/public/sitemap.xml`
- `frontend/src/metadata.test.ts`, `frontend/src/routes/contentVisibility.test.ts`
- `docs/rebuild/*` (8 pre-existing files + `P01A_CHANGE_BOUNDARY.md` + this report)

**Ported at hunk level** (manual, minimal edits — full before/after detail in `P01A_CHANGE_BOUNDARY.md`):

- `frontend/src/lib/seo.ts` — import `canonicalUrl`; canonical `<link>` default switched to `canonicalUrl(window.location.pathname)`; added one `og:url` meta tag using the same function.
- `frontend/src/routes/index.tsx` — import and use `EXPERIENCES_ENDPOINT`; `export` on `stats`/`experienceItems`/`fallbackProjects`; "Real Roles" stat `4`→`3`; CognoRise split into a new `hiddenExperienceItemsPendingVerification` export.
- `frontend/src/routes/projects.$slug.tsx` — import `canonicalUrl`; `canonicalUrl: window.location.href` → `canonicalUrl: canonicalUrl(window.location.pathname)`; `export` on `projectFallbacks`.

## 9. Exact files intentionally excluded

- `backend/apps/portfolio/models.py`, `admin.py`, `api/admin_urls.py`, `api/serializers.py`, `api/views.py` — 100% `ProjectImage` gallery feature (see §3 correction note).
- `backend/apps/portfolio/migrations/0002_project_feature_bullets_project_short_description_and_more.py` — gallery migration.
- `frontend/src/components/ProjectImageGallery.tsx`, `frontend/src/components/AdminProjectForm.tsx` — gallery UI.
- `frontend/src/styles-premium-enhancements.css` — untouched premium UI experiment.
- Within `seo.ts`/`index.tsx`/`projects.$slug.tsx`: the `SchemaMarkup` type, `addSchemaMarkup()` function, Person/CreativeWork JSON-LD blocks, `twitterImage`/`author`/`robots`/`viewport`/`theme-color`/`og:site_name` additions, and the `images` gallery-API field on `ProjectDetail` — confirmed absent from committed HEAD, so not P01A-owned code being modified; excluded per "do not include premium UI enhancements unless a specific hunk is proven necessary."
- `00_START_HERE.md`, `BATCH_1_COMPLETION_REPORT.md`, `BATCH_1_IMPLEMENTATION_SUMMARY.md`, `IMPLEMENTATION_CODE_GUIDE.md`, `PREMIUM_UI_ENHANCEMENT_PLAN.md`, `VISUAL_QA_CHECKLIST.md`, `testing.py` — unrelated root documentation/scratch file.
- The 4 quarantined stock images.

## 10. Test/build commands

Backend (clean worktree, project-local `backend/.venv/` on Python 3.13):
```
py -3.13 -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements/prod.txt
USE_SQLITE=1 .venv/Scripts/python.exe manage.py check
USE_SQLITE=1 .venv/Scripts/python.exe manage.py makemigrations --check --dry-run
USE_SQLITE=1 .venv/Scripts/python.exe manage.py test apps.portfolio apps.site_config apps.resume_builder apps.core -v 2
# end-to-end content-visibility re-verification (throwaway sqlite db, deleted after):
USE_SQLITE=1 .venv/Scripts/python.exe manage.py migrate --settings=config.settings.development
USE_SQLITE=1 .venv/Scripts/python.exe manage.py seed_portfolio_data --settings=config.settings.development
USE_SQLITE=1 .venv/Scripts/python.exe manage.py seed_insightboard_project --settings=config.settings.development
```

Frontend (clean worktree):
```
npm ci
npx vitest run
npx tsc --noEmit
npm run lint
npm run build
```

## 11. Exact results

| Command | Result |
|---|---|
| `manage.py check` | **Pass** — "System check identified no issues (0 silenced)." |
| `manage.py makemigrations --check --dry-run` | **Pass** — "No changes detected" (confirms the gallery's `0002_...` migration was correctly excluded and nothing else needs a migration) |
| `manage.py test` (31 tests) | **All 31 pass** |
| End-to-end seed verification | InsightBoard CRM seeded as `status=draft, featured=False`; the 31-test suite's `HiddenDisputedContentExclusionTests` independently confirms it is excluded from the public list/detail endpoints while remaining in `Project.objects.all()`. The seed run downloads live Unsplash images into `backend/media/` exactly as it does in any environment — these were deleted after verification (not committed; see §14) |
| `npx vitest run` (18 tests) | **All 18 pass**, including `contentVisibility.test.ts` (CognoRise/InsightBoard absence from every frontend fallback source) and `metadata.test.ts` (no `shahriyarkhan.dev` reference) |
| `npx tsc --noEmit` | **2 errors**, both in `frontend/src/routes/skills.tsx:226`. Confirmed via `git diff`/`git show HEAD:frontend/src/routes/skills.tsx` that this file has **zero** relationship to any dirty work (gallery or premium UI) — the error is baked into the committed `HEAD` commit itself and would appear in any branch built from it. This is a known, pre-existing, disclosed defect (`P01A_STABILIZATION_REPORT.md` §10/§14), not evidence of gallery contamination. See §16 for the resulting caveat on the "type checking passes" completion criterion. |
| `npm run lint` | **0 errors**, 13 warnings (all `react-refresh/only-export-components`, expected/disclosed — see `P01A_STABILIZATION_REPORT.md` §10). **No `ProjectImageGallery.tsx` hook-rule errors** — confirming the file is genuinely absent, i.e. gallery code was not accidentally included. |
| `npm run build` | **Pass** — 1746 modules transformed; `dist/index.html`, `dist/robots.txt`, `dist/sitemap.xml` all present; zero occurrences of `shahriyarkhan.dev` anywhere in `dist/`; canonical link and JSON-LD both resolve to `https://shahriyarkhan.vercel.app`; `dist/sitemap.xml` lists 11 routes and explicitly excludes InsightBoard CRM (with an inline comment explaining why) |
| `git diff --check` (clean worktree) | **Pass** — no conflict markers, no whitespace errors |
| Secret-pattern scan (AWS keys, private-key headers, `sk-`/`xox` tokens, inline `SECRET_KEY`/`PASSWORD`/`DATABASE_URL` literals) across every path in the changeset | **Clean** — no matches |
| Binary-file scan across every path in the changeset | **Clean** — no binary files in the ported set |
| Search for the 4 quarantined filenames | Only a documentation mention (this report and the change-boundary doc, in prose) — no actual binary files with those names exist anywhere in the clean worktree |
| Search for `shahriyarkhan.dev` | Present only in `docs/rebuild/*.md` (historical narrative, correctly describing the incident) and in negative-assertion tests (`site.test.ts`, `metadata.test.ts` — asserting its *absence*); zero occurrences in any file that renders public content |

## 12. Final clean-branch file list

Full contents of both commits (see `git log --oneline -2` in §19); no gallery code, no premium CSS, no stock images, no unrelated root docs. Verified via `git status --short` returning empty after both commits (ignoring gitignored `.venv/`, `node_modules/`, `__pycache__/`, `dist/`).

## 13. Commit hashes

1. `79eaab58795cd4ffa0f7c9a16ba3d7f25eb4d7b0` — `fix: stabilize current portfolio production`
2. `14a95960f590775c93f43d8aea10015753abe270` — `docs: add rebuild evidence and stabilization handoff`

## 14. Original workspace preservation confirmation

`git status --short` in the original workspace, re-checked after all clean-branch work, is **identical** to the pre-task snapshot except for two intentional, task-authorized changes:

1. The 4 quarantined images are gone from `backend/media/projects/{featured,previews}/` (moved, recoverable, per §4).
2. `docs/rebuild/P01A_CHANGE_BOUNDARY.md` was added (new file, per task Step 1).

No file was reset, stashed, cleaned, checked out, restored, or deleted. No branch was deleted. `main` is unchanged at `2d654dd85e60ca5bda9fb39bd8a097ccbe4809ce`. This report (`P01A_ISOLATION_REPORT.md`) is the only other new file added to the original workspace, per the task's requirement to record it "in both the source documentation set and clean worktree documentation set."

## 15. Remaining deployment requirements

Unchanged from `P01A_STABILIZATION_REPORT.md` §11/§12/§15: Vercel Root Directory must be `frontend`; `VITE_API_BASE_URL` must be set; Render's `DATABASE_URL`/`POSTGRES_HOST` must be a known-valid value before deploy (the service now refuses to boot without it); run the post-deployment smoke-test checklist in that report's §16 before considering any P00 incident resolved. This isolation task did not deploy anything and does not change those requirements.

## 16. Rollback/recovery notes

- **Clean branch**: `fix/p01a-stabilization-clean` has 2 local commits, not pushed, not merged into `main`. To discard entirely: remove the worktree (`git worktree remove ../shahriyarkhan-p01a-clean`) and delete the local branch — neither was done as part of this task, and neither should be done without the user's explicit instruction.
- **Quarantined media**: recoverable by moving the 4 files from `../shahriyarkhan-p01a-quarantine/backend/media/projects/{featured,previews}/` back to `backend/media/projects/{featured,previews}/` in the original workspace. Not deleted; awaiting the user's approval for permanent deletion per the task's instructions.
- **Original workspace**: no rollback needed — nothing destructive was done to it.
- **Known caveat on the "type checking passes" completion criterion**: `npx tsc --noEmit` reports 2 errors in `skills.tsx`, an unrelated, untouched, pre-existing-in-HEAD file (§11). This cannot be resolved through hunk isolation because the defect is not caused by any dirty work — it is baked into the committed baseline itself. Fixing it would mean editing a file with no relationship to P01A's stabilization scope, which conflicts with the same task's instruction not to make new product changes or touch unrelated files while porting. This is flagged here rather than silently resolved either way; it was already disclosed as a known, pre-existing issue in `P01A_STABILIZATION_REPORT.md` and does not block local test/build success (the 31+18 test suites and the production build all pass regardless).

## 17. Final recommendation

**Ready for review; not ready to push or deploy.**

The clean branch is internally complete and verified: all 31 backend tests and 18 frontend tests pass, Django's system/migration checks pass, the production build succeeds with correct canonical/robots/sitemap output, `git diff --check` and the secret/binary scans are clean, and direct comparison against `P01A_CHANGE_BOUNDARY.md` confirms no gallery code, premium CSS, stock media, or unrelated documentation leaked in.

It is not ready to push/deploy because (unchanged from `P01A_STABILIZATION_REPORT.md` §18): the fixes have not been verified against a real Render/Vercel deployment, the permanent canonical domain is still undecided, and the CognoRise/InsightBoard authenticity questions are still open with the owner. Per this task's explicit scope, no push, merge, or deploy was performed.
