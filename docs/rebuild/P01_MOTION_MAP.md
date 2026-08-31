# P01 Motion Map

Per-element choreography for every animated surface in `web/`, and the rules every one of them follows.

## Global rules

1. **Never hijack scroll.** No element intercepts, blocks, or delays the browser's own scroll behavior. `ScrollProgress` reads scroll position via a `requestAnimationFrame`-throttled listener but never calls `preventDefault()` or programmatically scrolls the page.
2. **Compositor-friendly properties only** — `opacity`/`transform` — with **one documented exception**: `SystemMap` animates `stroke-dashoffset` on at most 12 short SVG paths, once, never scroll-linked, and disabled entirely below 768px (see below). This is recorded here as a deliberate exception, not hidden inside a generic "transform only" claim.
3. **No essential content is ever gated behind an animation completing.** Mechanically enforced for the system map: the SVG's authored base state (no `data-*` attributes present) *is* the complete, final diagram. See "The signature scroll-driven experience" below.
4. **No continuous or idle decorative animation.** The hero role-rotator (`RoleRotator`) is the one repeating timer on the site, and it carries real information (job titles), not decoration — it also pauses when the tab is hidden (`visibilitychange`).
5. **Exactly one signature scroll-driven experience per page**, only on `/` (§04) and `/work/[slug]` (via `ProjectCaseSections`, when present).
6. **Reduced motion is a full content restructure**, not "animation off":
   - `RoleRotator` renders a static `roles.join(" · ")` string.
   - `Reveal` renders its children with no wrapper styling at all.
   - `SystemMap`'s CSS-driven hide/reveal is scoped entirely inside `@media (prefers-reduced-motion: no-preference)` in `globals.css` — under `reduce`, that block simply never applies, and the diagram renders in its complete, authored state.
7. **Motion budget:** roughly 20 animated elements per viewport at most, and well under 1.2s of total animation time from first paint on any given page — no page on this site approaches either limit.
8. **Deliberately no page-transition animation.** Next's App Router has no stable, non-hacky RSC view-transition primitive as of this build; `next/link` prefetching already makes navigation feel near-instant. Roadmapped for a future phase once the `ViewTransition` API stabilizes (see `P01_BACKEND_EVOLUTION_PLAN.md`).

## Per-element choreography

| Element | File | Trigger | Motion | Reduced-motion behavior |
|---|---|---|---|---|
| Hero role-rotator | `components/sections/role-rotator.tsx` | `setInterval`, 2.6s | Crossfade (`@keyframes fade-in`, `globals.css`) | Static comma-separated list; timer never starts |
| Header scroll state | *(not built — the header has no scroll-triggered state change in this phase)* | — | — | — |
| Nav active marker | `components/layout/nav-link.tsx` | Route match | `scale-x` transform on the underline `Run` | Underline still present, just no transition |
| Mobile nav open/close | `components/layout/mobile-nav.tsx` | Click / route change (render-time state adjustment, not an effect) | Panel mount/unmount, no transition currently applied | Unaffected — no animation to reduce |
| Section reveal | `components/layout/reveal.tsx` | `IntersectionObserver`, threshold 0.15 | `opacity` + `translateY(0.75rem→0)` | No wrapper styling at all — content is immediately in its final state |
| Reveal + keyboard focus | same file | `onFocusCapture` | Immediately sets `visible=true` | N/A — this is the accessibility fix itself: a keyboard user tabbing into a still-hidden child must never land on invisible content |
| Scroll-progress rule | `components/motif/scroll-progress.tsx` | rAF-throttled `scroll` listener | `scaleX` transform, `transform-origin: left` | Hidden entirely below 768px; unaffected by reduced motion since it's a progress indicator, not decoration |
| Project-card / CornerFrame hover | `components/motif/corner-frame.tsx` | `:hover` / `group-hover` | Corner-mark `opacity` 0.7→1 | Unaffected — a hover affordance, not a motion sequence |
| The system map | `components/motif/system-map*.tsx` | `IntersectionObserver`, threshold 0.35, fires once then unobserves | `stroke-dashoffset` (documented exception) + `opacity`/`transform: scale()` on nodes | Entire CSS block is scoped inside `@media (prefers-reduced-motion: no-preference)` — under `reduce`, never applies |

## The signature scroll-driven experience: progressive architecture data-flow reveal

`components/motif/system-map.tsx` + `system-map-activation.tsx` + `system-map-legend.tsx`, placed at homepage §04 (`system-map-section.tsx`) and reused on `/about`.

**Chosen over three alternatives**, for the reasons recorded at plan time:
- A pinned spotlight — fragile at 360px, and blank/unreadable if unpinned under reduced motion.
- A stacked-card transition — reads as a 2023–2025 template trend, and is usually disabled on mobile anyway (i.e., it wouldn't even be the same experience across breakpoints).
- A scroll-driven timeline — would duplicate `/experience`'s own job, and carries the lowest originality of the four candidates.

The system map uniquely: is built entirely from the motif's own `Node`/`Run` primitives (not a generic diagramming library); degrades to a complete, static SVG with zero layout shift; needs exactly one `IntersectionObserver` and no scroll math; and cannot hijack scroll by construction, since it never reads or writes scroll position at all.

**Mechanics** (implemented exactly as specified at plan time, verified in `globals.css` lines ~253–320):

- The SVG's authored base state — no `data-enhanced`/`data-active` attributes present anywhere — **is the final, complete diagram.** All runs drawn, all nodes visible.
- `SystemMapActivation` (`'use client'`, ~30 lines) sets `data-enhanced="true"` on its own wrapping `<div>` after mount, then `data-active="true"` on the first intersection (fires once, then calls `unobserve()` — no scrubbing, no reverse).
- The CSS that hides anything is scoped with a descendant combinator — `[data-enhanced="true"]:not([data-active="true"]) [data-system-map] path[data-run]` — because `data-enhanced`/`data-active` live on the wrapper `<div>`, one level above the `<svg data-system-map>` itself, not on the same element.
- **Net effect:** JS disabled → `data-enhanced` never appears → CSS selector never matches → diagram renders complete. Reduced motion → the whole rule block is inside a `no-preference` media query → never applies → diagram renders complete. Observer never fires (old browser, or scrolled past too fast for one 0.35-threshold callback) → `SystemMapActivation`'s own fallback branch (`!("IntersectionObserver" in window)`) sets `data-active="true"` itself → never stuck hidden.
- Below 768px, a separate `@media (max-width: 767px)` block forces every dash-offset/opacity/transform to its final value with `!important` and `transition: none !important` — the map is fully static on small screens, with no dependency on the observer ever firing on a viewport that's typically touch-scrolled past quickly.
- **Placement rule:** below the fold only (`data-enhanced` is set post-first-paint via `useEffect`; an above-the-fold placement would visibly flash complete → hidden → animated on every load).
- **Accessibility:** the `<svg>` carries `role="img"` plus `<title>`/`<desc>`; `SystemMapLegend` renders the identical layer/technology information as an always-visible (never `sr-only`) `<ol>` beneath the diagram, in the same reading order — there is no information that exists only inside the SVG.
- Technology labels are drawn from live `Skill` data passed in by the caller (`system-map-section.tsx`'s `pickForLayer()`), with a fixed, conservative fallback set only if that fetch fails — so the diagram can never drift from what the API actually reports.
