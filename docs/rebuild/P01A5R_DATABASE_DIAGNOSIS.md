# P01A.5R — Database Diagnosis

**Date:** 2026-08-30

---

## Step 3 — Database provider verification

**Provider: Supabase-hosted PostgreSQL — documented, not merely inferred.**

`readmi.md` (root of the repository) explicitly states, in three separate places:
- `![Database](https://img.shields.io/badge/Database-Supabase-...)` (badge)
- `| Database | Supabase (PostgreSQL) |` (tech stack table)
- A dedicated "### Supabase Connection" section: *"Use Supabase PostgreSQL credentials through DATABASE_URL. Ensure SSL mode is set appropriately for production. Verify connectivity from Render to Supabase host before go-live."*
- The environment-variable reference table lists `DATABASE_URL` as *"Supabase Postgres connection URL"* and `POSTGRES_SSLMODE` as a required companion variable.

`backend/config/settings/base.py` parses `DATABASE_URL` into Django's `DATABASES["default"]` when present, with no provider-specific code (any Postgres-compatible URL would work) — the Supabase-specific detail lives entirely in configuration (the actual `DATABASE_URL` value) and documentation, not in Django code.

| Item | Finding |
|---|---|
| Provider | Supabase-hosted PostgreSQL (documented intent, `DATABASE_URL`-driven) |
| Active/suspended status | Reported by the owner as manually resumed this phase; not independently re-confirmed via Supabase's own dashboard/API (no access available) |
| Is Render configured to connect to it? | Structurally, yes — `render.yaml` sets `DJANGO_SETTINGS_MODULE=config.settings.production`, and `production.py` requires `DATABASE_URL`/`POSTGRES_HOST` to be set or the service refuses to boot (a check that exists only in the unmerged PR #2 — **current `main`'s `production.py` does not have this fail-fast check**, only pre-existing `SECRET_KEY`/`ALLOWED_HOSTS` checks) |
| Structural presence of configuration | Cannot be verified directly (no Render dashboard access; no secret value was read or requested) — inferred entirely from the live application now successfully executing real database queries (§ below), which is only possible if `DATABASE_URL` is both present and valid |

No connection string, password, or other credential value was read, requested, or printed at any point.

## Step 4 — Render log inspection

**Not performed — no access available.** This environment has no Render CLI, no Render API token, and no dashboard session. No build, deployment, or runtime log was inspected. This is stated plainly rather than fabricated or inferred as if it were direct evidence.

**What stands in for it:** the live, external, read-only HTTP behavior of the deployed application (§ Step 2 in `P01A5R_RENDER_RECOVERY_BASELINE.md`) is the only evidence this audit can produce without platform access. It is strong evidence (multiple distinct endpoints, real multi-record data, consistent with the documented schema) but it is *application-level* evidence, not a direct log/platform-level confirmation.

## Step 5 — Safe connectivity verification

**No direct platform tool (Render shell, Django management command run remotely, etc.) was available to run a `SELECT 1` or equivalent.** Instead, the live public API endpoints themselves constitute a real, already-authorized, read-only Django ORM query path — every successful `200` response in §2 required Django to open a database connection, execute a `SELECT`, and serialize real rows (e.g., 6 projects with full technology/relationship data, 3 experience records). This is not a synthetic health check; it is the application's actual data path working end-to-end.

**`DATABASE CONNECTIVITY: PASS`**

This verdict is based on:
1. Seven distinct endpoints across four different Django apps (`portfolio`, `site_config`, `resume_builder`, plus the sitemap view in `core`/`config.urls`) all succeeding.
2. Response bodies containing real, structured, relationally-joined data (e.g., project records including nested `technologies` arrays) — not empty defaults or cached/static fallbacks (the frontend's fallback data lives in the frontend bundle, not behind these backend URLs).
3. This is the **exact same set of endpoints** that returned 500 in every prior check across this entire engagement (P00 on 2026-08-27 through P01A.5 on 2026-08-30, same day, before the Supabase resume) — the reversal is total and consistent across every endpoint, not partial or flaky.

## Root cause conclusion

**The original production incident (P00's finding, still confirmed live at the start of P01A.5) was consistent with a paused/unavailable Supabase database — not a Render misconfiguration, not a code defect, and not something any P01A code fix (merged or not) has addressed.** Resuming the Supabase project appears to have directly resolved it. This is inferred from the before/after application behavior; it is not independently confirmed via a Render log entry showing the specific error message Django encountered while the database was unreachable, since no log access exists.

**No Render configuration was changed. No credential was read, generated, or modified.**
