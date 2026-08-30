# P01A.2 — Release Candidate Quality Gate

**Date:** 2026-08-30
**Branch:** `fix/p01a-stabilization-clean`
**Scope:** Clear the last local quality-gate failure (the pre-existing `skills.tsx` TypeScript errors), add CI, re-verify every local gate, and prepare the branch as a draft-PR release candidate. No redesign, no gallery feature, no deployment.

---

## 1. TypeScript root causes

`npx tsc --noEmit` reported two errors, both on `frontend/src/routes/skills.tsx:226`:

```
src/routes/skills.tsx(226,41): error TS2339: Property 'order' does not exist on type '{ name: string; level: number; }'.
src/routes/skills.tsx(226,55): error TS2339: Property 'order' does not exist on type '{ name: string; level: number; }'.
```

**Confirmed pre-existing and unrelated to any dirty work** (per `P01A_ISOLATION_REPORT.md` §11): `git show HEAD:frontend/src/routes/skills.tsx` at the original committed baseline (`2d654dd`) contains the identical defect with zero uncommitted changes on top of it. It is not caused by the gallery feature or any premium-UI experiment — it is baked into the committed history this branch was created from.

**Root cause:** inside `SkillsPage()`'s `categories` `useMemo`, a `Map` was declared as:

```ts
const grouped = new Map<string, SkillCategory & { skills: { name: string; level: number; order: number }[] }>();
```

This intends to add a temporary `order` field to each skill (needed to sort skills within a category) by intersecting the existing `SkillCategory` interface (whose `skills` field is `{ name: string; level: number }[]`, with no `order`) with an inline type carrying `order`. TypeScript does not reliably resolve an intersection of two array types with a conflicting element shape into a single combined element type for *contextual inference of an arrow-function callback's parameters*. When the later code called `.sort((left, right) => left.order - right.order || ...)` on `category.skills`, TypeScript picked `SkillCategory`'s original (order-less) `skills` element type for `left`/`right`'s inferred type, not the richer intersected one — hence `left.order`/`right.order` both failed with "Property 'order' does not exist."

## 2. Exact fix

Replaced the ambiguous intersection with two small, explicit, unambiguous local types scoped to the `useMemo` callback:

```ts
type GroupedSkill = { name: string; level: number; order: number };
type GroupedCategory = { title: string; slug: string; order: number; skills: GroupedSkill[] };
const grouped = new Map<string, GroupedCategory>();
```

No other line in the function changed. This is a pure type-level correction:

- No `any`.
- No `@ts-ignore` / `@ts-expect-error`.
- No change to `tsconfig.json` strictness settings.
- No exclusion of `skills.tsx` from the TypeScript project.
- **Zero runtime behavior change** — the objects constructed, sorted, and rendered are byte-for-byte identical at runtime; only the compile-time type describing the temporary grouping structure was corrected to accurately reflect what the code already does (carry a per-skill `order` through the grouping step, then strip it in the final `.map()` before returning `SkillCategory[]`). Per the task's own instruction ("add or update a focused test only if runtime behavior changes"), no new test was added, since behavior is unchanged and the existing 18-test suite (which does not directly exercise `SkillsPage`, per `P01A_STABILIZATION_REPORT.md` §8) continues to pass unmodified.

## 3. CI workflow design

`.github/workflows/ci.yml` — inspected the repository's own declared runtime/dependency configuration before choosing versions:

- **Python 3.11** — matches `render.yaml`'s `pythonVersion: 3.11` (the actual pinned production runtime), not the 3.13 used for local P01A development, since CI should mirror what actually ships.
- **Node 22** — matches `frontend/package.json`'s `"engines": { "node": ">=22.12.0" }`.
- **Backend dependency source**: `backend/requirements/prod.txt` (which `-r`s `base.txt`) — the same file `render.yaml`'s real build command installs from, and the same file used for every local P01A verification run.
- **Frontend dependency install**: `npm ci` against `frontend/package-lock.json` — reproducible, not `npm install`.
- **No `VITE_API_BASE_URL` is set.** `frontend/src/lib/api.ts` already has an established safe fallback (`import.meta.env.VITE_API_BASE_URL?.replace(...) ?? ""`), so the build succeeds with same-origin-relative API paths with no invented or committed value.
- **Test database**: `USE_SQLITE=1`, matching every local backend test run this phase and prior — never the live Render Postgres database, never a production migration.
- **`DJANGO_SECRET_KEY`**: a hardcoded, clearly-labeled, non-secret placeholder string (`ci-placeholder-secret-key-not-for-production`) — needed only because `config.settings.base` has a value-checked default; it is a literal string committed to the workflow file, not a GitHub Secret, and is never used against `config.settings.production`.
- **Permissions**: workflow-level `permissions: contents: read` only — no job needs to write to the repository, so no broader/job-level permission was added.
- **Concurrency**: `group: ci-${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true` — superseded runs on the same branch/PR are cancelled.
- **Triggers**: `pull_request` targeting `main`, `push` to `main`, and manual `workflow_dispatch` — exactly as specified, nothing broader (no `pull_request_target`, no wildcard branches).
- **Two jobs, both test-only**: `backend` (Django check → migration-check → 31 tests) and `frontend` (`npm ci` → vitest → lint → `tsc --noEmit` → build). **No deployment job exists or was added.**
- **No `continue-on-error` anywhere**; every step is a required gate. No step is skipped, disabled, or weakened.
- **Actions used**: only `actions/checkout@v4`, `actions/setup-python@v5`, `actions/setup-node@v4` — official GitHub actions, pinned to major-version tags (no repository CI existed previously to establish a stricter SHA-pinning policy; major-version tags are the standard, widely-used convention for this action set and were chosen as the least-surprising default). No third-party actions were introduced.

## 4. Local commands and results (this phase)

| Command | Result |
|---|---|
| `npx tsc --noEmit` (frontend) | **0 errors** (previously 2) |
| `npx vitest run` (frontend) | **18/18 pass** |
| `npm run lint` (frontend) | **0 errors**, 13 pre-existing warnings (unchanged, all `react-refresh/only-export-components`) |
| `npm run build` (frontend) | **Pass** — 1746 modules; `dist/index.html` canonical/JSON-LD both `https://shahriyarkhan.vercel.app`; `dist/sitemap.xml` excludes InsightBoard CRM (only appears inside the file's own explanatory comment, not as a `<url>` entry); zero occurrences of `shahriyarkhan.dev` anywhere in `dist/` |
| `manage.py check` (backend, `USE_SQLITE=1`) | **Pass** |
| `manage.py makemigrations --check --dry-run` | **Pass** — "No changes detected" |
| `manage.py test apps.portfolio apps.site_config apps.resume_builder apps.core` | **31/31 pass** |
| `git diff --check` | **Pass** — no conflict markers, no whitespace errors |
| Secret-pattern scan (AWS keys, private-key headers, `sk-`/`xox`/`ghp_` tokens, inline `SECRET_KEY`/`PASSWORD` literals) on `skills.tsx` and `ci.yml` | **Clean** |
| Binary-file scan on the same changed files | **Clean** — no binaries |
| Search for `shahriyarkhan.dev` outside `docs/`/negative-assertion tests | Found only in `backend/apps/core/tests.py`, `frontend/src/lib/site.ts`/`site.test.ts`, `frontend/src/metadata.test.ts` — all of these *name* the domain only to assert its absence from real output; zero occurrences in any file that renders public content |
| Search for the 4 quarantined stock-image filenames | **None found** anywhere in the clean worktree |
| `ProjectImageGallery.tsx` presence check | **Absent**, confirmed |
| Gallery migration (`0002_...`) presence check | **Absent**, confirmed (also implied by the passing "no changes detected" migration check) |
| `styles-premium-enhancements.css` diff vs. baseline `2d654dd` | **Empty** — confirmed zero modification on this branch |
| Unrelated root documents (`00_START_HERE.md`, `BATCH_1_*`, `IMPLEMENTATION_CODE_GUIDE.md`, `PREMIUM_UI_ENHANCEMENT_PLAN.md`, `VISUAL_QA_CHECKLIST.md`, `testing.py`) | **Absent**, confirmed |
| CognoRise public-rendering check | Covered by the existing, still-passing `contentVisibility.test.ts` (absent from `experienceItems`, present only in the separately-exported, non-deleted `hiddenExperienceItemsPendingVerification`) |
| InsightBoard non-public check | Covered by the existing, still-passing `HiddenDisputedContentExclusionTests` (backend: excluded from public list/detail, present in `Project.objects.all()`) and `contentVisibility.test.ts` (frontend: absent from every fallback data source) |
| Sitemap exclusion of InsightBoard | Confirmed directly in `dist/sitemap.xml` (build output) and by `SitemapXmlTests.test_excludes_draft_project_and_service` |
| Canonical origin check | Confirmed `https://shahriyarkhan.vercel.app` in both `dist/index.html` (canonical link + JSON-LD `url`) and `dist/robots.txt` |

## 5. Final branch contents (this phase's changes)

- `frontend/src/routes/skills.tsx` — the type-only fix in §2.
- `.github/workflows/ci.yml` — new.
- `docs/rebuild/P01A_ISOLATION_REPORT.md` — carried over from the prior isolation task (previously written but left uncommitted; folded into this phase's documentation commit).
- `docs/rebuild/P01A_RELEASE_CANDIDATE.md` — this file, new.

No gallery code, no premium-UI experiment, no stock media, and no unrelated root documents were added — all confirmed absent in §4.

## 6. Security checks

- No secrets, tokens, or credential values appear in `ci.yml` or `skills.tsx` (§4 secret-pattern scan).
- `DJANGO_SECRET_KEY` in the workflow is a literal, clearly-labeled placeholder string, not sourced from GitHub Secrets, and is never used against production settings.
- CI never connects to the live Render Postgres database and never runs `migrate` against any real database — only `makemigrations --check --dry-run` (a read-only consistency check) against an in-memory SQLite test database.
- No production deployment job exists in the workflow.
- Workflow permissions are `contents: read` only, at the workflow level, with no job requesting anything broader.
- No TypeScript, ESLint, Django, or security-relevant settings were weakened anywhere in this phase (`tsconfig.json`, `eslint.config.*`, and every Django settings file are unchanged except the already-existing P01A fail-fast/canonical-URL settings from the prior phase).

## 7. Deployment exclusions

This phase performed no deployment of any kind. Not pushed to `origin` as part of writing this document (push happens in a later, explicit step of this task after every local gate re-passes). No Vercel or Render deployment was triggered, configured, or promoted.

## 8. Remaining manual deployment steps

Unchanged from `P01A_STABILIZATION_REPORT.md` §11/§12/§15 and `P01A_ISOLATION_REPORT.md` §15 — repeated here for a single reference point:

1. Confirm the Vercel project's **Root Directory is `frontend`**.
2. Confirm Vercel **Build Command** (`npm run build`, per `frontend/vercel.json`) and **Output Directory** (`dist`).
3. Confirm Render's root/build/start commands match `render.yaml` exactly (no dashboard drift).
4. Confirm Render's `DATABASE_URL` (or `POSTGRES_HOST` + friends) is set to a **known-valid** value — the service will refuse to boot without it (the P01A fail-fast check now enforces this).
5. Confirm `ALLOWED_HOSTS`/`CORS_ALLOWED_ORIGINS`/`CSRF_TRUSTED_ORIGINS` are set correctly for the real production domains.
6. Confirm the migration strategy (`migrate` runs on every Render build, unchanged).
7. Confirm the health-check path (`/healthz`, unchanged, does not touch the database).
8. Run the full post-deployment smoke-test checklist in `P01A_STABILIZATION_REPORT.md` §16 before considering any P00 incident resolved.

## 9. Rollback reference

- **This branch**: 4 local commits total after this phase (`79eaab5`, `14a9596` from the isolation task, plus the two created this phase — see the branch's own `git log` for current hashes). Nothing has been pushed, merged, or force-modified; the branch can be deleted locally with no effect on `main` or the original dirty workspace.
- **CI**: additive only (`.github/workflows/ci.yml`); merging it does not change any runtime behavior or deployment configuration.
- **Vercel/Render rollback**: unchanged from `P01A_STABILIZATION_REPORT.md` §17 — use each platform's dashboard "redeploy previous build" / "instant rollback" if a future deploy based on this branch needs to be reverted.
- **Original dirty workspace**: untouched by this phase; still on `main` at `2d654dd85e60ca5bda9fb39bd8a097ccbe4809ce` with all pre-existing uncommitted work intact.

## 10. Readiness verdict

**Ready to push and open as a draft PR. Not ready to merge or deploy.**

Every local quality gate this phase re-ran passes: TypeScript (0 errors, previously 2), 31 backend tests, 18 frontend tests, lint, Django checks, migration-consistency check, production build, `git diff --check`, and every content/secret/binary verification. The branch remains free of gallery code, premium-UI experiments, stock media, and unrelated documentation. Merging still requires the same unresolved items as before: real-deployment verification of the P01A fixes, the permanent canonical-domain decision, and owner sign-off on CognoRise/InsightBoard's authenticity — none of which are technical blockers to opening a draft PR for review and CI verification, but all of which must be resolved before a merge or production deploy.
