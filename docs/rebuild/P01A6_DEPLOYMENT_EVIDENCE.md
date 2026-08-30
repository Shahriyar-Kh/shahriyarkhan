# P01A.6 — Deployment Evidence

**Date:** 2026-08-30

---

## Merge

| Item | Value |
|---|---|
| PR merged | #2, `fix/p01a-stabilization-integrated` → `main` |
| Merge method | Normal merge commit (repository allows merge/squash/rebase; merge commit chosen for a clear standalone rollback boundary, per instruction) |
| PR head at merge time | `6bdc1e4406790546624e373f413e5f9476e54712` — verified identical to the frozen baseline immediately before the merge API call |
| Merge commit SHA | `b8ecbf2332aa581f780dd185068da8ae5b943f20` |
| New `main` SHA | `b8ecbf2332aa581f780dd185068da8ae5b943f20` |
| Merge timestamp | `2026-08-30T09:59:01Z` |
| PR #1 | Untouched — confirmed `state: OPEN`, `isDraft: true` immediately after the merge |

## GitHub Actions (post-merge)

Run `33305350671`, `push` event, tested SHA `b8ecbf2332aa581f780dd185068da8ae5b943f20`: **success**.

## Vercel

| Item | Value |
|---|---|
| Deployment triggered | Yes — automatically, 17 seconds after merge |
| Deployment ID | `6165448200` |
| Environment | `Production` |
| Source ref | `b8ecbf2332aa581f780dd185068da8ae5b943f20` — matches the merge commit exactly |
| Status | `success` |
| Deployment URL | `https://shahriyarkhan-3wa7ot7tn-shahriyar-khans-projects-dbef3e31.vercel.app` |
| Production alias behavior | Confirmed live at `https://shahriyarkhan.vercel.app` — see `P01A6_PRODUCTION_SMOKE_REPORT.md` |

## Render

| Item | Value |
|---|---|
| Check-suite | `app: Render`, `status: queued`, `conclusion: null` — remained in this state throughout observation (consistent with every prior phase's finding: Render's GitHub integration registers a check-suite but never posts detailed check-run status back to GitHub, regardless of actual deployment activity) |
| Source SHA | Not independently confirmable via any GitHub-visible field (no check-run, no deployment object was found for Render) |
| **Deployment confirmed via external application behavior instead:** `POST /api/v1/public/resume/<nonexistent-slug>/download-track/` → **404** (was previously an unhandled 500 under the pre-P01A code; this specific fix only exists in the code merged this phase). This is conclusive, safe, non-destructive proof that Render rebuilt and redeployed the new backend code — not an assumption. |

## Cloudflare

`Workers Builds: shahriyarkhan` — `conclusion: failure`. **Classified as an unrelated, pre-existing, inert integration**, per instruction not to let it invalidate the release unless it actually serves required production traffic. It has failed identically on every commit checked across every phase of this entire engagement (including `main`'s state before any P01A work began), and no evidence anywhere in this repository or its history indicates Cloudflare Workers/Pages serves any part of the live, actually-used production traffic (Vercel and Render are the two providers observed serving real requests throughout every phase of this engagement).

## Timing note (Step 6)

Vercel's deployment completed and was independently confirmed live (via direct HTTP checks) within roughly 10 minutes of the merge. Render's deployment could not be timed precisely (no directly observable start/end timestamp), but the résumé download-track differentiator check (above) confirms it completed successfully by the time backend verification was performed, several minutes after the merge. **Both providers deployed from the same merge event; they were not sequenced by any mechanism in this repository** — this report records their actual, independently-observed timing rather than assuming an ordering.
