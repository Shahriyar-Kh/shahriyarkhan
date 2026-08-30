# CF-H1 — Release Plan

**Date:** 2026-08-30

---

## Step 9 — Architecture boundary (not built in this hotfix)

No Celery, no background task queue, and no durable outbox mechanism was introduced. The repository has no production-ready queue infrastructure already available for this app, and building one is explicitly out of this narrow hotfix's scope.

**Future recommendation for the rebuild:** move notification delivery to a durable asynchronous outbox/task mechanism during the portfolio platform rebuild — e.g., persist a `NotificationOutbox` row (or reuse the existing `AnalyticsEvent`-style pattern already in the codebase) at intake time, and process/retry delivery out-of-band, so a delivery failure is naturally retryable rather than a one-shot, request-time side effect. This hotfix's `_notify_best_effort()` wrapper is a deliberately minimal stopgap consistent with that eventual direction (it already separates "the inquiry succeeded" from "the notification succeeded"), not a competing design.

## Pre-release verdicts (Step 12)

### Intake

**`READY`** — both `ContactMessage` and `ServiceRequest` creation now succeed unconditionally once the row is saved, independent of email backend health. Verified by tests that force the notification call to raise and confirm the request still returns `201` with exactly one row created.

### Notification delivery

**`OWNER ACTION REQUIRED`** — not `VERIFIED` (the underlying email failure was never fixed, only decoupled from intake success) and not a code `CONFIGURATION FIX REQUIRED` (no configuration value was identified with enough confidence to change, and none should be guessed at). The owner needs to check Render's actual environment configuration for `GMAIL_API_REFRESH_TOKEN` validity (if Gmail API is the active backend) or SMTP credentials (if not) — see `CFH1_EMAIL_DIAGNOSIS.md` for the specific, code-supported candidates to check first. **A working intake path does not depend on this being resolved** — that is the entire point of this hotfix — but real inquiries will not generate an email notification until it is.

## Release readiness

This hotfix is ready for the owner to review and, separately, authorize merging. It does not require the email configuration issue to be fixed first — intake reliability and notification delivery are now correctly decoupled, exactly as intended.
