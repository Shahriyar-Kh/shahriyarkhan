# CF-H1 — Email Configuration Diagnosis

**Date:** 2026-08-30
**Access available:** None. No Render dashboard, API, or CLI access exists in this environment (confirmed absent, consistent with every prior phase of this engagement). No secret value was read, requested, or printed anywhere in this diagnosis.

---

## Step 3 — Environment-variable structural audit

**Every item below is `UNKNOWN`** — not because the code doesn't define or use them, but because their actual runtime *values* on Render cannot be observed without platform access this phase does not have. What follows is what the *code* reads and how it selects behavior; it is not a report of what Render is actually configured with.

| Variable | Code reference | Runtime state |
|---|---|---|
| `EMAIL_BACKEND` | `base.py:245` — defaults to SMTP unless `GMAIL_API_ENABLED` is true, in which case it defaults to the custom Gmail API backend | `UNKNOWN` |
| `DEFAULT_FROM_EMAIL` | `base.py:254` | `UNKNOWN` |
| `ADMIN_NOTIFICATION_EMAIL` | `base.py:255` | `UNKNOWN` |
| `EMAIL_HOST` | `base.py:249`, default `smtp.gmail.com` | `UNKNOWN` |
| `EMAIL_PORT` | `base.py:250`, default `587` | `UNKNOWN` |
| `EMAIL_USE_TLS` | `base.py:251`, default `True` | `UNKNOWN` |
| `EMAIL_HOST_USER` | `base.py:252` | `UNKNOWN` |
| `EMAIL_HOST_PASSWORD` | `base.py:253` | `UNKNOWN` |
| `GMAIL_API_ENABLED` | `base.py:236-239` — defaults to `True` automatically if all three Gmail client credentials below are non-empty, otherwise `False` | `UNKNOWN` |
| `GMAIL_API_CLIENT_ID` | `base.py:231` | `UNKNOWN` |
| `GMAIL_API_CLIENT_SECRET` | `base.py:232` | `UNKNOWN` |
| `GMAIL_API_REFRESH_TOKEN` | `base.py:233` | `UNKNOWN` |
| `GMAIL_API_USER_ID` | `base.py:234`, default `"me"` | `UNKNOWN` |

## Which backend production actually selects

**`UNKNOWN`** — determined entirely by whichever values are actually set in Render's environment, which this phase cannot read. The code's own selection logic (for the owner to check directly against their Render dashboard): if `GMAIL_API_CLIENT_ID`, `GMAIL_API_CLIENT_SECRET`, and `GMAIL_API_REFRESH_TOKEN` are all set (or `GMAIL_API_ENABLED` is explicitly set true), Django uses the custom `apps.core.email_backends.gmail_api.GmailApiEmailBackend`; otherwise it falls back to the standard SMTP backend.

## Step 4 — Concrete failure cause

**`EMAIL ROOT CAUSE UNCONFIRMED`** — no Render runtime/application log access exists in this environment, so the actual exception raised on the failing request was never observed. No root cause is invented in place of this.

**What code review does establish, as context (not as a confirmed cause):** the custom Gmail API backend (`backend/apps/core/email_backends/gmail_api.py`) calls `credentials.refresh(Request())` **unconditionally on every single send**, using the configured `GMAIL_API_REFRESH_TOKEN`. If Gmail API is the active backend and that refresh token has expired, been revoked, or was issued for an app still in Google Cloud Console's "testing" publish status (which time-limits refresh tokens to 7 days), this call raises an exception (typically `google.auth.exceptions.RefreshError`) on every request, with no retry and no fallback — a plausible, code-supported candidate matching Step 4's "expired/revoked OAuth refresh token" classification. If SMTP is the active backend instead, the equivalent candidate would be an SMTP authentication failure (e.g., a revoked Gmail "app password," since Gmail's own SMTP no longer accepts a regular account password with 2FA-enabled accounts). **Neither is confirmed; both are plausible starting points for the owner's own Render-log investigation**, which this phase's access level cannot perform.

## Step 5 — Configuration change made

**None.** No Render environment variable was read, changed, or guessed at a value for. No OAuth credential was regenerated. This is explicitly out of this phase's authorization and access level — see the remaining owner action in the final hotfix report.
