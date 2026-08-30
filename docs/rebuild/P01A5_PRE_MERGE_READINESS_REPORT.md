# P01A.5 — Pre-Merge & Production Readiness Report

**Date:** 2026-08-30
**Candidate PR:** #2, branch `fix/p01a-stabilization-integrated`
**Final audited head:** `5ca142819885f661a21935a7ff8a07da4689a0f6` (updated from the originally-supplied `c35b443` — see §6)

---

## 1. Overall result

PR #2 is technically release-ready from a CI/local-gate standpoint after one real fix this phase found and applied. **It is not yet safe to merge**, primarily because the automatic Vercel+Render deployment this merge would trigger targets a production environment that is **currently, verifiably broken** (every database-backed backend endpoint returns 500 right now) — a pre-existing incident, not caused by this PR, but one that means "merge" and "successful production release" are not the same event here.

**A second, more urgent finding is unrelated to PR #2's mergeability but must be acted on regardless**: this audit discovered the sensitive Yango screenshot (`custom_dashbaord_image2.png`) is **currently live and publicly fetchable** on the actual production site (`https://shahriyarkhan.vercel.app`) today, via a CSS reference already present in `origin/main`'s deployed code — independent of whether PR #2 ever merges. See §13.

## 2. Current `main` SHA

`94341e22767ce95033a9eb28e97b1f9959b2d0b2` — confirmed unchanged since P01A.4 via fresh fetch.

## 3. PR #2 head SHA

`5ca142819885f661a21935a7ff8a07da4689a0f6`. This differs from the P01A.4-supplied `c35b4432db48979e7a8709ed8eb159b1eb936623` because this phase found and fixed a real gap (§6) — a new commit was required, which is exactly the kind of change this audit exists to catch, not something to suppress to keep the "expected head" unchanged.

## 4. PR #2 mergeability

`MERGEABLE`. `mergeStateStatus: UNSTABLE`, caused solely by the pre-existing, unrelated Cloudflare "Workers Builds" check reporting failure — `main` has no branch protection rules or rulesets, so this does not block a merge at the GitHub level.

## 5. GitHub CI status

Both `Backend (Django)` and `Frontend (Vite/React)` jobs report `success` on both the `push`- and `pull_request`-triggered runs against the **exact final head** `5ca1428`:
- Run `33293292809` (push): success
- Run `33293294422` (pull_request): success

31/31 backend tests, 35/35 frontend tests (34 carried from P01A.4 + 1 new regression test added this phase) — log-verified real execution, not assumed from green checkmarks alone.

## 6. Documentation correction result

`P01A4_INTEGRATION_REPORT.md` §17 was corrected: it previously said the branch had "4 local commits (plus a 5th, documentation-only commit to follow)" — stale wording from a draft written before the docs commit itself landed as the branch's 4th and final P01A.4 commit. Corrected to state the actual final P01A.4 commit count (4) and cross-reference this phase's own 5th commit (the screenshot-exposure fix, §13) rather than conflate the two.

## 7. Vercel readiness

**Classification: NEEDS OWNER ACTION** (not BLOCKED — the pipeline demonstrably works; not READY — key dashboard settings are unconfirmed by this audit, which has no Vercel credentials and did not attempt to acquire any).

| Item | Finding |
|---|---|
| Repository/project mapping | Confirmed connected (deployment history exists for every `main` commit) |
| Production branch | `main` (inferred from deployment-history correlation with every push to `main`) |
| Root Directory | Expected `frontend`; **inferred, not dashboard-confirmed** — the site demonstrably builds and serves content despite no root-level `package.json`, which is only possible if Root Directory is already `frontend` |
| Build command | `frontend/vercel.json` declares `npm run build`, matching expectation; **CI independently confirms this exact command succeeds** |
| Output directory | `frontend/vercel.json` declares `dist`, matching expectation |
| Node/package-manager behavior | Not dashboard-confirmed; CI uses Node 22 successfully, consistent with `package.json`'s `engines` field |
| Production `VITE_API_BASE_URL` | A committed, non-secret `frontend/.env.production` provides `https://shahriyarkhan.onrender.com` as a build-time fallback (confirmed baked into a fresh production build's JS bundle); **whether a dashboard-level environment variable also exists and would override it is unconfirmed** |
| `.env.production` used intentionally? | Appears so — pre-existing, correctly-valued, not part of any P01A/P01A.4/P01A.5 change |
| Env vars override repo defaults? | Cannot confirm without dashboard access |
| **Merging to `main` auto-deploys Production?** | **Confirmed YES** — direct deployment-history evidence, not inference (see `P01A5_DEPLOYMENT_TRIGGER_MAP.md`) |
| Preview/Production separation | Confirmed clearly separated — every PR-branch push in this whole workflow (P01A.2 onward) correctly produced a `Preview`-environment deployment, never `Production` |
| Instant Rollback availability | Prerequisite (an intact chain of prior successful Production deployments) confirmed present; the dashboard control itself not independently verified |

**No environment-variable value was read, printed, or exposed at any point in this audit.**

## 8. Render readiness

**Classification: BLOCKED** — not on configuration-declaration grounds (those look correct), but on **live, verified evidence that the production database connection is not currently working**.

| Item | Finding |
|---|---|
| Service connected repository | Confirmed via `render.yaml` |
| Production branch | `main` (Render's standard default for a connected repo; not dashboard-confirmed) |
| Build command | Matches `render.yaml` exactly |
| Start command | `gunicorn config.wsgi:application --chdir backend --bind 0.0.0.0:$PORT`, matches `render.yaml` |
| Health-check path | `/healthz` — **confirmed live, returns 200** |
| Production Django settings | `config.settings.production`, per `render.yaml`'s `DJANGO_SETTINGS_MODULE` |
| Python version | `3.11`, per `render.yaml` |
| `DATABASE_URL`/`POSTGRES_*` presence | **Names known from code; dashboard presence/value not confirmed** (no secret was read) |
| `DJANGO_ALLOWED_HOSTS` | Declared in code with a fail-fast check; dashboard value not confirmed |
| `CORS_ALLOWED_ORIGINS` | Same |
| `CSRF_TRUSTED_ORIGINS` | Same |
| Secret key (`DJANGO_SECRET_KEY`) | Same — code fails fast if absent or left at the dev default; since the service boots (`/healthz` returns 200), this specific check is passing |
| Migration behavior | `manage.py migrate` runs unconditionally on every build, per `render.yaml` |
| Static file collection | `collectstatic --noinput --clear`, per `render.yaml` |
| **Auto-deploy on merge to `main`?** | Likely yes (Render's default for a connected repo with no `autoDeploy: false`); not dashboard-confirmed |
| Redeploy/rollback of a previous build | Not dashboard-confirmed; owner action item |

**Live evidence (read-only HTTP checks, 2026-08-30, matching P00's own methodology):**

| Endpoint | Result |
|---|---|
| `GET /healthz` | 200 |
| `GET /` | 200 |
| `GET /api/v1/public/site/settings/` | **500** |
| `GET /api/v1/public/portfolio/projects/` | **500** |
| `GET /api/v1/public/resume/default/` | **500** |
| `GET /sitemap.xml` | **500** |

This is the **identical failure pattern P00 found on 2026-08-27** — non-DB endpoints healthy, every DB-backed endpoint failing. Cross-checked against `origin/main`'s currently-deployed `production.py` (`git show origin/main:backend/config/settings/production.py`): it contains **only** the pre-existing `SECRET_KEY`/`ALLOWED_HOSTS` checks — **none of the P01A backend fixes, including the `DATABASE_URL` fail-fast check, are present in what's actually deployed today.** This confirms nothing from P01A has ever reached production, and the original incident remains completely unresolved in the live environment as of this audit.

## 9. Database readiness

**Structurally ready in code, operationally unverified in production.** `makemigrations --check --dry-run` re-confirmed clean against the final candidate commit (no new migration). Whether `DATABASE_URL`/`POSTGRES_*` are actually set to valid values in Render's dashboard cannot be determined from the repository or from this audit's access level — only that, whatever the current configuration is, **it is not successfully serving requests today** (§8's live evidence).

## 10. Automatic deployment-trigger map

Full detail in `P01A5_DEPLOYMENT_TRIGGER_MAP.md`. Summary: **GitHub Actions** — build/test only, no deploy. **Vercel** — confirmed auto-Production-deploy on every `main` push. **Render** — very likely auto-deploy per its declared config (not dashboard-confirmed), including an unconditional `migrate` run. **Cloudflare** — unconfirmed, currently inert/failing regardless.

## 11. Rollback readiness

Full detail in `P01A5_ROLLBACK_PLAN.md`. Git: `94341e2` confirmed as the correct pre-release reference; use `git revert`, not a hard reset (no branch protection exists to prevent one, which makes discipline here more important, not less). Vercel: prior successful deployments exist, Instant Rollback prerequisite met. Render: rollback availability not dashboard-confirmed — owner action item. Database: no migration risk from this candidate; backup/snapshot existence unconfirmed — owner action item.

## 12. Migration risk

**None.** Zero new migrations in this candidate, re-confirmed at the final head.

## 13. Security/secrets result

No secret value was read, printed, or exposed anywhere in this phase. Secret-pattern scan clean. No tracked `.env` with real values (only `.env.example` and the pre-existing, non-secret `.env.production`).

**One real, actively-exploitable finding this phase caught and fixed:** P01A4's exclusion of `custom_dashbaord_image2.png` (a screenshot showing apparent real driver names and a phone number) only removed its reference from `projects.$slug.tsx`'s `detail_images` array. A second reference — a CSS `background-image: url(...)` in `frontend/src/styles.css`'s `.projects-page-shell::before` rule — was missed and still served the file publicly. **This exact code (in `origin/main`, not introduced by this PR) is already deployed to the live production Vercel site today**: `https://shahriyarkhan.vercel.app/images/yangowing_images/custom_dashbaord_image2.png` returned **HTTP 200** when checked read-only during this audit, and the live production CSS bundle contains the reference. Fixed in commit `5ca1428` (swapped to the already-safe, aggregate-only `custom_dashbaord_image1.png`); a broader regression test was added that scans all non-test source files for the filename outside of comment lines, so this class of gap (a fix applied to one reference while a sibling reference in a different file/language is missed) cannot recur silently. **This exposure is live right now, independent of PR #2 — recommend the owner treat this as an urgent, separate action item regardless of this PR's merge timeline** (e.g., a direct hotfix to `main`, or removing/replacing the file via the Vercel dashboard, whichever is faster).

## 14. Owner-decision classification matrix

| Decision | Classification | Reason | Action |
|---|---|---|---|
| Close PR #1 | OWNER DECISION | Administrative; PR #2 is a clean, mergeable successor, but closing #1 has no technical urgency | Owner closes at their convenience after accepting #2 as the successor |
| Yango screenshot (`custom_dashbaord_image2.png`) | MITIGATED (all known references) / **BLOCKER for the live site independent of this PR** | Now excluded everywhere in this candidate's code (§13); but the same unfixed code is already live in production today | Merge fixes it going forward; the live exposure needs its own urgent, separate remediation regardless of merge timing |
| Pre-existing marketing claims (NoteAssist/SK-LearnTrack/FeelWise/bio) | DEFER TO CONTENT-TRUTH PHASE | This candidate does not newly introduce them; no legal/privacy/security concern identified (unverifiable metrics, not data exposure) | Dedicated content-copy pass, not this release |
| Gallery backend (`ProjectImage`) | DEFER TO P01 / LATER FEATURE PHASE | Incomplete but unreachable from any live route; no broken public/admin behavior is reachable (verified by grep, not assumed) | Build out in a later feature phase |
| Permanent canonical domain | SAFE TO DEFER FOR STABILIZATION, REQUIRED BEFORE FINAL SEO LAUNCH | `https://shahriyarkhan.vercel.app` is a real, working, consistently-applied temporary canonical across HTML/JSON-LD/sitemap/robots | Permanent domain decision before the final SEO/rebuild launch, not before this stabilization release |
| **Production deployment verification** | **BLOCKER** | Live evidence (§8) proves the production backend's database-backed endpoints are failing *right now*, and none of P01A's fixes are deployed yet | Do not mark any P00 incident resolved until backend-first deploy + full smoke-test checklist (`P01A5_CONTROLLED_RELEASE_PLAN.md`) passes |

## 15. True remaining blockers

1. **Production database connectivity** — confirmed broken live, independent of this PR; merging alone will not fix it, and the release plan (§17) treats backend health as a hard gate before touching the frontend.
2. **The live Yango screenshot exposure** (§13) — already live in production, unrelated to PR #2's merge status, needs independent urgent action.

## 16. Items safely deferred to P01

Pre-existing marketing claims, gallery backend completion, and the permanent canonical domain decision — see §14 for the full reasoning per item.

## 17. Controlled-release sequence

Full detail in `P01A5_CONTROLLED_RELEASE_PLAN.md` — backend-first (freeze commit → confirm Render env → confirm rollback path → deploy → observe boot logs → confirm `/healthz` → confirm DB-backed endpoints → stop immediately on DB failure), then frontend (deploy/promote → verify direct routes/API/canonical/robots/sitemap/CognoRise/InsightBoard/Yango screenshot exclusion → submit Contact form once), then close-incident only after every smoke test passes.

## 18. Production smoke-test plan

Full checklist in `P01A5_CONTROLLED_RELEASE_PLAN.md` — frontend routes/canonical/robots/sitemap/content-visibility checks, backend health/endpoint/contact-form checks, and observability steps (log review, secret-leakage check, exact deployed SHA recorded on both platforms). No smoke test modifies or deletes existing portfolio content.

## 19. PR #1 recommendation

Administrative close, at the owner's convenience, once PR #2 is accepted as its successor. Not urgent, not a release blocker, not touched by this audit.

## 20. Ready for merge: **NO**

PR #2 itself is technically clean (CI green, no conflicts, no secrets, correct content visibility) — but merging triggers an automatic, ungated production deployment (§10) into an environment already confirmed broken (§8). Merging today would not resolve the original P00 incident; it would just add unverified code on top of a backend that cannot currently serve any database-backed request.

## 21. Ready for controlled production release: **NO**

Not until: (a) Render's database configuration is fixed and re-verified live (owner-only access required), (b) the live Yango screenshot exposure (§13) is remediated independently, and (c) the full backend-first smoke-test sequence in `P01A5_CONTROLLED_RELEASE_PLAN.md` passes.

## 22. Exact reason for each NO

- **Merge — NO**: automatic Vercel+Render production deploy on merge (confirmed), targeting a database that returns 500 on every real request right now (confirmed live), for reasons P01A's own fixes have never had a chance to address in production (confirmed: none of them are in `origin/main`'s deployed code).
- **Controlled release — NO**: the same database issue must be fixed and confirmed *before* a controlled release can even attempt its backend-health gate (step 6-8 of `P01A5_CONTROLLED_RELEASE_PLAN.md`); additionally, the live screenshot exposure (§13) is an active issue that should not wait for this PR's release cadence.

## 23. Files changed (this phase)

- `frontend/src/styles.css` — one-line fix (§13).
- `frontend/src/routes/contentVisibility.test.ts` — one new regression test (§13).
- `docs/rebuild/P01A4_INTEGRATION_REPORT.md` — one corrected paragraph (§6).
- `docs/rebuild/P01A5_READINESS_BASELINE.md`, `P01A5_DEPLOYMENT_TRIGGER_MAP.md`, `P01A5_ROLLBACK_PLAN.md`, `P01A5_CONTROLLED_RELEASE_PLAN.md`, `P01A5_PRE_MERGE_READINESS_REPORT.md` — new, this phase.

## 24. Final `git status --short`

See the final response for the exact live output at the time this report was written.

## 25. Final recommendation

**Do not merge PR #2 yet.** Its own code is ready, but merging today would trigger an automatic production release into a backend that is confirmed broken right now, for a reason none of this stabilization work has been deployed to fix. **Separately and more urgently**, escalate the live Yango screenshot exposure (§13) to the owner immediately — it is a real, currently-active issue on the production site that exists whether or not PR #2 ever merges, and fixing it does not require waiting for any of the rest of this process. Once Render's database configuration is confirmed working (owner-only action) and a specific release window is chosen, proceed to the separately-authorized `P01A.6 — Controlled Production Release and Smoke Verification` phase using `P01A5_CONTROLLED_RELEASE_PLAN.md` as the exact sequence.
