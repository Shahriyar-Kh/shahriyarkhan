# P01A.5 — Rollback Plan

**Date:** 2026-08-30
**Purpose:** Identify rollback paths before any future production release — this phase performs no release and modifies no production data.

---

## Git rollback

**Reference commit:** `94341e22767ce95033a9eb28e97b1f9959b2d0b2` — confirmed still current `origin/main` HEAD as of this phase's re-fetch (Step 1). **Still the correct rollback reference.**

If a future merge of PR #2 needs to be reverted at the Git level: `git revert` the merge commit (creates a new commit undoing the change, safe for a shared branch) rather than a hard reset — `main` has no branch protection today, but a reset would still rewrite shared history other clones may already have pulled (e.g., a future CI checkout, a collaborator).

## Vercel rollback

- **Previous Production deployment exists**: confirmed via the Deployments API — the deployment immediately prior to `94341e2` (for `c3d8391`) is on record with a `success` state, and the full chain back through `2d654dd`/`c67993e` is intact.
- **Instant Rollback / redeploy-previous availability**: Vercel's dashboard "Instant Rollback" feature operates on this same deployment history; since the history is intact and each prior deployment succeeded, rollback is expected to be available through the dashboard. This audit has no Vercel dashboard/API credentials to click through and confirm the UI control itself is enabled, but the underlying prerequisite (a prior successful Production deployment to roll back to) is confirmed present.

## Render rollback

- **Previous deployment history**: not independently confirmed — this audit has no Render dashboard or API access. `render.yaml` does not itself retain deployment history; that lives in Render's own dashboard.
- **Recommendation before any release**: the owner should confirm, via the Render dashboard, that a previous successful deploy is available to redeploy from, before merging PR #2. This is listed as a pre-release action item, not something this audit can verify itself.

## Database

- **New migrations introduced by this candidate**: **none**. `manage.py makemigrations --check --dry-run` was re-run against the final commit (`5ca1428`) and reports "No changes detected" — re-confirmed in this phase, not just carried over from P01A.4.
- **What Render's build will actually run on merge**: `manage.py migrate --settings=config.settings.production` unconditionally (per `render.yaml`). Since this candidate introduces zero schema changes, this run should be a no-op against an already-migrated database — but it does still touch the production database connection on every deploy, which is exactly the step that has been failing (see `P01A5_DEPLOYMENT_TRIGGER_MAP.md` — DB-backed endpoints currently 500 in live production).
- **Backup/snapshot mechanism**: not confirmed. Render's managed Postgres offering typically includes automatic daily backups on paid plans, but this cannot be confirmed without dashboard/billing access this audit does not have. **This is a pre-release action item for the owner**: confirm a recent backup or snapshot exists before any future deploy that touches the database, independent of whether this candidate's own migration is a no-op.
- **No destructive or write operation was performed against any database in this phase.**

## Summary

| Layer | Rollback path | Confirmed? |
|---|---|---|
| Git | `git revert` the merge commit; `94341e2` is the correct pre-release reference | Yes |
| Vercel | Instant Rollback / redeploy previous Production build | Prerequisite (prior successful deploy) confirmed; UI control itself not independently verified |
| Render | Redeploy previous successful build | Not confirmed — no dashboard access; owner action item |
| Database | No migration risk from this candidate; backup/snapshot availability unconfirmed | Migration risk: none. Backup existence: unconfirmed, owner action item |
