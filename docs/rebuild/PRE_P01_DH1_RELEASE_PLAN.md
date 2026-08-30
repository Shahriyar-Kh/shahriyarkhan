# PRE-P01-DH1 — Release Plan

**Date:** 2026-08-30
**Branch:** `fix/render-deployment-fail-fast`, based on `origin/main` @ `f731c0a76970fae7f80257fd9216d53627d64a42`

---

## What this phase changes

| File | Change |
|---|---|
| `render.yaml` | `buildCommand` now invokes `bash scripts/render-build.sh` instead of an inline, non-fail-fast multi-line block. The automatic `seed_insightboard_project` call is removed. `startCommand` is unchanged. |
| `scripts/render-build.sh` (new) | `set -Eeuo pipefail`, no `set -x`. Runs: upgrade packaging tools → install prod requirements → `manage.py check` (production settings) → `manage.py migrate --noinput` (production settings) → `manage.py migrate --check` (post-migration verification — fails the build if anything is still unapplied) → `manage.py collectstatic --noinput --clear`. |
| `backend/apps/core/tests.py` | 11 new tests: 10 static checks on `render.yaml`/the build script, 1 dynamic execution test proving a simulated migration failure stops the script before `collectstatic` ever runs. |

No `backend/apps/*/models.py` file, and no migration, is touched by this phase.

## Fail-fast behavior (what's actually different now)

Before this phase, a failing `migrate` line inside the plain multi-line `buildCommand` block was not guaranteed to fail the overall build (see `PRE_P01_DH1_DEPLOYMENT_DIAGNOSIS.md` for what is and isn't confirmed about whether that's what actually happened). Now:

1. `set -Eeuo pipefail` means **any** failing command — `pip install`, `manage.py check`, `migrate`, `collectstatic` — immediately stops the script with a non-zero exit code.
2. A dedicated `manage.py migrate --check` step runs *after* the real `migrate`, as an explicit, independent verification that zero migrations remain unapplied — this would catch even a `migrate` that exits 0 but somehow leaves the schema inconsistent (e.g. a partial apply Django itself doesn't consider a hard failure).
3. Per Render's own documented behavior, a failed build cancels the deploy entirely and leaves the previous, already-running instance serving traffic — so a fail-fast build script converts the "code and schema mismatched" incident class into "the deploy simply doesn't happen," rather than "new code goes live against an old schema."

## InsightBoard automatic-seed removal

`seed_insightboard_project` is no longer part of the automatic Render build. InsightBoard CRM is disputed, hidden content (`OPEN_DECISIONS.md` #5 — stock photography, a dead demo link, status unresolved) — routine application deployment must not be the thing that recreates or refreshes it. The management command itself is untouched and fully usable on demand (`python manage.py seed_insightboard_project --settings=config.settings.production`, run manually or via whatever admin tooling the owner prefers) — this phase only removes it from the unattended build path.

**Deployment must not recreate disputed portfolio content automatically.** This principle should hold for any future disputed/unverified content, not just InsightBoard specifically.

## Local quality gates (all run and passing)

| Check | Result |
|---|---|
| `bash -n scripts/render-build.sh` | Pass |
| `manage.py check` | Pass — 0 issues |
| `manage.py makemigrations --check --dry-run` | Pass — "No changes detected" |
| Full backend suite (`portfolio site_config resume_builder core inquiries`) | **49/49 pass** (38 pre-existing + 11 new deployment-safety tests) |
| Frontend: `vitest run` | 35/35 pass (unchanged — no frontend files touched) |
| Frontend: `npm run lint` | 0 errors, 13 pre-existing warnings |
| Frontend: `npx tsc --noEmit` | Clean |
| Frontend: `npm run build` | Succeeds |
| `git diff --check` | Pass |
| Secret scan | Clean (only the test file's own list of *pattern names* to scan for, never a real value) |
| YAML validation (`render.yaml`, `ci.yml`) | Both parse cleanly |

## Rollback plan

A plain `git revert` of this phase's merge commit restores the previous inline `buildCommand:`. No model or migration change is introduced by this phase, so there is no schema-level rollback concern either way.

---

## Part I — Future gallery release: a two-stage plan

The gallery backend recovery (model, migration, admin, serializers, API) remains fully preserved and unmerged on `feat/pre-p01-wip-recovery`. It is **not** reintroduced in this phase. When the owner is ready to release it again, this two-stage approach prevents a repeat of the exact code-before-schema race this phase hardens against — regardless of which specific mechanism caused the original incident.

### Stage 1 — Schema deployment (deploy first, alone)

- Merge and deploy **only** the additive model changes: `Project.short_description`, `Project.feature_bullets`, and the `ProjectImage` model/migration.
- Do **not** include, in the same release, any serializer change that makes `ProjectSerializer`/`AdminProjectSerializer` depend on the new fields. The public API's behavior must be identical before and after this stage — a schema change with zero observable API change.
- After this stage's deploy, **directly verify the migration state** before proceeding — at minimum, confirm the build succeeded (which, with this phase's hardened `render-build.sh`, now means `manage.py migrate --check` already passed as a build gate) and that the public API's response shape is unchanged. If any direct database/log access is available at that time, confirming the new columns/table exist would be additional, stronger evidence — but is not required to safely proceed, since the hardened build already gates on migration success.

### Stage 2 — Application activation (deploy only after Stage 1 is verified)

- Merge and deploy the serializer changes (nested `images`, the two model fields exposed), the `AdminProjectImageViewSet`/`AdminProjectImageSerializer`, and the admin URL registration.
- Because Stage 1's schema is already confirmed live, this stage's code can safely assume the columns/table exist — there is no window where new code and old schema coexist.
- The frontend needs no changes in either stage (see `PRE_P01_WIP_RECOVERY_REPORT.md` — it already ships the complete client side of this feature and was simply waiting on a working backend).

This schema-first ordering is the general pattern this incident argues for on any future release that couples a new column/table to code that immediately depends on it existing — not a rule specific to the gallery feature alone.
