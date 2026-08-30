# CF-H1 — Baseline

**Date:** 2026-08-30
**Purpose:** Freeze state before any change, per Step 1. Read-only fetch and code inspection only — no request submitted yet in this step.

---

## State as fetched

| Item | Value |
|---|---|
| `origin/main` SHA | `b8ecbf2332aa581f780dd185068da8ae5b943f20` — unchanged since the P01A.6 merge; PR #4 (docs) has not been merged, so this is confirmed the correct, current hotfix base |
| Vercel production | `https://shahriyarkhan.vercel.app/` → 200; `/about` → 200 (SPA routing fix confirmed still live) |
| Backend health | `/healthz` → 200; `/api/v1/public/site/settings/` → 200 |
| PR #4 (docs) state | `OPEN`, not merged |
| PR #1 state | `OPEN`, `isDraft: true`, unchanged |

## Current `ContactMessage` endpoint behavior

Already confirmed failing in the immediately preceding phase (P01A.6, same day): `POST /api/v1/public/inquiries/contact/` with a clearly-marked test payload → **HTTP 500**, generic Django error page, no secret/stack-trace leakage (`DEBUG=False` correctly active). Not re-submitted in this step to avoid an unnecessary duplicate production write — see Step 2 for this hotfix's own, single, additional reproduction (of `ServiceRequest`, not yet tested in any prior phase).

## Whether the failed request already persisted a database row — determined by code inspection, not guessed

- `ContactMessageSerializer.create()` (`backend/apps/inquiries/api/serializers.py`) calls `message = super().create(validated_data)` **first**, then calls the notification helper. The row-creating statement runs to completion before the exception-raising statement is ever reached.
- `PublicContactMessageCreateView` (`backend/apps/inquiries/api/views.py`) is a plain `generics.CreateAPIView` — no `@transaction.atomic` decorator, no per-view transaction wrapping.
- Django's global `ATOMIC_REQUESTS` setting (which would wrap every view in a transaction and roll back the whole request on any unhandled exception) is **not set anywhere** in `backend/config/settings/` — confirmed via `grep -rn "ATOMIC_REQUESTS"` returning no matches, so it defaults to Django's own default of `False`.

**Conclusion: `INTAKE PERSISTED BUT RESPONSE FAILED`.** The `ContactMessage` row from the P01A.6 test submission was, with high confidence, actually written to the database and committed independently, even though the client received a 500. This could not be independently confirmed by directly querying the database (no admin/database access exists in this environment, and none was sought) — the conclusion rests on code inspection of the actual save-then-notify ordering and the absence of any transaction wrapper that would undo it, which is a solid basis, not a guess.

## `ServiceRequest` endpoint — code structure (not yet live-tested at this point in the phase)

`ServiceRequestSerializer.create()` is structurally identical: `request_obj = super().create(validated_data)` first, then the same `_send_notification()` helper, then return. Same view pattern (`generics.CreateAPIView`, no atomic wrapper). **Expected to exhibit the identical failure mode** — confirmed empirically in Step 2.
