# CF-H1 — Hotfix Report

**Date:** 2026-08-30
**Branch:** `fix/contact-intake-reliability`, based on `origin/main` @ `b8ecbf2332aa581f780dd185068da8ae5b943f20`

---

## Step 2 — Reproduction result

| Endpoint | Result |
|---|---|
| `POST /api/v1/public/inquiries/contact/` | **HTTP 500** — confirmed in the immediately preceding phase (P01A.6), not re-submitted here to avoid an unnecessary duplicate write |
| `POST /api/v1/public/inquiries/service-requests/` | **HTTP 500** — reproduced fresh in this phase with one clearly-marked test submission (`"[TEST] CF-H1 contact intake reliability hotfix..."`), confirming the identical failure mode predicted from code review |

Both responses were the same generic, secret-free Django error page (`DEBUG=False` correctly active).

## Step 2 — Persistence finding

**`INTAKE PERSISTED BUT RESPONSE FAILED`** for both endpoints. Determined by code inspection (`ATOMIC_REQUESTS` not set anywhere; `create()` saves the row before calling the notification helper; no `@transaction.atomic` wraps either view) rather than direct database access, which does not exist in this environment. Full reasoning in `CFH1_BASELINE.md`.

## Step 3/4 — Email configuration

**`EMAIL ROOT CAUSE UNCONFIRMED`.** No Render dashboard/API/log access exists. Every environment variable relevant to email delivery is classified `UNKNOWN` (not observed, not guessed). Full detail, including the code-level backend-selection logic and the two most plausible failure candidates (an expired/revoked Gmail API refresh token, or an SMTP authentication failure), is in `CFH1_EMAIL_DIAGNOSIS.md`. No configuration value was read, changed, or invented.

## Step 6 — Application-code root cause

`ContactMessageSerializer.create()` and `ServiceRequestSerializer.create()` (`backend/apps/inquiries/api/serializers.py`) both called `super().create(validated_data)` (saving the row) and then `_send_notification(...)`, which calls `msg.send(fail_silently=False)` with no surrounding exception handling. Any email-backend failure propagated as an unhandled exception, producing a 500 for a request whose actual database write had already succeeded.

## Code fix summary

- `_send_notification()` is unchanged — it still raises normally on failure, so it remains independently testable and reusable exactly as before.
- A new `_notify_best_effort(inquiry_type, inquiry_id, template_base, subject, payload)` wraps `_send_notification()` in a `try/except Exception`, and on failure logs `logging.getLogger(__name__).error(...)` with only the inquiry type, the inquiry's primary key, and the exception's class name (`type(exc).__name__`) — **never** the exception's own message text (which could embed connection/auth detail in some email libraries), the inquiry's message body, or any credential/token.
- Both `ContactMessageSerializer.create()` and `ServiceRequestSerializer.create()` now call `_notify_best_effort(...)` instead of `_send_notification(...)` directly, and unconditionally return the already-saved object.
- **No `fail_silently=True` was used anywhere** — the exception-handling boundary is the new wrapper function, not a parameter that would suppress errors without any operational visibility. This satisfies the explicit instruction not to use `fail_silently=True` as the sole fix.

## Step 7 — Duplicate-submission audit

1. **Before this fix:** a failed request (500) could indeed have already saved a `ContactMessage`/`ServiceRequest` row (§ Step 2 finding above).
2. **Frontend behavior on a 500:** `frontend/src/routes/contact.tsx` calls `postJson(...)` (built on `fetchJson`, which throws on any non-2xx response) inside a `try/catch` — a 500 response is caught and shown to the user as a failure, with no automatic retry logic anywhere in the codebase. A user seeing this error message **could** manually resubmit the form, which — under the *old* behavior — could create a second row for what was actually already a successfully-captured inquiry.
3. **After this fix:** the API always returns success (`201`) once the row is saved, regardless of notification outcome — there is no longer any failure response for a user to react to by resubmitting. **The specific misleading "500 after a successful save" condition that motivated any duplicate-submission risk is removed.**
4. **No idempotency/deduplication framework was built.** Per instruction, this remains a "later, if clearly necessary" concern — recommended for the future rebuild's CRM design, not this narrow hotfix (see `CFH1_RELEASE_PLAN.md`).

## Step 8 — Tests added

`backend/apps/inquiries/tests.py` (new file, 7 tests):

- `ContactMessageIntakeResilienceTests`: notification succeeds (object created once, email sent); notification raises (request still succeeds, object still created exactly once); duplicate/zero-row check; log-sanitization check (asserts the log output contains the inquiry type and exception class name, and explicitly does **not** contain a simulated sensitive-looking exception message).
- `ServiceRequestIntakeResilienceTests`: the same three behavioral guarantees (success, resilience, logging) mirrored for `ServiceRequest`.

No existing test was weakened, removed, or modified.

## Step 10 — Local verification results

| Check | Result |
|---|---|
| `manage.py check` | Pass — 0 issues |
| `manage.py makemigrations --check --dry-run` | Pass — "No changes detected" |
| Full backend test suite (`apps.portfolio apps.site_config apps.resume_builder apps.core apps.inquiries`) | **38/38 pass** (31 existing + 7 new) |
| Frontend | **Not modified** — its existing `response.ok`/try-catch error handling already correctly distinguishes success from failure and requires no change for this fix to take effect; not re-run beyond confirming no file was touched |
| `git diff --check` | Pass |
| Secret-pattern scan | Clean |
| Unexpected migrations | None |
| Unrelated files changed | None — exactly one modified file (`serializers.py`), one new test file, plus this phase's own documentation |

## Rollback plan

`git revert` the hotfix commit (or simply do not merge the PR) restores the prior synchronous-coupling behavior exactly. No migration is introduced by this hotfix, so there is no schema-level rollback concern. No production configuration was changed by this hotfix, so there is nothing to revert on Render/Supabase.

## Explicitly not included

No Next.js/rebuild work. No frontend redesign. No project-content changes. No Supabase data modification. No Git history rewrite. No credential exposure or regeneration. No Celery/background task infrastructure (see `CFH1_RELEASE_PLAN.md` for why, and what's recommended instead for the future rebuild).
