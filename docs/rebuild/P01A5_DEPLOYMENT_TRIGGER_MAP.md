# P01A.5 — Deployment Trigger Map

**Date:** 2026-08-30
**Question:** if PR #2 is merged into `main`, what happens automatically, per provider?

This is derived from direct evidence (GitHub's Deployments API, check-suite history, and live read-only HTTP checks against the current production URLs), not assumption.

---

## Vercel — auto-production-deploy: **YES, confirmed by direct evidence**

`GET /repos/.../deployments` (environment=`Production`) shows a deployment for every commit that has ever landed on `main`, in order, including the current HEAD:

```
94341e2 (current origin/main HEAD) - Production deployment, created 2026-05-11T17:15:46Z
c3d8391                            - Production deployment
1438ac7                            - Production deployment
2d654dd                            - Production deployment
c67993e                            - Production deployment
```

This is conclusive: **every push to `main` has produced a Vercel Production deployment automatically**, with no manual promotion step observed anywhere in this history. Merging PR #2 **will** auto-deploy to Vercel Production the moment it lands on `main` — there is no staging gate on the Vercel side.

**Live confirmation (read-only, 2026-08-30):** `https://shahriyarkhan.vercel.app/` currently serves `origin/main`'s HEAD commit (`94341e2`) — its CSS bundle contains exactly the `custom_dashbaord_image2.png` reference this phase's fix commit (`5ca1428`) removes, and the raw file itself is directly fetchable (HTTP 200) at `https://shahriyarkhan.vercel.app/images/yangowing_images/custom_dashbaord_image2.png`. **This is a live, currently-active exposure on production today, independent of PR #2** — see the main readiness report for full detail and urgency.

## Render — auto-production-deploy: **YES, per `render.yaml`, but not directly confirmed live**

`render.yaml` defines a single `type: web` service with no `autoDeploy: false` override, which is Render's own default-on behavior for a connected GitHub repository — Render deploys automatically on every push to the configured production branch (`main`, per standard Render project setup; not independently re-confirmed via dashboard access, which this audit does not have). The build command runs `manage.py migrate` unconditionally on every deploy — **a merge will attempt to apply migrations against the production database automatically**, not just redeploy code.

**Live confirmation (read-only, 2026-08-30):** `https://shahriyarkhan.onrender.com/healthz` and the root banner both return `200` — the service is up and boots successfully. Every DB-backed endpoint checked (`/api/v1/public/site/settings/`, `/api/v1/public/portfolio/projects/`, `/api/v1/public/resume/default/`, `/sitemap.xml`) returns **500**, identical to P00's original 2026-08-27 finding. **None of the P01A backend fixes (including the fail-fast DB-config check) are present in `origin/main`'s currently-deployed `production.py`** (verified via `git show origin/main:backend/config/settings/production.py` — only the pre-existing `SECRET_KEY`/`ALLOWED_HOSTS` checks exist, not the `DATABASE_URL`/`POSTGRES_HOST` check P01A added). The live 500s are the **same unresolved incident P00 found**, not a new one, and confirm nothing from P01A has ever reached production.

## GitHub Actions — auto-build: **YES, informational only, no deploy step**

Merging to `main` will trigger `.github/workflows/ci.yml`'s `push: branches: [main]` trigger, running the same two test-only jobs. This workflow contains no deployment step and cannot itself deploy anything.

## Cloudflare — pre-existing, unrelated: **behavior on merge is unconfirmed but unlikely to matter**

A "Workers Builds: shahriyarkhan" check is connected and already fails identically on `main`'s current HEAD (confirmed in P01A.3). Whether it attempts a build on every push is not independently confirmed (no Cloudflare dashboard access), but since it already fails on `main` today with no visible production impact reported anywhere in this repo's history, it is treated as inert with respect to this merge decision.

## Summary table

| Provider | Auto-build? | Auto-preview? | Auto-production-deploy? | Confidence |
|---|---|---|---|---|
| GitHub Actions | Yes | N/A | No (test-only, no deploy job) | Confirmed (workflow file content) |
| Vercel | Yes | Yes (on branches/PRs) | **Yes** | **Confirmed by deployment history** |
| Render | Yes (build) | Unknown | **Likely yes** (`render.yaml` default) | Inferred from config; not dashboard-confirmed |
| Cloudflare | Unconfirmed | Unconfirmed | Unconfirmed, but currently failing/inert | Low — no dashboard access |

**Conclusion: merging PR #2 will almost certainly trigger both a Vercel Production redeploy and a Render production build (including a live `migrate` run) with no manual gate in between**, based on direct historical evidence for Vercel and declared configuration for Render. This must be treated as a real, automatic production release the moment the merge button is clicked — not a staged or reviewable rollout.
