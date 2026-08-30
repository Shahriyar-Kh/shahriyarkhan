# PRE-P01-G1 — Gallery Stage 1: Schema Foundation

**Date:** 2026-08-30
**Branch:** `feat/pre-p01-gallery-schema-stage1`, based on `origin/main` @ `f3aa3e8fdcc7c43c719728dfba6a61ce81335422`

**STAGE 1 — SCHEMA ONLY.** Public API behavior is unchanged. Frontend is unchanged. No gallery API is activated. No data is seeded. Stage 2 (activating serializers, the admin gallery API, and the existing frontend integration) follows only after this schema is verified live in production and the owner authorizes it separately.

---

## What this stage adds

Recovered as source evidence from the preserved `feat/pre-p01-wip-recovery` branch, re-implemented fresh against current `main` (not cherry-picked):

- `Project.short_description` (`CharField`, `max_length=500`, `blank=True`)
- `Project.feature_bullets` (`JSONField`, `default=list`, `blank=True`)
- `ProjectImage` model: FK to `Project` (`on_delete=CASCADE`, `related_name="images"`), `image`, `image_type` (choices: detail/preview/gallery), `alt_text`, `caption`, `display_order`, `is_featured`; ordered by `(display_order, -created_at)`; `unique_together = (("project", "image"))`.
- Migration `portfolio/0002_project_feature_bullets_project_short_description_and_more` — generated fresh by `manage.py makemigrations` against current `main`'s migration state (depends only on `0001_initial`, the only prior migration on `main`), not copied from the old branch's stale migration file.

## A scope expansion, found and fixed, documented as instructed

The task's explicit changed-file boundary named only `models.py`, one migration, tests, and docs — "possibly admin/model import adjustments only if strictly required." This stage also modifies **`backend/apps/portfolio/api/serializers.py`**, and here is the justification, per the instruction to "stop and justify before proceeding" on any scope expansion:

**The finding:** `ProjectSerializer` and `AdminProjectSerializer` both use `Meta.fields = "__all__"`. This is DRF's dynamic, model-introspecting field mode — it does not freeze a field list at some point in the past; every time either serializer runs, it reflects whatever fields currently exist on the `Project` model. Empirically verified via a throwaway shell script before any serializer change: adding `short_description`/`feature_bullets` to the model, with **zero** serializer changes, immediately made both fields appear in both the public and admin API responses.

This directly contradicts this stage's explicit, "critical" requirement: *"Public API behavior must remain unchanged after Stage 1... Do not expose: short_description; feature_bullets... through public serializers yet."* Leaving `fields = "__all__"` as-is would not be neutral — it would be an immediate, silent contract break the moment this migration reaches production, indistinguishable in kind from the exact incident (PR #6) this whole Stage 1/Stage 2 split exists to prevent.

**The fix:** both serializers now declare `exclude = ("short_description", "feature_bullets")` instead of `fields = "__all__"`, with an inline comment explaining why. This is not "gallery activation" — it is the opposite: an explicit guard keeping the two new columns hidden from every API surface until Stage 2 deliberately removes it. `images` (the `ProjectImage` reverse relation) required no such guard: a reverse FK accessor is never auto-included by `fields = "__all__"`, confirmed empirically alongside the other two fields.

**Verified:** re-ran the same throwaway script after the fix — `short_description`, `feature_bullets`, and `images` are all absent from both serializers' output. The full field set returned by the public detail endpoint was captured and is now enforced by `test_project_detail_field_set_is_exactly_stage_0` (an exact-set equality test, not just an absence check), so any future accidental field addition — from this schema or an unrelated one — will fail this test immediately rather than reaching production silently.

## Schema safety

- `short_description`: no explicit `default=` in the field definition, but Django's migration framework supplies an implicit empty-string backfill for `CharField`/`TextField` columns that are not nullable and have no explicit default (confirmed via `sqlmigrate` in the earlier recovery phase, and again here) — the six existing production `Project` rows need no manual edit.
- `feature_bullets`: explicit `default=list` — backfills to `[]` for existing rows.
- `ProjectImage`: a brand-new child table; adding it has no effect on any existing `Project` row's validity.
- No `NOT NULL` field without a safe default/backfill is introduced anywhere in this migration.

## Tests added

`backend/apps/portfolio/tests.py` — 13 new tests across two classes:

- `GalleryStage1PublicApiContractTests` (6): project list/detail still work; the detail response's field set is *exactly* the frozen Stage-0 set; list and detail responses don't expose `short_description`/`feature_bullets`/`images`; the six-project/InsightBoard-hiding visibility mechanism is unaffected.
- `ProjectImageSchemaStage1Tests` (7): existing-style `Project` creation stays valid with the new columns defaulting correctly; `short_description`/`feature_bullets` accept values at the model layer; `ProjectImage` relates to `Project` via `related_name="images"`; ordering by `display_order`; cascade delete; and an explicit proof that the Stage 2 admin endpoint (`/api/v1/admin/portfolio/project-images/`) does not exist yet (404).

## Validation results

| Check | Result |
|---|---|
| `manage.py check` | Pass |
| `manage.py makemigrations --check --dry-run` | Pass — "No changes detected" |
| `manage.py migrate --plan` | Confirmed the new migration is the only new operation, correctly ordered |
| Full local migration from current schema | Applies cleanly |
| `apps.portfolio` suite | **28/28 pass** (16 pre-existing + 12 new) |
| Full backend suite (`portfolio site_config resume_builder core inquiries`) | **62/62 pass** (49 pre-existing + 13 new) |
| Frontend: `npm ci`, `vitest run` (35/35), `lint` (0 errors), `tsc --noEmit`, `npm run build` | All clean — no frontend files touched |
| `git diff --check` | Pass |
| Secret scan | Clean |
| Sensitive-content scan | Clean — no Yango screenshot reference, no InsightBoard data (only the test's own hidden-content check, which references the name to prove it's excluded, not to expose it) |
| Tracked binary/media files | None |

## Changed files

- `backend/apps/portfolio/models.py`
- `backend/apps/portfolio/api/serializers.py` (justified above)
- `backend/apps/portfolio/migrations/0002_project_feature_bullets_project_short_description_and_more.py` (new)
- `backend/apps/portfolio/tests.py`
- `docs/rebuild/PRE_P01_G1_SCHEMA_STAGE1_REPORT.md` (new, this file)

No frontend file. No `render.yaml`/deployment-config change. No serializer, view, or admin change activating any part of the gallery API surface — the one serializer change made is a suppression, not an activation.

## Deployment evidence plan (for the production-verification phase)

No Render dashboard, API, or database log access exists in this environment. Per the hardened build path (`scripts/render-build.sh`, active since PRE-P01-DH2), the strongest available evidence for "the migration actually applied" is:

1. The Render build itself succeeding — under the hardened script, `manage.py migrate --check` runs as an explicit post-migration gate; a build that completes successfully is direct evidence that check passed.
2. The application serving healthy responses afterward, with the public API contract test (`test_project_detail_field_set_is_exactly_stage_0`) having already proven what "unchanged" means in this codebase's own CI before merge.

No claim of direct database inspection will be made unless such access genuinely becomes available.
