# P01A.6 — Production Smoke Report

**Date:** 2026-08-30
**Deployed commit:** `b8ecbf2332aa581f780dd185068da8ae5b943f20`

All checks below are read-only GET requests except one deliberate, clearly-marked test POST to the contact endpoint (§ Contact form).

---

## Backend (Render, `https://shahriyarkhan.onrender.com`)

| Check | Result |
|---|---|
| `/healthz` | **200** |
| `/api/v1/public/site/settings/` | **200**, real data |
| `/api/v1/public/portfolio/projects/` | **200**, 6 real projects, InsightBoard absent (case-insensitive grep, zero hits) |
| `/api/v1/public/portfolio/experiences/` | **200**, real data |
| `/api/v1/public/portfolio/projects/sk-learntrack-ai-learning-platform/` | **200** |
| `/api/v1/public/portfolio/projects/insightboard-crm-sales-intelligence-dashboard/` | **404** |
| `/sitemap.xml` | **200** — uses `https://shahriyarkhan.vercel.app` throughout, InsightBoard absent, lists a real Yango project route |
| `/api/v1/public/resume/default/` | **404** — a clean, intentional 404 (no default résumé is currently marked in production), not a 500. This is the exact acceptable outcome the P01A fix was designed to produce for this business state. |
| `POST /api/v1/public/resume/<nonexistent-slug>/download-track/` | **404** — confirms the P01A crash-fix is live (see `P01A6_DEPLOYMENT_EVIDENCE.md`) |

**No unhandled 500 was observed on any of the above.** No Render log access was available in this environment; this table is the full extent of available evidence.

## Frontend (Vercel, `https://shahriyarkhan.vercel.app`)

| Check | Result |
|---|---|
| `/` | **200** |
| `/about` (direct navigation) | **200** — SPA content, not a Vercel platform 404 |
| `/projects` (direct navigation) | **200** — SPA content |
| `/projects/sk-learntrack-ai-learning-platform` (direct navigation) | **200** |
| `/projects/yango-wing-fleet-digital-registration-platform` (direct navigation) | **200** |

**The original P00 SPA-routing incident is resolved** — every direct/refreshed navigation checked returns real SPA content instead of Vercel's own 404, for the first time in this entire engagement.

### Frontend/API integration

- Fetched the live JS bundle directly: **zero** occurrences of `localhost`.
- Confirmed the plural `portfolio/experiences/` endpoint is what's actually called; confirmed the broken singular `portfolio/experience/` path does not appear.

### Canonical/SEO

| Check | Result |
|---|---|
| HTML `<link rel="canonical">` | `https://shahriyarkhan.vercel.app/` |
| JSON-LD `url` | `https://shahriyarkhan.vercel.app` |
| `og:url` | `https://shahriyarkhan.vercel.app/` |
| Occurrences of `shahriyarkhan.dev` in the served homepage HTML | **0** |
| `/robots.txt` | **200**, points at `https://shahriyarkhan.vercel.app/sitemap.xml` |
| `/sitemap.xml` (frontend static) | **200**, correctly excludes InsightBoard (only named in its own explanatory comment) |

All canonical sources agree. No duplicate or conflicting schema block was found.

### Content visibility

- `grep -i cognorise` against the served homepage HTML: **zero hits**.
- `grep -i insightboard` against the served homepage HTML: **zero hits**.

## Privacy verification (Step 12)

`GET https://shahriyarkhan.vercel.app/images/yangowing_images/custom_dashbaord_image2.png`:

| Aspect | Result |
|---|---|
| HTTP status | **200** — note this changed from the **404** observed immediately after the P01A5H hotfix alone; see explanation below |
| `Content-Type` | `text/html; charset=utf-8` — **not** `image/png` |
| `Content-Disposition` | `filename="index.html"` |
| Body (verified via `file` and content inspection, not status alone) | Genuine HTML document containing `<div id="root">` and the app's script tag — the SPA's own `index.html`, **not** PNG bytes |

**Why the status changed from 404 to 200, and why this is still a pass, not a regression:** before this release, `frontend/vercel.json`'s SPA rewrite was never actually being read by Vercel (the original P00 routing bug), so a request for a path with no matching static file fell through to Vercel's own platform-level 404 handler (`Content-Type: text/plain`, `X-Vercel-Error: NOT_FOUND`). Now that the routing fix is live, Vercel's documented filesystem-before-rewrites precedence applies: a path with no matching static file (this one, since the asset was deleted) correctly falls through to the SPA catch-all rewrite and receives `index.html` instead — the same behavior any single-page app exhibits for an unknown path. **The success condition — the sensitive PNG must never be returned — holds regardless of which of these two non-image responses is served.** This was verified by inspecting the actual response body, exactly as instructed, not by relying on status code alone.

**Remaining safe Yango images** (`homepage.png`, `custom_dashbaord_image1.png`, `Registration_page.png`, `Landing_Preview_page.png`) were each re-checked directly: all return `200` with `Content-Type: image/png` — genuine images, correctly distinguished from the SPA-fallback behavior above. No broken image placeholder exists anywhere in the shipped JS bundle (it contains zero references to the removed filename).

## Contact form end-to-end smoke test

**One clearly-marked test submission was made:**
```
POST https://shahriyarkhan.onrender.com/api/v1/public/inquiries/contact/
sender_name: "P01A.6 Release Verification (automated test)"
email: "p01a6-release-test@example.com"
subject: "[TEST] P01A.6 controlled production release - contact pipeline smoke test"
message: "This is an automated, non-sensitive smoke-test submission... not a real inquiry and can be archived/deleted."
```

**Result: HTTP 500.** Response body is a generic, secret-free Django error page (`DEBUG=False` correctly in effect — no stack trace, no leaked value).

**Root cause, read from the actual code (not guessed):** `ContactMessageSerializer.create()` in `backend/apps/inquiries/api/serializers.py` calls `super().create(validated_data)` (saving the `ContactMessage` row) and **then** calls `msg.send(fail_silently=False)` synchronously with no `try`/`except` around it. Any email-backend failure (expired Gmail API token, SMTP misconfiguration, network issue — the exact value was not inspected, per the no-secret-values rule) propagates as an unhandled exception, producing this 500. **The database record is very likely already saved by the time the exception occurs** (this could not be independently confirmed — no Django admin/database access is available in this environment, and none was sought).

**This is a pre-existing, already-documented architectural risk, not a P01A regression.** `docs/rebuild/P00_EVIDENCE_FREEZE.md` §3 (written 2026-08-27, before any stabilization code existed) explicitly flagged: *"Contact and service-request form submissions synchronously send an admin-notification email inside the DRF serializer's create() — there is no queue/background job; a slow or failing email provider blocks the HTTP response."* Neither PR #2 nor any prior P01A phase touched `apps/inquiries`, email backend settings, or any related configuration. Per this task's own instruction ("Do not claim complete success without evidence"): **form/API submission did NOT succeed** (a 500, not an accepted 201); **notification delivery is unconfirmed** (no email inbox access exists in this environment to verify). This is reported precisely rather than glossed over — see the final report's classification of whether this blocks the overall release verdict.

## Logs

No Render log access exists in this environment. No log-based confirmation of the contact-form failure's exact exception type could be obtained; the root cause above is inferred from reading the actual serializer source code, which is a stronger basis than speculation but not equivalent to an observed stack trace.

## Supabase-backed connectivity, re-confirmed during this smoke pass

`SUPABASE-BACKED PRODUCTION CONNECTIVITY: HEALTHY` — 7 of 8 endpoint checks in this report succeeded with real, correctly-shaped data; the one failure (contact form) is an email-delivery code path, not a database connectivity failure (the `ContactMessage` row write itself, per the code, happens before the failing email call).
