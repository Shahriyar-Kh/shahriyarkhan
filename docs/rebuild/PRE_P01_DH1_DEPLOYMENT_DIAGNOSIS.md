# PRE-P01-DH1 — Deployment Diagnosis

**Date:** 2026-08-30

This document separates **confirmed facts** (read directly from the repository, Render's own published documentation, or reproducible local evidence) from the **unconfirmed hypothesis** about the PRE-P01 gallery-recovery production incident. No Render dashboard, API, or log access exists in this environment at any point in this engagement — the hypothesis below is not proven, and this document does not claim otherwise.

---

## Confirmed facts

### The pre-hardening `render.yaml`

```yaml
buildCommand: |
  pip install --upgrade pip setuptools wheel
  pip install -r backend/requirements/prod.txt
  python backend/manage.py migrate --settings=config.settings.production
  python backend/manage.py seed_insightboard_project --settings=config.settings.production
  python backend/manage.py collectstatic --noinput --clear --settings=config.settings.production
startCommand: gunicorn config.wsgi:application --chdir backend --bind 0.0.0.0:$PORT
```

This is a plain multi-line string with **no `set -e` (or any other fail-fast option)** anywhere in it. By ordinary, platform-independent POSIX shell semantics, a multi-line script executed without `set -e` does **not** stop when an individual line fails — every line still runs, and only the **exit status of the last command** is what any caller checking "did this script succeed" would see (unless something explicitly checks each line).

### Render's own documented behavior (fetched from `render.com/docs/deploys`, 2026-08-30)

- *"If any command fails or times out, the entire deploy fails. Any remaining commands do not run."* — this describes the **build → pre-deploy → start command sequence** as a whole, not necessarily line-by-line behavior *within* a single multi-line `buildCommand` block.
- *"If the build fails, Render cancels the deploy, and your original service instance continues running without interruption."*

### What is **not** documented (checked, not found)

Render's fetched documentation does not state, one way or the other, whether the shell environment it uses to run a multi-line `buildCommand:` YAML block applies `set -e` (or equivalent) automatically, or whether it is executed as a plain script where only the final line's exit code is checked. A web search for more specific documentation did not surface an authoritative answer either.

### The application-level incident (Step 5 of PRE-P01 RELEASE)

- Immediately after PR #6 merged and Render redeployed, `GET /api/v1/public/portfolio/projects/` and the project-detail endpoint returned **HTTP 500**, reproducibly, across multiple retries over several minutes.
- Every other endpoint checked in the same window (`site/settings`, `experiences`, `services`, `education`, `skills`, `healthz`, the frontend) returned 200 throughout.
- The failure was isolated specifically to the two views built on `ProjectSerializer`, which PR #6 changed to add a nested `images` field and depend on the new `Project.short_description`/`feature_bullets` columns.
- The same code (including the same migration) passed 46/46 backend tests locally and in GitHub Actions CI immediately before merge, against a freshly-migrated SQLite database.
- Reverting the merge commit (PR #7) restored all endpoints to 200 within about a minute of the revert deploying.

## Unconfirmed hypothesis

**Hypothesis:** the `migrate` line in the pre-hardening `buildCommand` did not successfully apply migration `portfolio/0002_...` against the production Postgres database, while the build's later lines (`seed_insightboard_project`, `collectstatic`) still ran and the overall build was still reported as successful — because nothing in the build script would have stopped it from continuing, or signaled failure, after an earlier line's non-zero exit.

**Why this is only a hypothesis, not a proven cause:** no Render build log, deploy log, or database introspection was available in this environment at any point. The isolated failure pattern (only `Project`-serializer endpoints broken, everything else healthy, tests green everywhere migrations *were* confirmed applied) is consistent with a schema/code mismatch, and a missing `set -e` is a plausible mechanism for how that mismatch could occur silently — but no direct evidence (a log line reading "migrate failed", a database query confirming the column's absence, etc.) was ever observed. An equally unconfirmed alternative explanation — some other production-only difference unrelated to migration timing — cannot be fully ruled out from this environment.

**This document does not claim the missing migration was proven.** The fail-fast hardening in this phase (Part D/E below) is justified independent of which specific explanation is correct: an explicit `set -Eeuo pipefail` build script removes the *possibility* of exactly this class of silent-partial-failure, regardless of whether it explains this specific incident.

## Gallery incident timeline (facts, no interpretation)

1. PR #6 (`feat/pre-p01-wip-recovery`) merged into `main` as `51967980c64efc137527681a0338909b5df60da2`.
2. GitHub Actions CI on that merge commit: `success`.
3. Vercel deployment for that commit: `success`.
4. ~5–6 minutes after merge, `GET /api/v1/public/portfolio/projects/` and the project-detail endpoint began returning HTTP 500, reproducibly.
5. All non-`Project`-related endpoints remained healthy throughout.
6. PR #7 (a plain `git revert` of the merge commit, no history rewrite) opened, reviewed, and — on explicit owner authorization — merged as `f731c0a76970fae7f80257fd9216d53627d64a42`.
7. Within about a minute of that merge, the `projects` and project-detail endpoints returned to 200 and stayed stable across repeated checks.
8. No database action (manual or automated) was taken at any point during the incident or its resolution — only application code was reverted.

## Fail-fast behavior implemented in this phase

See `scripts/render-build.sh` (Part D) and the render.yaml change (Part D/E) for the concrete fix: `set -Eeuo pipefail`, an explicit post-migration `manage.py migrate --check` verification step, and removal of the automatic `seed_insightboard_project` call. Full detail in `PRE_P01_DH1_RELEASE_PLAN.md`.

## Rollback plan (for this hardening change itself)

This phase changes only `render.yaml`, `scripts/render-build.sh`, and `backend/apps/core/tests.py` (test additions). No model or migration change is introduced. If the new build script ever misbehaves on Render (e.g. a path or environment assumption that only manifests on Render's actual build image), the rollback is a plain `git revert` of this PR's merge commit, which restores the previous inline `buildCommand:` verbatim — no database action is implicated by that rollback either.
