# CF-H2 — Production Verification

**Date:** 2026-08-30

---

## ContactMessage production test (Step 5)

**Exactly one** submission, safe test values, sent once, not repeated:

```
POST /api/v1/public/inquiries/contact/
subject: [CFH2-TEST-20260830T145004Z] Production release verification
```

| Item | Result |
|---|---|
| HTTP status | **201** (not 500) |
| Latency | 5.76s |
| Row-persistence evidence | Response body echoes the saved row: `id: 5`, `created_at: 2026-08-30T14:50:07.857464Z` |

**Most important success condition confirmed:** an email notification failure (if one occurred — see Notification status below) no longer turns a successfully persisted inquiry into an HTTP 500.

No admin/DB console access exists in this environment to independently query row `id=5`; the API response itself (which only returns after a successful `.save()`) is the persistence evidence.

## ServiceRequest production test (Step 6)

**Exactly one** submission:

```
POST /api/v1/public/inquiries/service-requests/
subject: [CFH2-TEST-20260830T145019Z] Production release verification
```

| Item | Result |
|---|---|
| HTTP status | **201** (not 500) |
| Latency | 0.74s |
| Row-persistence evidence | Response body echoes the saved row: `id: 4`, `created_at: 2026-08-30T14:50:21.564379Z` |

Both serializers confirmed deployed and behaving per the CF-H1 fix.

## Notification status (Step 7)

| Test | Intake | Notification |
|---|---|---|
| ContactMessage | **SUCCESS** | **UNCONFIRMED** |
| ServiceRequest | **SUCCESS** | **UNCONFIRMED** |

No email mailbox, provider dashboard, or Render log access exists in this environment. HTTP 201 is **not** treated as evidence that the notification email was delivered — per CF-H1, the entire point of the fix is that intake success is now independent of notification outcome, so a 201 proves nothing about email delivery either way.

## Safe logging verification (Step 8)

**Render logs are not accessible in this environment** (no `RENDER_API_KEY`, no dashboard session — confirmed absent, not merely assumed). This is stated explicitly per the task's instruction to document unavailability rather than guess.

In its place, the sanitization behavior itself was already verified pre-release by the automated test suite (`test_notification_failure_is_logged_without_exposing_exception_message` in `backend/apps/inquiries/tests.py`, part of the 38/38 passing suite, including in CI at the exact merged head): it asserts the log line contains only the inquiry type, row id, and exception class name, and explicitly asserts a simulated sensitive-looking exception message does **not** appear in the log output. This is code-level, automated proof of the sanitization contract; it is not a live production log inspection, and is not presented as one.

## Regression smoke checks (Step 9)

| Check | Result |
|---|---|
| `/healthz` | 200 |
| `/api/v1/public/site/settings/` | 200 |
| `/api/v1/public/portfolio/projects/` | 200 |
| `/api/v1/public/portfolio/experiences/` | 200 |
| Frontend `/about` (direct navigation) | 200 |
| Frontend `/projects` (direct navigation) | 200 |
| Frontend `/projects/yango-wing-fleet-digital-registration-fleet-management-platform` | 200 |
| Resume unknown-slug (`/api/v1/public/resume/nonexistent-slug-xyz-cfh2/`) | Clean 404 |
| InsightBoard hidden | Confirmed — not present among the 6 published projects returned by the public projects API |
| CognoRise hidden | Confirmed — not present among the 6 published projects returned by the public projects API |
| Yango sensitive screenshot (`custom_dashbaord_image2`) unavailable | Confirmed — the live Yango project API response contains no reference to that filename and exposes no gallery/detail-images field at all |

## Release failure criteria (Step 10)

None of the listed failure conditions occurred (no 500 on either endpoint, no persistence failure, Render/Vercel both deployed, no P01A route regression, privacy asset did not reappear, zero migrations, no secret exposure). **No rollback was performed or warranted.**

## Release-success classification (Step 11)

- **`CONTACT/SERVICE INTAKE INCIDENT: RESOLVED`**
- **Notification delivery: `UNCONFIRMED`** (not `VERIFIED HEALTHY`, not `STILL BROKEN` — no observation channel exists to distinguish the two; see CF-H1's `EMAIL ROOT CAUSE UNCONFIRMED` finding, which this phase did not attempt to change)

The underlying email-provider problem, whatever its exact state, does not invalidate this intake-reliability release — the database submission path is confirmed healthy independent of it.

## Follow-up owner checklist (Step 12 — prepared only, not executed)

**If Gmail API backend is active**, check (do not print values):
- `GMAIL_API_ENABLED` evaluates true only if client ID, secret, and refresh token are all present
- Refresh token has not been revoked or expired
- The authorized sending account matches `DEFAULT_FROM_EMAIL`

**If SMTP backend is active**, check (do not print values):
- SMTP username / password (app password, if Gmail SMTP)
- TLS setting matches the port in use
- Sender and recipient (`ADMIN_NOTIFICATION_EMAIL`) addresses are correct

No credential was viewed, changed, or regenerated during CF-H1 or CF-H2.
