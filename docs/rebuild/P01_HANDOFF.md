# P01 Handoff

Audit date: 2026-08-27 (P00); updated 2026-08-27 (P01A). This document is the bridge from P00 (evidence-gathering) and P01A (narrow current-stack stabilization, see [P01A_STABILIZATION_REPORT.md](P01A_STABILIZATION_REPORT.md)) to P01 (the full platform-foundation phase). It does not authorize any code change — P01 should re-confirm anything time-sensitive (especially the live-status checks in §1) before acting on it, since production state can change between audits, and P01A's fixes have not yet been deployed.

---

**P01A.6 update (2026-08-30): P01A's fixes are now deployed and production-verified.** Everything below this notice describes the state *before* deployment (2026-08-27) and is preserved as the historical record it always was — it is not being rewritten. The current, deployed reality is:

- PR #2 merged to `main` as `b8ecbf2332aa581f780dd185068da8ae5b943f20` and confirmed live in production (`docs/rebuild/P01A6_PRODUCTION_SMOKE_REPORT.md`, `docs/rebuild/P01A6_FINAL_STABILIZATION_REPORT.md`).
- The database incident (§1, §2 blocker #1) is **RESOLVED** — root cause was strongly consistent with the Supabase project having been paused; recovery followed the owner's manual resume (`docs/rebuild/P01A5R_DATABASE_DIAGNOSIS.md`). Not Render-log-confirmed as causation; no log access was available.
- The SPA-routing incident (§2 blocker #2) is **RESOLVED** — real production nested-route checks now pass.
- The temporary canonical domain (§2 blocker #3) remains **`https://shahriyarkhan.vercel.app`**, confirmed live and consistent across canonical tags/JSON-LD/OG/sitemap/robots. The *permanent* domain decision is still open.
- CognoRise (§2 blocker #4) and InsightBoard (§2 blocker #5) remain hidden in production, confirmed live — the underlying factual questions are still open, unchanged.
- A separate, already-deployed emergency privacy hotfix (PR #3) removed a sensitive Yango screenshot from the public asset tree before PR #2 merged; PR #2 preserves that removal (`docs/rebuild/P01A5H_PRIVACY_HOTFIX_REPORT.md`).
- **New finding from this phase, not previously known:** the contact form (`POST /api/v1/public/inquiries/contact/`) returns an unhandled 500 in production, caused by an unguarded synchronous email-send in `apps/inquiries/api/serializers.py` — the exact risk this document's own P00 audit already flagged in §3, now observed actually occurring. Not caused by, or fixed by, any P01A work. See `docs/rebuild/P01A6_PRODUCTION_SMOKE_REPORT.md` for full detail. **This should be resolved before treating outbound lead capture as reliable**, independent of when the P01 platform-foundation phase begins.

P01 may now build on a production environment where the described incidents are fixed and deployed — re-confirm current state before assuming it hasn't drifted since 2026-08-30, per this document's own original caution above.

---

**CF-H1/CF-H2 update (2026-08-30): the contact-form incident flagged just above is now resolved in production.** The P01A.6 notice above correctly identified a new finding — the contact form returning an unhandled 500 after a successful database write — as independent of P01A's own work and unresolved at that time. It has since been fixed and deployed:

- **CF-H1** (code fix): `apps/inquiries/api/serializers.py` no longer lets a notification-email failure propagate into the HTTP response. The database write and the notification send are now decoupled — a failing notification is caught, sanitize-logged (inquiry type, row id, exception class only — never the message body or any credential), and never turns a successful save into a 500. See `CFH1_BASELINE.md`, `CFH1_EMAIL_DIAGNOSIS.md`, `CFH1_HOTFIX_REPORT.md`, `CFH1_RELEASE_PLAN.md`.
- **CF-H2** (production release): merged as PR #5 (`ec0a8e14c1ea00f426dae323c0262bfafdc95ca2`) and verified live — a single production `ContactMessage` submission and a single production `ServiceRequest` submission both returned HTTP 201. See `CFH2_RELEASE_BASELINE.md`, `CFH2_DEPLOYMENT_EVIDENCE.md`, `CFH2_PRODUCTION_VERIFICATION.md`.

**Current factual state:**

- Contact/service intake incident: **RESOLVED.** Production `ContactMessage` and `ServiceRequest` submissions now return successful responses (HTTP 201) even when the email notification path is unhealthy.
- Email-notification delivery: **UNCONFIRMED — OWNER ACTION.** CF-H1/CF-H2 decoupled intake success from notification success; neither phase had Render dashboard, log, or mailbox access, so whether the underlying email send actually succeeds in production was never observed either way. **Do not describe it as broken — it was never confirmed broken, only never confirmed working.** The application's intake path does not depend on this being resolved. See `CFH2_PRODUCTION_VERIFICATION.md` §Step 12 for the prepared (not executed) owner checklist.

---

## 1. Verified repository facts P01 can rely on

- Repo root: `d:\Django Projects\shahriyarkhan-portfolio`; branch `main`; audited at commit `2d654dd85e60ca5bda9fb39bd8a097ccbe4809ce`, working tree dirty (see §4 for exactly what's uncommitted).
- Frontend: Vite 7 + React 19 + TypeScript + Tailwind CSS v4, client-only SPA. Routing is a ~75-line hand-rolled router (`frontend/src/lib/navigation.tsx`) driven from `frontend/src/App.tsx`'s `if/else` dispatch on `pathname` — **not** TanStack Router/Start, despite `package.json`'s `name: "tanstack_start_ts"` and `PROJECT_DOCUMENTATION.md` describing that architecture. That documentation file is stale and should not be trusted for architecture facts.
- Backend: Django 5.x + DRF, 8 first-party apps (`accounts`, `core`, `portfolio`, `inquiries`, `resume_builder`, `analytics_app`, `seo`, `site_config`), session-based auth only (no JWT in this backend). Full model/endpoint inventory in [DATA_MODEL_INVENTORY.md](DATA_MODEL_INVENTORY.md) and [ROUTE_MIGRATION_MAP.csv](ROUTE_MIGRATION_MAP.csv).
- Live production status **as last checked, 2026-08-27, before P01A's fixes were deployed**: frontend root (`/`) 200, all other frontend routes 404; backend root/`healthz`/`robots.txt` 200, all backend endpoints touching the database 500. See [P00_EVIDENCE_FREEZE.md](P00_EVIDENCE_FREEZE.md) §6 for the full table. **P01A (2026-08-27) diagnosed and fixed the reachable root causes in code** (a misplaced `vercel.json`; two DRF views crashing on empty results; a fail-fast DB-config check) **but did not deploy** — re-verify against production per the smoke-test checklist in [P01A_STABILIZATION_REPORT.md](P01A_STABILIZATION_REPORT.md) §16 before assuming these are actually resolved live.
- **P01A (2026-08-27) added a test suite**: 31 backend tests (`manage.py test`, Django/DRF's own tooling) and 18 frontend tests (Vitest, the one new dependency added). Both suites pass locally. There is still no CI wiring these into an automated pipeline.
- No secrets were read or printed by either P00 or P01A. A local `backend/.env` file was discovered to exist during P01A (gitignored, correctly untracked) — its contents were never read.

## 2. Unresolved blockers

See [OPEN_DECISIONS.md](OPEN_DECISIONS.md) in full (now updated with P01A status); the five original launch blockers, and what P01A did about each, repeated here for convenience:

1. Live backend 500s on every DB-backed endpoint. **P01A:** two confirmed crash bugs fixed; a fail-fast DB-config check added. **Still open:** unverified against production (requires deploy + Render access this audit still doesn't have).
2. Live frontend 404s on every route except `/`. **P01A:** root cause found and fixed in code (misplaced `vercel.json`). **Still open:** unverified against production.
3. No resolved canonical domain (`shahriyarkhan.dev` doesn't resolve; two platform-default domains are actually live). **P01A:** a *temporary* canonical (`https://shahriyarkhan.vercel.app`) was approved and applied everywhere. **Still open:** the *permanent* domain decision.
4. Home-page vs. résumé/seed-data contradiction over a 4th listed employment role (CognoRise InfoTech) with an overlapping-dates conflict. **P01A:** hidden from the public site, not deleted. **Still open:** the underlying factual question.
5. "InsightBoard CRM" project uses stock photography and has a dead demo link — status must be confirmed before it appears anywhere in the rebuild. **P01A:** hidden from the public site (seeded as draft), not deleted. **Still open:** the underlying factual question.

P01 should not build new presentation-layer work on top of blockers #1–2 without first confirming, via an actual deploy and the smoke-test checklist in [P01A_STABILIZATION_REPORT.md](P01A_STABILIZATION_REPORT.md) §16, that they are genuinely resolved live — P01A's fixes are code-complete and locally test-covered but unverified in production. Blockers #3–5 still require the owner's judgment regardless of any code fix.

## 3. Files/modules P01 is expected to touch

Based on the project objective (Next.js + TypeScript frontend, refactored Django/DRF backend, Postgres, private operations UI):

- `backend/apps/portfolio/models.py` and related serializers/views/admin — to add the missing case-study narrative fields (overview/problem/solution/outcome/development_highlights) identified in [DATA_MODEL_INVENTORY.md](DATA_MODEL_INVENTORY.md), and to finish integrating the uncommitted `ProjectImage` gallery feature.
- `backend/apps/seo/models.py` — likely refactor of `PageSEO`'s keying scheme to align with a slug-based future IA.
- `backend/apps/site_config/models.py` — likely addition of an availability/canonical-domain field.
- `backend/config/urls.py` — the `/api/v1/public/portfolio/experience/` vs `/experiences/` mismatch was fixed in P01A (frontend now calls the correct path via `frontend/src/lib/apiEndpoints.ts`); `robots_txt`/`sitemap_xml` now use a distinct `PUBLIC_SITE_URL` setting, but the static frontend `robots.txt`/`sitemap.xml` P01A added are hand-maintained stopgaps — P01 should replace them with real generation once the permanent domain/IA is decided.
- A new frontend application (Next.js App Router, per the project objective) — the existing `frontend/` Vite SPA should be treated as **content/reference source only**, not a codebase to incrementally port, given the extent of stale documentation and orphaned components found in it.
- `render.yaml` — the `seed_insightboard_project` step in the build command should not run automatically on every deploy once InsightBoard CRM's status is resolved (either fix its content or remove the auto-seed step).

## 4. Files/modules P01 must preserve

- All Django app data models and their migrations (`backend/apps/*/models.py`, `backend/apps/*/migrations/`) — genuinely reusable per [DATA_MODEL_INVENTORY.md](DATA_MODEL_INVENTORY.md); refactor in place rather than discard.
- The uncommitted `ProjectImage` gallery work currently sitting in the working tree (`backend/apps/portfolio/models.py`/`admin.py`/`api/*`, `backend/apps/portfolio/migrations/0002_*.py`, `frontend/src/components/ProjectImageGallery.tsx`) — this is unfinished, valuable, in-progress work belonging to the current session's owner and must not be discarded or overwritten without being asked first.
- `frontend/public/resume/Shahriyar_Khan_Software_Engineer.pdf` and `frontend/public/images/profile.png` / `shary photo.jpeg` — real personal assets, not placeholders.
- The `IsPortfolioAdmin` permission + `AdminAccessControlMiddleware` pattern (`backend/apps/accounts/permissions.py`, `backend/apps/accounts/middleware.py`) — a working access-control foundation for the future protected operations UI.
- `docs/rebuild/` itself (this P00 output) — future phases should update it in place rather than duplicate it.

## 5. Recommended target repository structure

Not a final decision — a starting proposal for P01 to confirm with the owner, consistent with the project objective's stated stack:

```
/
├── apps/                      # or "web/" — Next.js App Router frontend (new)
├── backend/                   # existing Django/DRF backend, refactored in place
│   ├── apps/                  # keep existing app boundaries; add case-study fields to portfolio
│   └── config/
├── docs/
│   └── rebuild/                # this P00 output, kept current through later phases
└── (root-level legacy docs: either archived or deleted once superseded by docs/rebuild/)
```

The current root-level clutter (`00_START_HERE.md`, `BATCH_1_*`, `IMPLEMENTATION_CODE_GUIDE.md`, `PREMIUM_UI_ENHANCEMENT_PLAN.md`, `VISUAL_QA_CHECKLIST.md`, `PROJECT_DOCUMENTATION.md`, `readmi.md`, `testing.py`) should be explicitly triaged (archived or removed) in P01 rather than left to accumulate further — none of it was touched by this audit, per the "no destructive actions" constraint on P00.

## 6. Proposed environment structure (names only — no values)

Grouped by concern, deduplicated from `backend/config/settings/base.py`, `backend/config/settings/production.py`, `render.yaml`, and `DEPLOYMENT_ENV.md`. This is a *naming* reference, not a new schema — P01 should decide whether to keep these exact names or rationalize them.

**Django core**: `DJANGO_SETTINGS_MODULE`, `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `TIME_ZONE`

**Public URLs / admin**: `PUBLIC_BASE_URL`, `PUBLIC_SITE_URL` *(new in P01A, optional — defaults to `https://shahriyarkhan.vercel.app`; distinct from `PUBLIC_BASE_URL`, which is this backend's own origin)*, `ADMIN_URL_PATH`, `ADMIN_ALLOWED_USERNAMES`, `ADMIN_ALLOWED_EMAILS`, `ADMIN_ALLOWED_ROLES`, `ADMIN_REQUIRE_OWNER_FOR_ADMIN_SITE`, `ADMIN_REQUIRE_OWNER_FOR_ADMIN_API`

**Database**: `DATABASE_URL`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_SSLMODE`, `DB_CONN_MAX_AGE`, `USE_SQLITE`

**CORS/CSRF**: `CORS_ALLOWED_ORIGINS`, `CORS_ALLOW_CREDENTIALS`, `CORS_ALLOW_ALL_ORIGINS`, `CSRF_TRUSTED_ORIGINS`

**Media/storage**: `USE_CLOUDINARY`, `CLOUDINARY_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_SECURE`, `MEDIA_ROOT`

**Email**: `EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`, `GMAIL_API_ENABLED`, `GMAIL_API_CLIENT_ID`, `GMAIL_API_CLIENT_SECRET`, `GMAIL_API_REFRESH_TOKEN`, `GMAIL_API_USER_ID`, `GMAIL_API_SCOPES`

**Security headers**: `SECURE_SSL_REDIRECT`, `SECURE_CONTENT_TYPE_NOSNIFF`, `SECURE_BROWSER_XSS_FILTER`, `X_FRAME_OPTIONS`, `SECURE_REFERRER_POLICY`, `SECURE_CROSS_ORIGIN_OPENER_POLICY`, `SECURE_HSTS_SECONDS`, `SECURE_HSTS_INCLUDE_SUBDOMAINS`, `SECURE_HSTS_PRELOAD`, `SESSION_COOKIE_SAMESITE`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_HTTPONLY`, `CSRF_COOKIE_SAMESITE`, `CSRF_COOKIE_SECURE`, `USE_X_FORWARDED_HOST`

**Misc**: `ENABLE_BASIC_AUTH`, `PYTHON_VERSION`

**Frontend (Vite today)**: `VITE_API_BASE_URL` — will need a Next.js-appropriate equivalent (e.g. a public runtime env var) in the rebuild.

No values for any of these were read or recorded anywhere in this document.

## 7. Existing commands that work

Updated in P01A — these have now actually been executed locally (not just read), see [P01A_STABILIZATION_REPORT.md](P01A_STABILIZATION_REPORT.md) §9–10 for full results:

- Frontend: `npm run dev`, `npm run build` (production build to `dist/`, confirmed passing), `npm run build:dev`, `npm run preview`, `npm run lint` (confirmed running; 2 pre-existing errors in an untouched file, several warnings, none build-breaking), `npm run test` (**new in P01A** — `vitest run`, 18/18 passing).
- Backend (confirmed working this phase against a local Python 3.13 venv + SQLite): `python manage.py migrate`, `python manage.py runserver`, `python manage.py check` (passing), `python manage.py makemigrations --check --dry-run` (passing, confirms the uncommitted migration `0002_...` is consistent), `python manage.py test` (**new in P01A** — 31/31 passing). Management commands confirmed to exist and run successfully: `seed_portfolio_data`, `seed_insightboard_project` (now seeds InsightBoard CRM as hidden/draft), `verify_email_delivery`.
- Deploy-time (per `render.yaml`, still not executed against Render itself): `pip install -r backend/requirements/prod.txt`, `python backend/manage.py migrate --settings=config.settings.production`, `python backend/manage.py seed_insightboard_project --settings=config.settings.production`, `python backend/manage.py collectstatic --noinput --clear --settings=config.settings.production` (dry-run confirmed working locally under production settings), then `gunicorn config.wsgi:application --chdir backend --bind 0.0.0.0:$PORT`.

## 8. Missing or failing commands

- ~~No test command exists~~ **Resolved in P01A** — `npm run test` (frontend, Vitest) and `python manage.py test` (backend, Django's own tooling) both now exist and pass. Still no CI wiring them into an automated pipeline on push.
- **No `typecheck` script** in `package.json` despite the project being TypeScript — still true; `npx tsc --noEmit` works when invoked directly (confirmed in P01A) and surfaces 2 pre-existing, unrelated errors in `skills.tsx`.
- The live deployment itself was failing as of the last check (§1) — P01A fixed the reachable root causes in code but this has **not been re-verified against production**, since that requires an actual deploy this phase did not perform.

## 9. Recommended P01 acceptance criteria

Proposed, not decided — P01 should confirm scope with the owner before treating these as fixed requirements:

1. Every route in the agreed future IA (§ project objective) either serves real content, redirects with the correct status code, or is explicitly marked private/deferred — with no existing indexable URL silently disappearing (per [ROUTE_MIGRATION_MAP.csv](ROUTE_MIGRATION_MAP.csv)).
2. A single canonical domain is chosen and consistently reflected in canonical tags, sitemap, robots.txt, OG tags, and JSON-LD.
3. No content item flagged `Unverified`/`Missing`/`Needs approval` in [CONTENT_TRUTH_INVENTORY.md](CONTENT_TRUTH_INVENTORY.md) is presented as fact in the rebuilt site without either supporting evidence or explicit owner sign-off.
4. The five launch blockers in [OPEN_DECISIONS.md](OPEN_DECISIONS.md) are resolved or explicitly deferred with owner sign-off before public launch.
5. At least a minimal automated test/CI setup exists before the rebuild is considered production-ready. **Partially addressed in P01A** — a test suite now exists (31 backend + 18 frontend tests, all passing locally); CI to run it automatically on push is still missing.

## 10. Proposed scope for the next coding prompt

**Update (P01A, 2026-08-27):** the narrow P01A slice originally proposed here — diagnosing and code-fixing the two live production incidents on the current stack — has been completed; see [P01A_STABILIZATION_REPORT.md](P01A_STABILIZATION_REPORT.md) for the full fix, test coverage, and honest limitations (nothing was deployed, so neither fix is confirmed live yet).

> **Next scope proposal**: (1) Deploy P01A's fixes to Render and Vercel, and run the post-deployment smoke-test checklist in [P01A_STABILIZATION_REPORT.md](P01A_STABILIZATION_REPORT.md) §16 — do not consider blockers #1/#2 resolved until these pass. (2) In parallel or after, get the owner's decisions on the remaining three launch blockers (permanent canonical domain, the CognoRise InfoTech date conflict, InsightBoard CRM's authenticity/status) plus the high-priority content questions in [OPEN_DECISIONS.md](OPEN_DECISIONS.md) — these gate honest copy, not just technical launch. Only once both of those are done should the full P01 platform-foundation phase (Next.js migration, new design system, CRM, admin operating system) begin.

**Status update (2026-08-30, after P01A.6 + CF-H1 + CF-H2): step (1) above is complete.** P01A stabilization is **PRODUCTION VERIFIED — COMPLETE** (database incident RESOLVED, SPA direct-route incident RESOLVED, Yango sensitive-screenshot-in-current-deployment incident RESOLVED, contact/service intake incident RESOLVED — see the CF-H1/CF-H2 notice above). Step (2) — the owner decisions on the permanent domain, the CognoRise date conflict, and InsightBoard's status — remains open, alongside the other items tracked in [OPEN_DECISIONS.md](OPEN_DECISIONS.md), including the email-notification-delivery owner check and the separate Yango git-history remediation question. The full P01 platform-foundation phase (Next.js migration, new design system, CRM, admin operating system) has **not** begun and remains gated on those owner decisions, not on any further technical stabilization work.
