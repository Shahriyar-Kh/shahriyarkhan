# P01 Route Migration Plan

How the legacy Vite app's routes (`frontend/src/routes/`) map onto the new Next.js app (`web/src/app/`). **This is a planning and reference document only — production still serves `frontend/`. No routing, redirect, or Vercel configuration change was made to production as part of this phase.**

## Route map

| Legacy route (`frontend/`) | New route (`web/`) | Status | Notes |
|---|---|---|---|
| `/` | `/` | Rebuilt, 11-section homepage | See `P01_ARCHITECTURE.md` and the homepage section table in `P01_IMPLEMENTATION_REPORT.md` |
| `/about` (implicit, folded into home) | `/about` | New, dedicated route | Narrative/philosophy preview; the full structured record lives at `/experience` |
| `/projects` | `/work` | Renamed | "Work" reads less like a student portfolio; matches the addendum's positioning |
| `/projects/:slug` | `/work/[slug]` | Renamed, same slug scheme | `generateStaticParams`, `dynamicParams: true`, 5-minute revalidate |
| `/services` | `/services` | Rebuilt | Now a real conversion page (audience/problem framing, deliverables, engagement process, CTA), not a card list |
| *(none)* | `/services/[slug]` | **New** | Zero new backend surface — `getServiceBySlug()` wraps the existing list endpoint. 4 of 7 services get the full template (`SERVICE_FRAMING`), 3 get a reduced one (owner judgment call #6) |
| `/resume` (static PDF link only) | `/resume` | Rebuilt as a real document view | PDF download kept as an unconditional, structurally-unbreakable action; see the resume-page-state resolver in `P01_ARCHITECTURE.md` |
| *(none)* | `/experience` | **New** | The full structured employment/education/skills record. Retires an earlier internal proposal to route this content through `/career` instead — `/resume` is a live, high-intent branded route today, and redirecting it away would destroy that, so all three of `/about`, `/experience`, and `/resume` are kept as distinct routes with distinct jobs |
| `/contact` | `/contact` | Rebuilt | Intent capture added (`?intent=`), still posts to the same two existing backend endpoints only |
| *(none)* | `/privacy` | **New** | Factual disclosure page, not a legal policy — see `content/privacy.ts` |
| *(none — Next default)* | `not-found.tsx`, `error.tsx`, `global-error.tsx`, `loading.tsx` | **New**, motif-styled | Replace Next's default pages at the root; route-specific `loading.tsx`/`unavailable` states exist where a route has meaningful async data (e.g. `/work/[slug]`) |
| *(none)* | `/insights`, `/insights/[slug]` | **Deliberately not built** | Roadmap-only — see `P01_BACKEND_EVOLUTION_PLAN.md`. The route smoke test (`scripts/smoke-routes.mjs`) explicitly asserts `/insights` returns 404, proving it wasn't half-built rather than simply forgotten |

## What did not change

- `frontend/` is untouched, still the live production frontend, still deployed from the existing Vercel configuration.
- `backend/` received exactly one additive, non-breaking change (the CORS origin addition) — no route, serializer, or URL change.
- No redirect rules were added anywhere in this phase; the two app trees are entirely independent until a future phase makes an explicit cutover decision.

## Sequencing for a future cutover (not part of this phase)

Left for a later phase to decide explicitly, but recorded here so the option is visible: a cutover would need (1) a decision on `/resume`'s canonical form given it's a live branded route today with real inbound traffic potential, (2) 301s from `/projects` → `/work` and `/projects/:slug` → `/work/:slug` at the edge (Vercel rewrites or a `next.config.ts` `redirects()` entry once `web/` is the production frontend), and (3) a verified Vercel root-directory swap, none of which are in scope here.
