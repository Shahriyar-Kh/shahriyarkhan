# P01A.6 — Release Baseline

**Date:** 2026-08-30
**Purpose:** Final freeze immediately before merging PR #2, per Step 1. Read-only fetch only.

---

## State as fetched

| Item | Value |
|---|---|
| `origin/main` SHA | `75b708181cdc52dd2bd62ca477d19c4b4c8fea3d` — matches expected exactly |
| PR #2 head | `6bdc1e4406790546624e373f413e5f9476e54712` — matches expected exactly |
| PR #2 base | `75b708181cdc52dd2bd62ca477d19c4b4c8fea3d` — matches current `main` exactly |
| PR state | `OPEN` |
| Draft state | `true` — will be marked ready for review as a prerequisite to merging (GitHub does not permit merging a draft PR directly); this is a metadata action, not itself the merge |
| Mergeable | `MERGEABLE` |
| Ahead/behind (`origin/main...PR#2`) | 0 behind, 9 ahead |
| Final-head GitHub CI | Both `push`- and `pull_request`-triggered runs: `success` |
| Current production DB endpoint health | `/healthz` → 200 (one initial transient connection blip, resolved on immediate retry — consistent with a sandboxed-network hiccup, not a backend issue); `/api/v1/public/site/settings/` → 200 |
| Current sensitive-asset absence | Confirmed absent from both the live production site (`https://shahriyarkhan.vercel.app/images/yangowing_images/custom_dashbaord_image2.png` → 404, via the already-deployed PR #3 hotfix) and PR #2's final tree (`git cat-file -e` on `origin/fix/p01a-stabilization-integrated` confirms the path does not exist) |

## Rollback targets (Step 2, frozen before merge)

| Layer | Target |
|---|---|
| Git | Pre-release `main`: `75b708181cdc52dd2bd62ca477d19c4b4c8fea3d` |
| Vercel | Current Production deployment: id `6163737159`, ref `75b708181cdc52dd2bd62ca477d19c4b4c8fea3d`, state `success`, URL `https://shahriyarkhan-jpqd10hlw-shahriyar-khans-projects-dbef3e31.vercel.app`. Prior Production deployment (one further back): id `4650936187`, ref `94341e22767ce95033a9eb28e97b1f9959b2d0b2` — both on record and available as redeploy targets. |
| Render | **`ROLLBACK PARTIALLY CONFIRMED`** — no Render dashboard/API/CLI access is available in this environment (confirmed absent, consistent with every prior phase); no capability is invented. Render's own dashboard "redeploy previous build" is the standard mechanism, per its documented behavior, but this cannot be independently verified without access. |
| Database | PR #2 introduces zero migrations (re-confirmed fresh: `makemigrations --check --dry-run` → "No changes detected"). Database confirmed currently reachable (`/healthz` 200, `/api/v1/public/site/settings/` 200). No database modification of any kind performed or planned. |

## Verdict

**All required preconditions hold. No unexpected drift. Proceeding to Step 3 (final privacy gate) and the release.**
