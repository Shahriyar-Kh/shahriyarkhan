# P00 — Evidence Freeze

**Audit date:** 2026-08-27
**Repository:** `shahriyarkhan-portfolio` (local working copy)
**Branch:** `main` @ `2d654dd85e60ca5bda9fb39bd8a097ccbe4809ce`
**Auditor:** Claude Code, read-only discovery pass

This document is the P00 evidence freeze for the portfolio rebuild. It records verified facts about the current repository, a snapshot of live production behavior observed on 2026-08-27, and the risks/decisions that must be resolved before implementation (P01+) begins. Nothing in this document should be read as a design decision — it is a factual baseline only. See companion files for detail: [CONTENT_TRUTH_INVENTORY.md](CONTENT_TRUTH_INVENTORY.md), [ROUTE_MIGRATION_MAP.csv](ROUTE_MIGRATION_MAP.csv), [DATA_MODEL_INVENTORY.md](DATA_MODEL_INVENTORY.md), [MEDIA_INVENTORY.csv](MEDIA_INVENTORY.csv), [OPEN_DECISIONS.md](OPEN_DECISIONS.md), [P01_HANDOFF.md](P01_HANDOFF.md).

---

## 1. Executive summary

The repository is a two-tier personal portfolio: a Vite + React (TypeScript) single-page app in `frontend/`, and a Django 5 + DRF backend in `backend/`, intended to be database-driven (public content served from Postgres via REST endpoints, with hardcoded fallback content in the frontend when the API is unavailable).

**The most important finding of this audit is operational, not architectural:** as of 2026-08-27, the live backend (`https://shahriyarkhan.onrender.com`) returns HTTP 500 on every database-backed endpoint (projects, services, skills, resume, site settings, sitemap), and the live frontend (`https://shahriyarkhan.vercel.app`) returns HTTP 404 on every route except `/` (deep links and refreshes are broken in production despite a rewrite rule in `vercel.json`). The site currently "works" for a visitor only because the frontend has hardcoded fallback copy baked into the route components — a visitor landing on `/` sees plausible content, but the system behind it is not functioning as designed, and any other page is unreachable directly. This must be treated as a launch blocker for anything built on top of the current deployment, independent of the rebuild.

The repository also contains a substantial amount of non-evidence: five root-level Markdown files describing a "premium UI enhancement" CSS effort (`00_START_HERE.md`, `BATCH_1_COMPLETION_REPORT.md`, `BATCH_1_IMPLEMENTATION_SUMMARY.md`, `IMPLEMENTATION_CODE_GUIDE.md`, `PREMIUM_UI_ENHANCEMENT_PLAN.md`), a `VISUAL_QA_CHECKLIST.md`, and a `PROJECT_DOCUMENTATION.md` that describes an architecture (TanStack Start/Router with file-based routing and a generated route tree) that **no longer matches the code** — the app now uses a small hand-rolled client-side router (`frontend/src/lib/navigation.tsx`). These are useful as a record of *intent* but must not be treated as verified fact.

Backend data modeling is more mature than the frontend currently exposes: eight Django apps cover portfolio content, inquiries/leads, a resume builder, SEO metadata, analytics events, and site configuration — a genuine foundation for the "private operating system" described in the project objective, though several of these (analytics, resume builder, SEO) have no corresponding admin UI in the frontend today (Django admin is the only management surface, and even that is only reachable via session login, currently returning the DB errors described above for anything that touches portfolio data).

## 2. Repository snapshot

| Item | Value |
|---|---|
| Working directory | `d:\Django Projects\shahriyarkhan-portfolio` |
| Git branch | `main` |
| HEAD commit | `2d654dd85e60ca5bda9fb39bd8a097ccbe4809ce` ("Final Optimized UI & UX Enhancements") |
| Working tree | **Dirty** — 10 modified tracked files, 9 untracked files/paths (see below) |
| Remote | Not inspected (not required for this audit; no destructive or network-write git commands were run) |

**Modified tracked files at audit time** (all preserved, none touched by this audit):
`backend/apps/portfolio/admin.py`, `backend/apps/portfolio/api/admin_urls.py`, `backend/apps/portfolio/api/serializers.py`, `backend/apps/portfolio/api/views.py`, `backend/apps/portfolio/models.py`, `frontend/src/components/AdminProjectForm.tsx`, `frontend/src/lib/seo.ts`, `frontend/src/routes/index.tsx`, `frontend/src/routes/projects.$slug.tsx`, `frontend/src/styles-premium-enhancements.css`.

**Untracked files/paths at audit time**: `00_START_HERE.md`, `BATCH_1_COMPLETION_REPORT.md`, `BATCH_1_IMPLEMENTATION_SUMMARY.md`, `IMPLEMENTATION_CODE_GUIDE.md`, `PREMIUM_UI_ENHANCEMENT_PLAN.md`, `VISUAL_QA_CHECKLIST.md`, `backend/apps/portfolio/migrations/0002_project_feature_bullets_project_short_description_and_more.py`, `frontend/src/components/ProjectImageGallery.tsx`, `testing.py`.

Read together, this diff is a coherent, in-progress, uncommitted feature: **a project image gallery** (new `ProjectImage` model, migration, admin inline, serializer, viewset, admin route, and a new `ProjectImageGallery.tsx` frontend component). It is not finished being wired into the public frontend (see §4). `testing.py` at the repo root is an unrelated 4-line scratch file (`a=4; b=4; print(a+b)…`) with no connection to the app — it was left in place, not evidence.

No `git reset`, `checkout --`, `clean`, or destructive command was run. No dependencies were installed/upgraded. No migrations were run. No `.env` file exists in the working tree (confirmed absent; nothing was read from it).

## 3. Current architecture (as verified in code)

- **Frontend**: Vite 7 + React 19 + TypeScript, Tailwind CSS v4. Client-only SPA — no SSR, no static site generation. Routing is **not** a router library: `frontend/src/lib/navigation.tsx` is a ~75-line hand-rolled `RouterProvider`/`Link`/`useLocation` built on `window.history` and `popstate`, and `frontend/src/App.tsx` dispatches on `pathname` with an `if/else` chain. `package.json`'s `name` field (`tanstack_start_ts`) and `PROJECT_DOCUMENTATION.md` both describe a TanStack Start/Router architecture with file-based routes and `routeTree.gen.ts` — **neither exists in the codebase**; this is stale documentation, not a second routing system.
- **Backend**: Django 5.x + Django REST Framework, organized as 8 first-party apps under `backend/apps/`: `accounts`, `core`, `portfolio`, `inquiries`, `resume_builder`, `analytics_app`, `seo`, `site_config`. Session-based auth (no JWT anywhere in this backend — JWT is only mentioned as a technology used *inside the showcased external projects*, e.g. NoteAssist AI). A custom `IsPortfolioAdmin` permission plus `AdminAccessControlMiddleware` gate both the DRF admin endpoints and the Django admin site itself, layered on top of `is_staff`/`is_superuser` and an optional username/email allowlist.
- **Database**: PostgreSQL only in production/settings (`DATABASE_URL` parsed in `config/settings/base.py`); SQLite is available only via an explicit `USE_SQLITE` dev flag. Provider is described in root docs as Supabase-hosted Postgres — **unverified from code alone** (only connection-string parsing logic is visible, no provider-identifying value was read).
- **Media/file storage**: `FileSystemStorage` by default; swaps to Cloudinary (`django-cloudinary-storage`) when `USE_CLOUDINARY` is true or Cloudinary env vars are present. `render.yaml` also sets `MEDIA_ROOT=/var/data/media` (a persistent disk path), which only makes sense if Cloudinary is *not* active for some deployments — the two storage strategies are configured simultaneously and it is not verifiable from the repo alone which one is actually serving the current production media. **Needs verification**, not assumption.
- **Email**: Two backends are wired — SMTP (default) and a custom Gmail API OAuth backend (`apps/core/email_backends/gmail_api.py`), selected by `GMAIL_API_ENABLED`. Contact and service-request form submissions synchronously send an admin-notification email inside the DRF serializer's `create()` (`apps/inquiries/api/serializers.py`) — there is no queue/background job; a slow or failing email provider blocks the HTTP response to the visitor submitting the form.
- **Deployment**: `render.yaml` (Render, Python 3.11, gunicorn) for the backend; `vercel.json` (Vercel, `npm run build`, output `dist`) for the frontend. A leftover Netlify-style `frontend/public/_redirects` file (`/* /index.html 200`) also exists and is very likely vestigial (no other Netlify configuration was found).
- **CI/automation**: None found. No `.github/workflows`, no test runner configuration, no lint-on-push hooks. No automated test suite exists anywhere in the repository (`backend/create_test_data.py`, `backend/reset_superuser.py`, `backend/check_skills.py` are one-off manual scripts, not a test suite; there is no `tests.py`/`tests/` in any Django app).

## 4. Frontend findings

Full route-by-route detail is in [ROUTE_MIGRATION_MAP.csv](ROUTE_MIGRATION_MAP.csv). Summary points:

- 7 public routes exist, dispatched from `frontend/src/App.tsx`: `/`, `/about`, `/skills`, `/services`, `/projects`, `/projects/:slug`, `/resume`, `/contact`, plus a client-rendered 404.
- Every route component fetches from the Django API on mount and falls back to hardcoded local data (arrays/objects defined at the top of the route file) when the API call fails or returns empty — this pattern is used consistently and is why the site still renders content even though the live API is currently erroring (§6).
- SEO metadata is applied **client-side only**, by direct DOM mutation (`frontend/src/lib/seo.ts` → `applySeo()`/`addSchemaMarkup()`), after each route mounts. `frontend/index.html` carries a single static set of meta tags (title, description, OG, Twitter, and a `Person` JSON-LD block) that describes the home page; every other route overwrites these tags only after JavaScript runs. Any crawler or link-preview bot that does not execute JavaScript will see home-page metadata for every URL.
- `frontend/index.html` declares canonical `https://shahriyarkhan.dev/` and JSON-LD `url: "https://shahriyarkhan.dev"` — **this domain does not resolve** (verified live, §6). No route sets a `robots.txt` or `sitemap.xml` at the frontend origin; those are only served by the Django backend (`config/urls.py`), which is a different domain than the deployed frontend. A crawler visiting the actual public site (`shahriyarkhan.vercel.app`) will not find either file (confirmed 404 live).
- `AdminProjectForm.tsx` (510 lines) and `ProjectImageGallery.tsx` (148 lines) exist under `frontend/src/components/` but are **not imported by any route or by `App.tsx`** — confirmed by repo-wide search; the only other reference to `AdminProjectForm` is a comment inside its own file, and to `ProjectImageGallery` is a CSS class name. These are orphaned/in-progress components, not live UI. There is currently no protected operations UI in the frontend at all — all content administration happens through the Django admin site.
- Contact (`/contact`) and service-request (`/services`) forms both POST to public, unauthenticated DRF `CreateAPIView` endpoints (`/api/v1/public/inquiries/contact/`, `/api/v1/public/inquiries/service-requests/`) with no CAPTCHA/rate limiting visible in the code — a spam-abuse risk to note for the rebuild, not something to fix here.
- Package manager: `frontend/package.json` lists `bun.lockb` as tracked (per `rg --files`) but the repo also carries `frontend/package-lock.json` and a `frontend/npm-requirements.txt` reference file — three different package-manager artifacts for one project (bun, npm, and a manual npm-style list). **Needs a single decision**, not a merge.

## 5. Backend findings

Full model-by-model detail is in [DATA_MODEL_INVENTORY.md](DATA_MODEL_INVENTORY.md). Summary points:

- URL surface (`backend/config/urls.py`): API root banner (`/`), `healthz`, static file serving helper, Django admin at `{ADMIN_URL_PATH}/` (default `super-admin`, env-overridable), a custom staff-only dashboard at `{ADMIN_URL_PATH}/dashboard/`, versioned public API under `/api/v1/public/...` (portfolio, inquiries, resume, analytics, seo, site), a mirrored admin API under `/api/v1/admin/...`, plus dynamically generated `robots.txt` and `sitemap.xml`.
- **Confirmed bug**: the frontend home page (`frontend/src/routes/index.tsx:718`) calls `GET /api/v1/public/portfolio/experience/` (singular), but the only registered route is `/api/v1/public/portfolio/experiences/` (plural) — `backend/apps/portfolio/api/urls.py:16`. This call always 404s. It is currently inconsequential only because the component that would use the result (`ExperienceSection`, same file) ignores the fetched state and renders a separate hardcoded `experienceFallback` array unconditionally — meaning the experience timeline is not actually wired to the backend at all, silently.
- `SiteSetting` (`apps/site_config`) is a true singleton (`pk` forced to 1 in `save()`), holding the one editable copy of name/email/phone/location/hero text/SEO defaults/footer/social links — a good existing foundation for global settings in the rebuild.
- `PageSEO` (`apps/seo`) is a flat per-page-key metadata table (`page_key` unique, e.g. `home`, `about`) — workable but not scalable to a `/insights/[slug]` or `/services/[slug]` future IA without a redesign (it has no relation to `Project`/`Service`, it's keyed by a hand-picked string). `SEOMetadataModel` (an abstract mixin with `seo_title`/`seo_description`/`og_*`) is already mixed into `Project`, `Experience`, and `Service`, which is closer to what a future CMS would want.
- `AnalyticsEvent` is a bare custom event log (event_type/page_path/project FK/metadata JSON/session_id/ip_hash) with no aggregation beyond two `Count`-by-field admin-dashboard queries. It is not integrated with any third-party analytics or Search Console — everything is self-built and unverified against real traffic.
- `ResumeVersion`/`ResumeExport` (`apps/resume_builder`) model multiple named resume variants with M2M includes into Projects/Experience/Skills/Education and an `is_default` flag — a genuine resume-versioning foundation, but the actual PDF served to visitors (`/resume/Shahriyar_Khan_Software_Engineer.pdf`) is a static file in `frontend/public/resume/`, disconnected from this model; `ResumeExport.file` (a `FileField`) is unused by any seed data or view that serves it to the public resume page.
- **Seed-data risk**: `backend/apps/core/management/commands/seed_insightboard_project.py` (also invoked automatically on every Render deploy, per `render.yaml`'s `buildCommand`) seeds a project called "InsightBoard CRM" whose `preview_image`/`featured_image` are downloaded from generic Unsplash stock-photo URLs, not real product screenshots. Its `live_url` (`https://insightboard-crm.vercel.app`) returned **HTTP 404** when checked live on 2026-08-27 — the demo does not currently exist. This project does not appear in any of the frontend's hardcoded fallback arrays, so it is only visible to a user when the (currently broken) API is serving DB content. This is exactly the kind of "decorative/synthetic-looking" content the rebuild must not carry forward without explicit verification (see [OPEN_DECISIONS.md](OPEN_DECISIONS.md)).
- Two `requirements` sources disagree: root `requirements.txt` delegates to `backend/requirements.txt` (`Django>=5.2,<6.0`, commented "Upgraded backend requirements"), while `backend/requirements/base.txt` (used by `backend/requirements/prod.txt`, which is what `render.yaml`'s build command actually installs) pins `Django>=5.1,<6.0`. The exact Django version running in production cannot be confirmed from the repo alone — **needs verification** against the live environment, not assumption.

## 6. Deployment/domain findings (live, read-only checks — audited 2026-08-27)

All checks below were simple `curl` GET requests to already-configured public domains found in repo documentation/config. No authentication was attempted, no state-changing request was sent, and no response body beyond a generic Django 500 error page (no stack trace, no secrets — `DEBUG=False` is correctly in effect) was inspected.

| URL | Result | Note |
|---|---|---|
| `https://shahriyarkhan.dev/` | **No response (DNS/connect failure)** | Canonical domain declared in `frontend/index.html` and JSON-LD; does not resolve. |
| `https://shahriyarkhan.vercel.app/` | 200 | Live frontend root. |
| `https://shahriyarkhan.vercel.app/about` | **404** (`X-Vercel-Error: NOT_FOUND`) | Direct request to a non-root route fails in production. |
| `https://shahriyarkhan.vercel.app/projects/sk-learntrack-ai-learning-platform` | **404** | Same failure mode for project detail pages. |
| `https://shahriyarkhan.vercel.app/robots.txt` | **404** | No robots.txt at the frontend origin. |
| `https://shahriyarkhan.vercel.app/sitemap.xml` | **404** | No sitemap at the frontend origin. |
| `https://shahriyarkhan.onrender.com/` | 200 | Backend API root banner. |
| `https://shahriyarkhan.onrender.com/healthz` | 200 | Health check, does not touch the DB. |
| `https://shahriyarkhan.onrender.com/robots.txt` | 200 | Backend-served robots.txt works (different domain than the public site). |
| `https://shahriyarkhan.onrender.com/sitemap.xml` | **500** | Queries `Project`/`Service` tables — fails. |
| `https://shahriyarkhan.onrender.com/api/v1/public/site/settings/` | **500** | |
| `https://shahriyarkhan.onrender.com/api/v1/public/portfolio/projects/` | **500** | |
| `https://shahriyarkhan.onrender.com/api/v1/public/portfolio/services/` | **500** | |
| `https://shahriyarkhan.onrender.com/api/v1/public/portfolio/skills/` | **500** | |
| `https://shahriyarkhan.onrender.com/api/v1/public/resume/default/` | **500** | |
| `https://shahriyarkhan.onrender.com/super-admin/` | 302 | Redirects to Django admin login; does not by itself prove DB health. |
| `https://insightboard-crm.vercel.app/` | **404** | Demo URL for a seeded backend project; does not exist. |
| `https://noteassistai.vercel.app/`, `https://sk-learntrack.vercel.app/`, `https://feelwise-emotion-detection.feelwise.workers.dev/` | 200 (all three) | The three projects shown in every frontend fallback array are genuinely live. |

**Interpretation, held to evidence only:** every endpoint that touches the database returns 500 with a generic Django error page; every endpoint that doesn't touch the database (healthz, robots.txt, API root banner, admin login redirect) returns normally. This is consistent with (but not proof of) a database connectivity problem in the production environment — confirming the actual cause requires access to Render logs/DB credentials, which is out of scope for this read-only audit. Separately and independently, the Vercel deployment is not honoring `vercel.json`'s SPA rewrite rule for any path other than `/`. These are two distinct, currently-live defects, not rebuild-design questions — see [OPEN_DECISIONS.md](OPEN_DECISIONS.md) (Launch Blockers).

## 7. Security/privacy observations

- No secret values were read or printed by this audit. `backend/.env` does not exist in the working tree; it is correctly gitignored (`.gitignore` lines for `backend/.env`, `backend/db.sqlite3`, `backend/staticfiles/`).
- `DEPLOYMENT_ENV.md` and `DEPLOYMENT_FIX_GUIDE.md` (both committed to the repo) document **variable names and non-secret example values** for production, but also state two real personal Gmail addresses in plaintext as configuration values: `shahriyarkhanpk3@gmail.com` (`DEFAULT_FROM_EMAIL`) and `shahriyarkhanpk1@gmail.com` (`ADMIN_NOTIFICATION_EMAIL`). These are contact-style addresses already published on the public site (pk1) or used as a sending identity (pk3), not credentials — no password, key, or token value appears in either file. Still, confirm with the owner whether pk3 should be public in repo history at all.
- The live 500 responses were confirmed to return a **generic** Django error page with no traceback, confirming `DJANGO_DEBUG=False` is correctly active in production — a real positive control, not just a config claim.
- `apps/core/email_backends/gmail_api.py` and `seed_insightboard_project.py`/`seed_portfolio_data.py` contain `# nosec` comments around `urlopen()` calls to attacker-uncontrolled, hardcoded Unsplash URLs — low risk as written (URLs are fixed strings in source, not user input), but worth revisiting if any future seed/import path accepts a user-supplied URL.
- The Django admin surface is additionally gated by `AdminAccessControlMiddleware` + `IsPortfolioAdmin`, which is more defense-in-depth than a stock Django admin — a genuine reusable asset for a rebuild that wants a locked-down internal operating system.
- Contact/service-request endpoints are public and unauthenticated with no visible throttling — an open spam-intake risk to flag for the rebuild's inquiries/CRM design, not a currently-exploited issue as far as this audit can tell.

## 8. Reusable foundations

- Django data model set for portfolio, inquiries, resume, SEO, analytics, and site settings (§5, full detail in [DATA_MODEL_INVENTORY.md](DATA_MODEL_INVENTORY.md)) — genuinely aligned with the "private operating system" goal (leads CRM ≈ `inquiries` app, résumé management ≈ `resume_builder` app, SEO workflows ≈ `seo` app, settings ≈ `site_config` app).
- `IsPortfolioAdmin` permission + `AdminAccessControlMiddleware` — a working, reusable admin-access-control pattern.
- The uncommitted `ProjectImage` gallery feature (models/admin/serializer/viewset/admin route, plus `ProjectImageGallery.tsx`) is functionally complete on the backend side and close to usable — worth finishing and carrying forward rather than re-designing from scratch.
- Three of four demoed external projects (NoteAssist AI, SK-LearnTrack, FeelWise) have genuinely live, reachable demo URLs — real, checkable evidence to build case studies from, unlike InsightBoard CRM.
- The résumé PDF (`frontend/public/resume/Shahriyar_Khan_Software_Engineer.pdf`) and profile photography (`frontend/public/images/profile.png`, `shary photo.jpeg`) are real, present assets, not placeholders.

## 9. Technical debt

- Stale `PROJECT_DOCUMENTATION.md` describing a TanStack Start/Router architecture that does not exist in code (§3). Should not be carried forward as-is.
- Five "premium UI enhancement" root-level docs plus a QA checklist describe a design-system effort layered on top of the existing visual design via a large uncommitted CSS file (`styles-premium-enhancements.css`, +250 lines in the current diff) — per the critical content rule for this rebuild, this visual design is a red herring: it should not be preserved just because it exists.
- Orphaned frontend components (`AdminProjectForm.tsx`, `ProjectImageGallery.tsx`) not wired into any route (§4).
- Broken `/api/v1/public/portfolio/experience/` vs `/experiences/` call (§5) — dead API wiring, currently masked by a hardcoded fallback.
- Duplicate/conflicting package-manager and Python-dependency artifacts (§4, §5): bun + npm + a manual npm list on the frontend; two different Django version pins on the backend.
- Synchronous, non-queued outbound email on every contact/service-request submission (§3) — a request-time dependency on SMTP/Gmail API availability.
- Simultaneous Cloudinary and local-disk (`MEDIA_ROOT=/var/data/media`) media configuration with no way to tell from the repo which one actually serves current production media (§5).
- No automated tests, no CI, anywhere in the repository.

## 10. Critical risks

1. **Production backend is non-functional for all database-backed content** (verified 500s, §6) — independent of any rebuild decision, this is broken *today*.
2. **Production frontend cannot serve any URL except `/`** (verified 404s on deep links/refreshes, §6) — breaks sharing, bookmarking, refresh, and all search-engine indexing of anything but the home page.
3. **Canonical domain (`shahriyarkhan.dev`) does not resolve** while two different live domains (`vercel.app`, `onrender.com`) are actually serving traffic — any SEO/schema work done against the stated canonical is currently meaningless.
4. **A seeded portfolio project ("InsightBoard CRM") uses stock photography and a dead demo link** — a concrete instance of exactly the synthetic/decorative content this rebuild is instructed not to carry forward without explicit owner approval.
5. **Experience-history contradiction between the home page and the résumé/seed data**: the home page (`index.tsx`) lists four roles including "CognoRise InfoTech" (Oct–Dec 2024), which overlaps in time with "Abasyn University Incubation Center" (Sep 2024–Feb 2025) listed elsewhere; the résumé page and the backend seed script list only three roles and omit CognoRise entirely. This is a factual conflict about the owner's own employment history and must not be silently resolved by an AI — see [OPEN_DECISIONS.md](OPEN_DECISIONS.md).
6. **No automated tests or CI** — any rebuild work is unverified by anything except manual review until this is addressed.

## 11. Recommended migration approach

Not a design decision for this phase — recorded here only as a direction for P01 scoping, to be confirmed with the owner:

1. Treat the current deployment's live failures (§6, risks 1–3) as pre-existing production incidents to triage *before or alongside* any rebuild work — a rebuild built on top of a database that 500s on every query will inherit the same failure.
2. Use the current Django data model (§5) as the backend foundation — refactor/extend rather than replace, per the app's own maturity relative to the frontend.
3. Treat all current frontend visual design and copy as **reference only** — extract verified facts (via [CONTENT_TRUTH_INVENTORY.md](CONTENT_TRUTH_INVENTORY.md)) and rebuild the presentation layer against the new Next.js/TypeScript stack described in the project objective, rather than porting JSX/CSS forward.
4. Resolve the open content questions in [OPEN_DECISIONS.md](OPEN_DECISIONS.md) — especially canonical domain, the experience-history contradiction, and InsightBoard CRM's status — before writing any new marketing copy, since several are launch blockers, not polish items.
