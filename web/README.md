# web — Next.js portfolio (P01 foundation)

This is a from-scratch rebuild of the frontend, built against the existing Django/DRF backend
(`../backend/`). It is **not** deployed and does not replace the live production frontend at
`../frontend/`, which stays fully in service until a later, separate, controlled cutover.

See `../docs/rebuild/P01_ARCHITECTURE.md` for the full architecture, and `P01_BRAND_DIRECTION.md`,
`P01_DESIGN_RESEARCH.md`, `P01_MOTION_MAP.md`, `P01_SEO_STRATEGY.md` for the design system this
implements.

## Local development

```bash
npm ci
cp .env.example .env.local   # then edit if needed - the defaults already point at the real backend
npm run dev
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint (includes jsx-a11y) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run typegen` | Generate `.next/types` ahead of a type check |
| `npm test` | Vitest (unit + component tests) |
| `npm run smoke` | Route smoke test against a running server (`--base <url>`) |
| `npm run check-links` | Internal broken-link crawl against a running server (`--base <url>`) |

## Environment variables

See `.env.example` for the full list and what each one does. `NEXT_PUBLIC_API_BASE_URL` unset is a
supported, deliberate state (used by CI): every API call short-circuits to a typed
"not configured" result instead of failing the build.
