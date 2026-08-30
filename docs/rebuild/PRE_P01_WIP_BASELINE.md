# PRE-P01 — Original Workspace WIP Baseline

**Date:** 2026-08-30

This document is a **read-only snapshot**. No command that modifies the original workspace was run to produce it.

---

## Original workspace (read-only source)

- **Path:** `D:/Django Projects/shahriyarkhan-portfolio`
- **Branch:** `main`
- **HEAD:** `2d654dd85e60ca5bda9fb39bd8a097ccbe4809ce`
- **Distance to `origin/main`:** 26 commits behind, 0 ahead (`git rev-list --left-right --count HEAD...origin/main` → `0	26`)

### Complete porcelain status

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

21 modified, 1 deleted, 26 untracked entries (the untracked `docs/` entry is a directory containing 10 files, enumerated below).

### Tracked diff stat

```
 .../commands/seed_insightboard_project.py          |  40 +-
 .../management/commands/seed_portfolio_data.py     |  31 +-
 backend/apps/portfolio/admin.py                    |  40 +-
 backend/apps/portfolio/api/admin_urls.py           |   2 +
 backend/apps/portfolio/api/serializers.py          |  10 +-
 backend/apps/portfolio/api/views.py                |  24 +-
 backend/apps/portfolio/models.py                   |  57 +++
 backend/apps/resume_builder/api/views.py           |  14 +-
 backend/config/settings/base.py                    |   6 +
 backend/config/settings/production.py              |  11 +
 backend/config/urls.py                             |   4 +-
 frontend/index.html                                |   6 +-
 frontend/package-lock.json                         | 403 ++++++++++++++++++---
 frontend/package.json                              |   6 +-
 frontend/src/App.tsx                               |  25 +-
 frontend/src/components/AdminProjectForm.tsx       |  28 +-
 frontend/src/lib/seo.ts                            |  47 ++-
 frontend/src/routes/index.tsx                      |  41 ++-
 frontend/src/routes/projects.$slug.tsx             |  36 +-
 frontend/src/routes/projects.tsx                   |   2 +-
 frontend/src/styles-premium-enhancements.css       | 250 +++++++++++++
 vercel.json                                        |  10 -
 22 files changed, 975 insertions(+), 118 deletions(-)
```

### Untracked `docs/` directory contents (10 files, all pre-dating this engagement's later phases)

```
docs/rebuild/CONTENT_TRUTH_INVENTORY.md
docs/rebuild/DATA_MODEL_INVENTORY.md
docs/rebuild/MEDIA_INVENTORY.csv
docs/rebuild/OPEN_DECISIONS.md
docs/rebuild/P00_EVIDENCE_FREEZE.md
docs/rebuild/P01A_CHANGE_BOUNDARY.md
docs/rebuild/P01A_ISOLATION_REPORT.md
docs/rebuild/P01A_STABILIZATION_REPORT.md
docs/rebuild/P01_HANDOFF.md
docs/rebuild/ROUTE_MIGRATION_MAP.csv
```

### Untracked file line counts

| File | Lines |
|---|---|
| `00_START_HERE.md` | 306 |
| `BATCH_1_COMPLETION_REPORT.md` | 382 |
| `BATCH_1_IMPLEMENTATION_SUMMARY.md` | 277 |
| `IMPLEMENTATION_CODE_GUIDE.md` | 550 |
| `PREMIUM_UI_ENHANCEMENT_PLAN.md` | 400 |
| `VISUAL_QA_CHECKLIST.md` | 91 |
| `testing.py` | 4 |
| `backend/apps/core/tests.py` | 136 |
| `backend/apps/portfolio/migrations/0002_project_feature_bullets_project_short_description_and_more.py` | 45 |
| `backend/apps/portfolio/tests.py` | 166 |
| `backend/apps/resume_builder/tests.py` | 72 |
| `backend/apps/site_config/tests.py` | 35 |
| `frontend/public/robots.txt` | 4 |
| `frontend/public/sitemap.xml` | 29 |
| `frontend/src/components/ProjectImageGallery.tsx` | 148 |
| `frontend/src/lib/apiEndpoints.test.ts` | 9 |
| `frontend/src/lib/apiEndpoints.ts` | 10 |
| `frontend/src/lib/routeMatch.test.ts` | 43 |
| `frontend/src/lib/routeMatch.ts` | 37 |
| `frontend/src/lib/site.test.ts` | 26 |
| `frontend/src/lib/site.ts` | 20 |
| `frontend/src/metadata.test.ts` | 16 |
| `frontend/src/routes/contentVisibility.test.ts` | 53 |
| `frontend/vercel.json` | 10 |
| `frontend/vitest.config.ts` | 16 |

### Gitignored files present but correctly untracked (not read)

`backend/.env`, `frontend/.env.production` — confirmed present on disk via a directory listing only; contents were never opened.

---

## Clean current-main workspace (implementation destination)

- **Path:** `D:/Django Projects/shahriyarkhan-current-main`
- **HEAD (at baseline capture):** `aa7ebc5c53234ffebafdeb1d6915295f27c74725`
- **Status:** clean (`nothing to commit, working tree clean`)

## Latest `origin/main`

`aa7ebc5c53234ffebafdeb1d6915295f27c74725` — fetched from a worktree other than the original workspace; no fetch/pull was ever run inside the original workspace itself.

## Preservation guarantee

The original workspace must remain byte-for-byte identical to the snapshot above throughout this entire task. See `PRE_P01_WIP_RECOVERY_MATRIX.md` for the file-by-file classification, and the final report's "Step 8" confirmation for the post-task re-verification.
