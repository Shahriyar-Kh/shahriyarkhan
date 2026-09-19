# P01 SEO Strategy

## Honest framing, stated up front

This is a `.vercel.app` subdomain with no backlinks and no domain age. Only branded queries ("Shahriyar Khan," "Shahriyar Khan Django developer") have a realistic near-term ranking chance; everything else is long-tail at best. Meaningful non-branded SEO work is blocked on the still-open permanent-domain decision (`docs/rebuild/OPEN_DECISIONS.md` #3). This document records the mechanics that are correct regardless of that decision, not a promise of rankings.

## Per-route intent map

| Route | Primary intent | Supporting terms | pageKey (PageSEO enhancement) |
|---|---|---|---|
| `/` | "Shahriyar Khan software engineer" | Python developer, Django developer, Islamabad Pakistan | `home` |
| `/about` | "Shahriyar Khan about" | backend developer Islamabad, Python developer Pakistan | `about` |
| `/work` | "Django developer portfolio" | Python developer projects, Django REST API projects | `work` |
| `/experience` | "Shahriyar Khan experience" | Django developer experience, work history | `experience` |
| `/resume` | "Shahriyar Khan resume" | Shahriyar Khan CV, Django developer resume | `resume` |
| `/services` | "Django developer for hire" | hire Python backend developer, Django REST API development services | `services` |
| `/contact` | "contact Shahriyar Khan" | hire Django developer | `contact` |
| `/privacy` | (noindex-adjacent — factual disclosure page, not a ranking target) | — | `privacy` |

Exact copy lives in `src/content/metadata.ts` (`ROUTE_METADATA_DEFAULTS`) as the hand-written default for every route; `PageSEO` from the live API is a strict enhancement layer on top via `mergePageSeo()` (`src/lib/metadata.ts`), never a requirement — an unseeded `page_key` falls back to the default silently. Title ≤60 chars, description 120–160 chars, both mechanically checked in `src/lib/metadata.test.ts` against every entry in `ROUTE_METADATA_DEFAULTS`.

**Terms deliberately excluded, on the same truth-discipline grounds as the content rules elsewhere in this project:** "freelance Django developer" (self-declared availability is not database-backed — `OPEN_DECISIONS.md` #9), "senior [...] developer," any certification term, any client-count term, "studio"/"agency"/"we" (this is a `Person`, never an `Organization`).

## No keyword-stuffing

Every description above reads as a sentence a human would write, not a term list. The keyword fields feeding `<meta name="keywords">` are short, factual noun phrases derived directly from the route's real content — never a padded list of synonyms.

## Structured data

All of `src/lib/json-ld.ts`, rendered via the single `<JsonLd>` component (`src/components/seo/json-ld.tsx`):

- **`Person`** with a stable `@id` (`${SITE_URL}/#person`), referenced by `@id` everywhere else rather than redefined per page — a real improvement over the legacy app, which repeats the full `Person` object on every route.
- **`WebSite`**, referencing the same `Person` `@id` as `publisher`.
- **`ProfilePage`**, one per page, `mainEntity` pointing at the `Person` `@id`.
- **`BreadcrumbList`** on every route with a parent (all routes except `/`), including both `[slug]` route types.
- **`WebApplication`/`CreativeWork`** per project (`projectSchema()`), decided mechanically by `qualifiesAsSoftwareApplication()` — "if you can't click it, it isn't an application listing." The one project with no live URL by design (a desktop app) gets `CreativeWork`, never a fabricated `WebApplication` entry.
- **`Service`** schema, but **only** for the four services with a `SERVICE_FRAMING` entry (owner judgment call #6 in the original plan) — `serviceSchema()` returns `null` for the other three, and the page renders no `<JsonLd>` at all in that case rather than an empty/misleading one.
- **Never `Organization`** anywhere in this codebase — mechanically test-enforced (`src/lib/json-ld.test.ts` asserts `personSchema()["@type"] === "Person"` and `websiteSchema()["@type"] === "WebSite"`).
- **Never `offers` or `aggregateRating`** on any schema — neither exists for anything on this site, and their absence (meaning no Google rich-snippet eligibility) is accepted rather than fabricated. Test-enforced (`json-ld.test.ts` asserts neither key is ever present).
- `serializeJsonLd()` escapes `<`, `>`, and `&` across the *entire* serialized string, not just tag-looking substrings — the correct mitigation for a `</script>` breakout inside an `application/ld+json` block. This is the sole `dangerouslySetInnerHTML` in the codebase, and `src/test-guards/no-dangerous-html.test.ts` asserts it stays that way.

## OG images

`src/lib/og-image.tsx` defines a shared `OgImageLayout`, rendered per-route via `next/og`'s `ImageResponse`:

- `app/opengraph-image.tsx` — the site-wide default.
- `app/work/[slug]/opengraph-image.tsx` — per-project, title + `ai_summary`/`description`.
- `app/services/[slug]/opengraph-image.tsx` — per-service, title + description.

Satori (the renderer behind `next/og`) cannot parse `oklch()`, so the layout uses a small, separately-maintained sRGB hex mirror of the palette rather than the CSS custom properties used everywhere else. It deliberately uses no custom font (Satori needs a real font *buffer*, not a `next/font` reference, and loading one just for share-card text was judged not worth the added build complexity for this phase) — it falls back to Satori's built-in system font. Every dynamic OG route **never throws**: a fetch failure falls back to a generic site-default composition, because a throwing OG route would produce a permanently broken share-card image that gets cached by whichever platform already scraped it.

## Favicon

`app/icon.tsx` / `app/apple-icon.tsx` close a confirmed gap — the legacy app has no favicon anywhere (`frontend/public/` has none, and `index.html` has no `<link rel="icon">`). Both draw the same Node+Run corner mark used throughout the site, in plain `<div>`s (Satori-safe — no `oklch()`, no external assets).

## noindex rules

- The résumé PDF (`/resume/Shahriyar_Khan_Software_Engineer.pdf`) carries `X-Robots-Tag: noindex` via a scoped rule in `next.config.ts`'s `headers()`, and is disallowed in `robots.ts` — so a branded search lands on the `/resume` HTML page (which has its own real metadata), not a bare file.
- No other route is noindexed. `/privacy` is indexable but not a ranking target by design (see the intent table above).

## Sitemap and robots

`app/sitemap.ts` lists every static route plus every published project and service, with `lastModified` sourced from each row's real `updated_at` field — **never** `new Date()` per request, which would make every entry look freshly changed on every crawl regardless of reality. `app/robots.ts` allows everything except the résumé PDF and points at `/sitemap.xml`.

## Future work (documented, not built)

Search Console verification, Bing Webmaster Tools, and any backlink-building work are explicitly out of scope for this phase and blocked on the permanent-domain decision — tracked in `P01_BACKEND_EVOLUTION_PLAN.md`.
