# CF-H2 — Release Baseline

**Date:** 2026-08-30

---

## Pre-release state (Step 1)

| Item | Value |
|---|---|
| `origin/main` (pre-release) | `b8ecbf2332aa581f780dd185068da8ae5b943f20` (matched expected) |
| PR #5 head | `276b451366a01dab9a741a780d85b04dc3d007f1` (matched expected) |
| PR #5 state | `OPEN`, not draft |
| PR #5 mergeable | `MERGEABLE` |
| Ahead/behind vs `origin/main` | 0 behind, 2 ahead (no drift) |
| Exact-head CI (run `33314928920`) | `success` — Backend (Django) pass, Frontend (Vite/React) pass |
| Changed-file scope | Exactly the 7 expected files: `.github/workflows/ci.yml`, `backend/apps/inquiries/api/serializers.py`, `backend/apps/inquiries/tests.py`, and the 4 `CFH1_*.md` docs |
| PR #4 | `OPEN`, not draft (untouched) |
| PR #1 | `OPEN`, draft (untouched) |

## Anomaly noted, not a stop condition

A GitHub check named **"Workers Builds: shahriyarkhan"** (a Cloudflare Workers build, unrelated to this project's actual Render+Vercel deploy stack) shows `fail` on PR #5. This same check was confirmed **already failing identically** on the already-merged, already-verified-healthy PR #2 and PR #3. It is a pre-existing, unrelated integration — not a regression introduced by this hotfix, and not enforced (`main` carries no branch protection rules: `GET /branches/main/protection` → 404 "Branch not protected"). Not treated as a release blocker.

## Rollback state (Step 2)

- **Pre-release `main` SHA:** `b8ecbf2332aa581f780dd185068da8ae5b943f20`
- **Rollback mechanism:** `git revert` of the merge commit, or redeploy of the pre-release SHA on Render/Vercel. No migration is introduced by this hotfix, so there is no schema-level rollback concern.
- **Pre-release production health** (read-only, all confirmed before merge):

| Check | Result |
|---|---|
| Backend `/healthz` | 200 (11.9s — Render free-tier cold start, not an error) |
| `/api/v1/public/site/settings/` | 200 |
| `/api/v1/public/portfolio/projects/` | 200 |
| Frontend `/` | 200 |
| Frontend `/about` | 200 |
| Frontend `/projects` | 200 |
| Contact endpoint (`GET`, route-existence only) | 405 (correct — `CreateAPIView` rejects `GET`) |
| Service-request endpoint (`GET`, route-existence only) | 405 |
| Migrations pending | None (`makemigrations --check --dry-run` — no changes) |

Database confirmed healthy via DB-backed endpoints (`projects`, `settings`) returning 200. P01A production stabilization confirmed healthy. No database backup was performed or required, per the hotfix's zero-migration scope.
