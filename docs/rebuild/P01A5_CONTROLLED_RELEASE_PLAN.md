# P01A.5 — Controlled Production Release Plan (Not Executed)

**Date:** 2026-08-30
**Status: PLANNED ONLY. Nothing in this document has been executed by P01A.5.** Execution is explicitly reserved for a separately authorized `P01A.6 — Controlled Production Release and Smoke Verification` phase.

---

## Why backend-first, gated

Per `P01A5_DEPLOYMENT_TRIGGER_MAP.md`, merging PR #2 will very likely auto-deploy **both** Vercel (confirmed) and Render (declared config) with no manual gate. This plan assumes the owner will suppress or immediately follow that automatic merge-triggered deploy with the sequence below, backend first, so a database-connectivity failure is caught before the frontend is confirmed against it — not because the platforms allow deploying one without the other.

## Backend first

1. **Freeze final commit.** Confirm the exact SHA being released (currently `5ca142819885f661a21935a7ff8a07da4689a0f6`, subject to re-verification at execution time).
2. **Confirm Render environment readiness.** Before merge: verify `DATABASE_URL`/`POSTGRES_*`, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` are all set in the Render dashboard to production-valid values (names only were checked in this phase — see `P01A5_PRE_MERGE_READINESS_REPORT.md`; values were never read or printed and must be confirmed by whoever has dashboard access).
3. **Ensure rollback path.** Confirm a previous successful Render deployment can be redeployed, and confirm/obtain a recent database backup or snapshot, per `P01A5_ROLLBACK_PLAN.md`.
4. **Deploy backend** (via merge, or a manual Render deploy trigger if the owner prefers not to let the merge auto-deploy the frontend simultaneously).
5. **Observe boot logs.** Specifically watch for the `ImproperlyConfigured` message the P01A fail-fast check raises if `DATABASE_URL`/`POSTGRES_HOST` is missing — if it appears, the database configuration is the confirmed cause of the original incident and must be fixed before proceeding.
6. **Confirm `/healthz` = 200.**
7. **Confirm DB-backed endpoints return expected responses** (not 500) — see the smoke-test checklist below.
8. **Stop immediately if database connectivity fails.** Do not proceed to the frontend step. Roll back per `P01A5_ROLLBACK_PLAN.md`.

## Frontend second (only if backend passes)

9. **Deploy/promote frontend production** (Vercel).
10. **Verify direct SPA routes** (not just `/`) — this is the original P00 incident #2.
11. **Verify API integration** — the frontend successfully calls the now-healthy backend.
12. **Verify canonical** — `https://shahriyarkhan.vercel.app` everywhere, zero `shahriyarkhan.dev`.
13. **Verify robots.txt.**
14. **Verify sitemap.xml.**
15. **Verify CognoRise remains hidden** from all public surfaces.
16. **Verify InsightBoard remains hidden** from all public surfaces.
16b. **Verify the Yango sensitive screenshot remains excluded** — both the gallery reference and the CSS background-image fixed in this phase (`5ca1428`). This is a **new, P01A.5-specific check**, added because this exact class of gap was found live in production during this audit.
17. **Submit the Contact form once and verify the notification email pipeline.**

## Close incident (only after every smoke test passes)

18. Mark the original P00 production incidents resolved — **not before**.
19. Update `P01_HANDOFF.md` to reflect confirmed-live status.
20. Only then consider proceeding toward the full P01 platform-foundation phase.

---

## Production smoke-test specification

All checks are read-only GETs or the one real Contact-form submission explicitly called out below; nothing else writes to or deletes portfolio content.

### Frontend

| Check | Expected |
|---|---|
| `GET /` | 200 |
| `GET /about` (direct navigation) | 200, SPA content, not Vercel's own 404 |
| `GET /projects` | 200 |
| `GET /projects/sk-learntrack-ai-learning-platform` (direct navigation) | 200, SPA content |
| Yango project route (`/projects/yango-wing-fleet-digital-registration-platform`) | 200, SPA content |
| Refresh on any nested route | No Vercel `X-Vercel-Error: NOT_FOUND` |
| `GET /robots.txt` | 200, no `shahriyarkhan.dev` |
| `GET /sitemap.xml` | 200, no `shahriyarkhan.dev`, no InsightBoard |
| View source / fetch `/`, check canonical `<link>` and JSON-LD `url` | `https://shahriyarkhan.vercel.app` |
| Search rendered HTML + all script/style bundles for `shahriyarkhan.dev` | Zero occurrences |
| Search rendered HTML for "CognoRise" | Absent |
| Search rendered HTML for "InsightBoard" | Absent |
| Fetch `/images/yangowing_images/custom_dashbaord_image2.png` directly | Should still resolve as a static file (it is not deleted), but confirm no *page* references it — check the CSS bundle and any rendered page for the filename, same as this phase's own regression test |

### Backend

| Check | Expected |
|---|---|
| `GET /healthz` | 200 |
| `GET /api/v1/public/site/settings/` | 200 (currently 500 in production — this is the primary pass/fail signal for the whole release) |
| `GET /api/v1/public/portfolio/projects/` | 200, InsightBoard absent |
| `GET /api/v1/public/portfolio/projects/<a real published slug>/` | 200 |
| `GET /api/v1/public/portfolio/projects/insightboard-crm-sales-intelligence-dashboard/` | 404 |
| `GET /api/v1/public/resume/default/` | 200 or a clean 404 — never 500 |
| `GET /sitemap.xml` (backend-generated) | 200 |
| Submit the real Contact form once | Notification email arrives |
| Every check above | No unexpected 5xx |

### Observability

- Inspect Render logs for database connection errors around the deploy window.
- Inspect Vercel build/runtime logs for errors.
- Confirm no secret value appears in any log line reviewed.
- Record the exact deployed SHA on both platforms (Render's deploy log and Vercel's deployment detail both show the commit SHA they built).

**No smoke test in this list modifies or deletes any existing portfolio content.** The one state-changing action (Contact form submission) creates a new inquiry record and sends a notification email — it does not alter any existing record.
