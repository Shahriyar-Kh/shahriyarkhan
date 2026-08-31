# P01 Architecture

A new Next.js App Router frontend at `web/`, alongside the untouched legacy Vite frontend (`frontend/`, still the live production frontend) and the untouched Django backend (`backend/`). This document is the as-built architectural reference; `P01_IMPLEMENTATION_REPORT.md` is the narrative report of what shipped and why it satisfies the brief.

## Stack

Next.js 16.3.3 (App Router, Turbopack — the default bundler even for `next build` in this version), React 19.2.8, TypeScript 5 in strict mode with `noUncheckedIndexedAccess: true`, Tailwind CSS v4 (CSS-first configuration via `@tailwindcss/postcss`, no `tailwind.config.js`), Vitest 4 + Testing Library + `vitest-axe` for tests.

## Verified backend contract

The full contract this app is built against — read directly from `backend/apps/*` on `origin/main` — lives in `web/src/lib/api/types.ts`, with an explicit comment block listing fields that were confirmed **absent** and must never be silently added: `short_description`, `feature_bullets`, `images`/`ProjectImage`. Two prior, separate attempts to add a project-gallery feature were merged and reverted after production incidents; this phase does not touch `backend/apps/portfolio/models.py`, run any migration, or reintroduce any gallery surface. The single backend change in this phase is additive and non-breaking: `CORS_ALLOWED_ORIGINS`'s default fallback in `backend/config/settings/base.py` gains `http://localhost:3000` alongside the existing `http://localhost:5173`.

## Rendering strategy

Server Components by default. Client Components (`'use client'`) exist only where there is real interactivity: the mobile nav, the hero role-rotator, the system map's one-shot activation, the inquiry form, the shared `Reveal` wrapper, the scroll-progress rule, and one delegated document-level analytics click listener.

`/work/[slug]` and `/services/[slug]` use `generateStaticParams` with `dynamicParams: true` and a 5-minute (`/work`) / 30-minute (`/services`) revalidate — cheap to fully prerender at this data volume, and `generateStaticParams` returns `[]` on any API failure so the CI build (which runs with no API configured at all) never fails.

## API layer — never throws

Every function in `src/lib/api/` returns `ApiResult<T> = {ok:true,data:T} | {ok:false,error:ApiError}` (`src/lib/api/errors.ts`). Nothing in this layer ever throws for an HTTP outcome. `ApiErrorKind` distinguishes `not_configured | network | timeout | not_found | validation | http | invalid_response` — the distinction matters because a `404` is a **valid, expected** state on two endpoints (`/resume/default/` when no resume is published, and `/seo/pages/<key>/` for any unseeded page key), and must never be confused with a transient failure.

`IS_API_CONFIGURED` (`src/lib/api/config.ts`) is `false` whenever `NEXT_PUBLIC_API_BASE_URL` is unset. Every API function short-circuits to `{ok:false, error:{kind:"not_configured"}}` with **zero fetch calls** in that case — this is what makes the CI build and this app's own production build fully offline-deterministic; verified in this phase by running `npm run build` with no env file present at all (see the CI `web` job in `.github/workflows/ci.yml`).

`apiGet`/`apiGetList` (GET only) support one bounded retry, 400ms after the first failure, and **only** on `network`/`timeout` kinds — never on a 4xx/5xx (retrying a real outage just doubles load on an already-struggling instance), and never on `apiPost` (a write must never be silently retried). `apiGetList` follows DRF's pagination envelope, re-normalizing any backend-emitted `next` URL back through this app's own `apiUrl()` builder so a backend response can never redirect the client to a different host or downgrade the scheme; it's capped at 10 pages and tolerates a bare (non-paginated) array response. `apiPost` parses a DRF `{field: [messages]}` 400 body into a typed `fieldErrors` map for per-field form UI.

## Container/view split

A deliberate architectural addition beyond the base plan, made specifically to satisfy the requirement for real "home render / Work render / project detail" tests: async Server Components have no mature RTL test harness. Every route's `page.tsx` is a thin async function that fetches data and resolves page state; the actual presentation lives in a plain, synchronous, fully prop-driven component under `src/components/views/*-view.tsx`. `HomeView`, `WorkView`, `ProjectDetailView`, `AboutView`, `ExperienceView`, `ResumeView`, `ServicesView`, `ServiceDetailView`, `ContactView`, and `PrivacyView` are all independently render-testable with plain fixture props — see the corresponding `*.test.tsx` files.

Three pure page-state resolvers isolate the not-found-vs-unavailable-vs-ready branching so it's unit-testable without Next's `notFound()` (which throws a special digest error RTL can't meaningfully assert on):

- `resolveProjectPageState()` (`src/lib/project-page-state.ts`) — `notFound()` fires **only** for a genuine 404 (this also covers a draft project like the seeded "InsightBoard" row, which the backend's own `status=published` filter already excludes from every public response — no manual exclusion list is needed on this side). A timeout or 5xx never emits a false 404, which would incorrectly tell a crawler a real, published project no longer exists.
- `resolveServicePageState()` (`src/lib/service-page-state.ts`) — the same shape, for the client-side find-by-slug over `getServices()` (see below).
- `resolveResumePageState()` (`src/lib/resume-page-state.ts`) — treats **every** failure mode of `getDefaultResume()` (the documented 404, a timeout, a network failure, or `not_configured`) identically: fall back to composing the résumé view from the four list endpoints. Never `notFound()`, never `error.tsx` — the static PDF download is a bundled asset independent of any API call, so `/resume` is structurally unable to break even when every single API call fails.

## No detail endpoint for services

`backend/apps/portfolio/api/urls.py` registers only `services/`, no `services/<slug>/`. `getServiceBySlug()` (`src/lib/api/portfolio.ts`) is a thin, honest wrapper: it fetches the list (only 7 rows exist, and Next's fetch cache means `generateStaticParams`, `generateMetadata`, and the page body all share one underlying request) and finds the match locally, returning a real `not_found` `ApiError` for a slug that isn't in the list. This adds zero new backend surface.

## Case-study evidence layer

`src/content/case-studies/` — a source-controlled claim register that exists **only because the backend has no `overview`/`problem`/`solution`/`outcome` fields today** (`ProjectCaseStudyFields` in `types.ts` is declared purely for forward-compatibility and is never populated by the live API in this phase). Every stated fact is classified: `verified | inferred | pending | prohibited`. Only `verified`/`inferred` claims are ever rendered (`publishableClaims()`); `pending`/`prohibited` claims are recorded in a `withheld` array purely for reviewability and are **never** rendered — this is the register's entire purpose, not an oversight, and `src/content/case-studies/case-studies.test.ts` mechanically enforces that no `pending`/`prohibited` claim ever appears in a renderable `sections[].claims` array.

**Composition rule, test-enforced** (`src/lib/case-study-merge.ts`, `case-study-merge.test.ts`): `resolveCaseContent(project, caseStudy)` gives the **live API precedence** for any section key it supplies. The register is self-retiring, not a permanent second CMS — the day the backend gains a real `problem` field, the API's version renders and the corresponding register section is suppressed automatically, staying in its file only as historical record.

**The repo-link honesty mechanism** (`isDistinctRepoUrl()`, `src/lib/format.ts`): every project except one links to the same generic GitHub profile URL, not its own repository — a real, documented limitation. Rather than papering over it, this function mechanically compares a project's `github_url` against the known profile URL and drives an honest "GitHub profile" vs. "Source code" label plus a filled/hollow `Node`, straight from live data. During implementation this caught a real error inherited from the base plan draft: the draft case study for Yango Wing Fleet claimed it had "a genuinely distinct public repository," sourced from stale hardcoded data in the legacy frontend's own fallback object (`frontend/src/routes/projects.$slug.tsx`). A direct re-check against the **live** API showed Yango's actual `github_url` is `https://github.com/Shahriyar-Kh` — the same generic profile link as every other project. The case study was corrected before this report was written; this is exactly the kind of error the "trust the live API, verify independently" discipline exists to catch, and it caught it.

**`techbuilt-open-school-lms`** is a real, published, `featured:true` project with no `live_url`, no distinct `github_url`, no images, and zero linked technologies despite marketing language ("production-ready," "scalable") in its own description/SEO fields. It was never covered by the original content-truth audit. No case-study register entry was authored for it — doing so would mean inventing confidence this project has no evidence for. It still renders correctly via the plain API-only path (every empty field renders as honestly absent, no special-casing required), and is flagged here and in `P01_BACKEND_EVOLUTION_PLAN.md` for the backend owner's attention; this phase has no mandate to edit backend content.

## Security and CSP

Full header set in `next.config.ts`'s `headers()`: CSP, `Strict-Transport-Security` (production only), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, a restrictive `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`, `poweredByHeader: false`.

**CSP decision: conservative `'self'` + `'unsafe-inline'`, no nonce, no middleware.** Reasoning, recorded here rather than left implicit:

1. A nonce requires `middleware.ts` minting a fresh value per request, which forces every route into dynamic rendering — directly destroying the ISR/`generateStaticParams` cold-start-resilience strategy this whole app is built around.
2. This app renders **zero** untrusted HTML anywhere. Every API-sourced string reaches the DOM through ordinary JSX text interpolation, which React escapes automatically. The **only** `dangerouslySetInnerHTML` in the codebase is the JSON-LD block (`src/components/seo/json-ld.tsx`), fed only by this app's own `serializeJsonLd()`-escaped output — mechanically guaranteed to stay the only occurrence by `src/test-guards/no-dangerous-html.test.ts`.
3. `style-src 'unsafe-inline'` is unavoidable regardless of the nonce decision, since Next itself injects inline styles and the system map sets one inline custom property — so a nonce would only narrow `script-src`, for an app that has no script-injection surface to exploit there in the first place.

`images.remotePatterns` is an explicit allowlist (the API origin's `/media/**` plus `res.cloudinary.com`), never a wildcard host. `npm audit --omit=dev --audit-level=high` runs in CI as a visible, `continue-on-error: true` step — a phase that ships nothing to production shouldn't fail its build on an unrelated upstream advisory.

## Analytics abstraction

`src/lib/analytics.ts` — `trackEvent(name, props)` no-ops by default; `NEXT_PUBLIC_ANALYTICS_PROVIDER` is unset in this phase, so `setAnalyticsProvider()` is never called anywhere in the app (mechanically enforced by `src/test-guards/privacy-consistency.test.ts`), and every `trackEvent()` call is a genuine zero-cost no-op. Props are structurally limited to primitives (no nested objects/arrays can reach a provider even by accident) plus a hardcoded blocklist of form-field key names as a second line of defense. One delegated `document`-level click listener in the root layout (`AnalyticsListener`) reads `data-analytics-event`/`data-analytics-*` attributes off plain Server-Component markup — RSC sections emit these attributes with zero JS of their own, rather than each needing to become a client island.

## Testing strategy

Container/view split (above) makes every view component RTL-testable with plain fixtures. Pure resolvers make the not-found/unavailable/ready branching unit-testable without exercising Next's routing internals. Beyond ordinary unit and render tests, four **guard tests** exist specifically to keep this document's own claims mechanically true rather than aspirational:

- `src/test-guards/content-truth.test.ts` — scans all of `src/**` (excluding test files and `content/case-studies/**`, whose `withheld` arrays deliberately contain these same forbidden strings as claims that never render) for the banned-word list from `P01_BRAND_DIRECTION.md`.
- `src/test-guards/no-dangerous-html.test.ts` — asserts `dangerouslySetInnerHTML` appears in exactly one file.
- `src/test-guards/privacy-consistency.test.ts` — asserts no `document.cookie` write, no third-party tracking-script host reference, and no live call site for `setAnalyticsProvider()` outside its own definition.
- `src/content/case-studies/case-studies.test.ts` — the claim-register-specific guard described above.

One known, honestly-documented limitation: `vitest-axe@0.1.0`'s published package ships two real packaging bugs (confirmed by direct inspection of `node_modules`, not a local config issue) — its `vitest-axe/extend-expect` entry point is an empty file, and its `vitest-axe/matchers` root re-export uses `export type *`, which makes the real runtime export type-only as far as `tsc` is concerned. Both are worked around locally: `vitest.setup.ts` imports the matcher from `vitest-axe/dist/matchers` directly and registers it via `expect.extend()`, and `src/vitest-axe.d.ts` supplies the missing Vitest `Assertion` type augmentation by hand. axe-in-jsdom itself cannot evaluate color contrast or true focus order (no layout engine) — this is a real, stated limitation, not implied away; manual contrast/focus-order verification is still required and is recorded as done (or not) in `P01_IMPLEMENTATION_REPORT.md`.

## Known deviation from the original plan's commit sequencing

The original 9-commit plan assigned `lib/json-ld.ts`, `lib/case-study-merge.ts`, and `lib/home-selection.ts` to an early "API and data layer" commit, but these files import from `content/case-studies` and `content/services` (via a type-only `import type { ServiceFraming }`), which the plan assigned to a later "claim register" commit. Even a type-only import requires its target module to exist at TypeScript compile time — it's erased only at *runtime*, not during type resolution — so that commit boundary would not have built in isolation if checked out alone. Rather than retroactively re-threading every file's exact commit assignment (high cost given the full dependency graph was already built and wired together), the actual commit history in this branch groups files by their real dependency order instead of the plan's original guess at it. This is recorded here plainly rather than silently reordered without comment; see the actual commit log on this branch for the final sequencing.
