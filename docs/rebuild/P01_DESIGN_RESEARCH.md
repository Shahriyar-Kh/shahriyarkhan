# P01 Design Research

Kept separate from `P01_BRAND_DIRECTION.md` on purpose: this document is evidence and rejections, not spec — the visual-QA acceptance gate in `P01_IMPLEMENTATION_REPORT.md` needs a clean citation target for "why wasn't X done" that isn't buried inside the direction itself.

Grounded in four targeted web searches on current portfolio/personal-site design practice, done before implementation began. **Principles were extracted, not layouts, copy, animation timing, or section structure copied from any reviewed site.**

## Adopted

- **Dark-first for a technical audience** — validated keeping the existing OKLCH palette rather than inventing a new one from scratch.
- **The blueprint/technical-drawing tradition** (strict proportion, a consistent line-weight hierarchy, annotation over decoration) — grounds the entire "Connector" motif described in the brand direction.
- **Editorial/technical-publication layout** — numbered sections, a running rule, dense typographic hierarchy over card grids.
- **`IntersectionObserver` triggers, never scroll listeners** — used throughout (`Reveal`, `SystemMapActivation`, `ScrollProgress` is the one deliberate exception, and it is rAF-throttled, not a naive scroll handler).
- **Exactly one signature scroll effect per page** — the progressive architecture reveal (`SystemMap`), never repeated as a second competing effect anywhere else on the site.
- **Reduced motion as a full content restructure, not "animation off"** — e.g. the hero role-rotator renders a static comma-separated list under `prefers-reduced-motion`, rather than simply freezing mid-animation.
- **Critical content and CTAs must be reachable without any animation completing** — the system map's authored base SVG state *is* the complete diagram (see `P01_MOTION_MAP.md`); nothing is ever gated behind a transition finishing.

## Rejected — headline item: "always show a real metric"

The single most-repeated piece of portfolio-SEO advice found across all four searches was some variant of "quantify your impact" (e.g. "reduced API response time by 35%," "increased conversion by 20%"). This is rejected on **evidence grounds, not taste**: every outcome metric that existed anywhere in this codebase's history — the legacy "reduces time-to-answer by over 60%" claim on SK-LearnTrack, "2+ Happy Clients," "10+ Projects Built," "enterprise-grade"/"production-grade" language — was independently checked against `docs/rebuild/CONTENT_TRUTH_INVENTORY.md` and found unverified. Adopting the pattern here would mean inventing a number, which this project's content rule forbids absolutely (test-enforced, `src/test-guards/content-truth.test.ts` and `src/content/case-studies/case-studies.test.ts`).

**The pattern is replaced, not simply dropped.** The site substitutes evidence a visitor can independently check in place of a percentage: a live URL with a last-confirmed date (`EvidenceLink.verifiedOn`), a genuinely distinct public repository where one exists (`isDistinctRepoUrl()`), a named auth model, an audited screenshot. *"Here is the running system, go look for yourself"* is a stronger and more falsifiable claim than an unfalsifiable percentage — and it is the only kind of claim this project has actual evidence for.

## Also rejected

- **Glassmorphism** — confirmed as currently common, which is itself a reason to avoid it for distinctiveness. `--glass`/`--glass-border` tokens were removed from the palette entirely (not just left unused) so it cannot silently creep back in later.
- **Gradient blobs** — the legacy app has four stacked radial gradients on `body`; replaced with one hairline grid.
- **Generic bento grids** — implies a false peer-equality between homepage sections that don't actually carry equal weight (a case-study spread is not the same kind of content as an FAQ).
- **Gamified/scroll-jacked navigation** — costs JS, breaks keyboard flow, and directly conflicts with the motion map's "never hijack scroll" rule.
- **AI-illustration filler** — no illustration appears anywhere in this app; every visual element is either a real screenshot, a real portrait photo, or a motif primitive drawn in plain SVG/CSS.
- **Fake terminal/code screenshots** — a fabricated-evidence pattern in visual form, the same failure mode as an invented metric.
- **Testimonial carousels** — no testimonial exists anywhere in the source data (`OPEN_DECISIONS.md` records this as still open); none is fabricated to fill the slot.
- **Skill percentage bars** — a self-rated number with arbitrary, unearned precision. Replaced with the four-tier word labels already on the `Skill.level` field (`SKILL_LEVEL_LABELS`: Beginner/Intermediate/Advanced/Expert).
- **Animated counters** — nothing on this site counts up, since nothing on this site has a real number large enough to be worth counting up to.
- **A light/dark toggle** — roadmapped, not built (see `P01_BACKEND_EVOLUTION_PLAN.md`). One properly-tuned dark palette beats two half-tuned ones for a first release.
- **An in-page motion toggle independent of the OS `prefers-reduced-motion` setting** — considered and explicitly deferred. It would need a hydration-safe, persisted client island mounted on every route, for a preference the OS setting already covers for the visitors who most need it.

## Originality argument

The combination here is derived from this project's own constraints, not copied from a genre:

1. The motif's filled/hollow `Node` *is* the claim-register status marker — the visual system and the truth discipline are mechanically the same system, not two systems that happen to share a color palette.
2. The site publishes what it does **not** claim (`LimitationsNote`) — a section type no marketing template ships, because no template needs one.
3. The one signature scroll experience (`SystemMap`) is built entirely from the motif's own primitives, not a generic third-party scroll library.
4. The palette is inherited from the legacy app on purpose, and this document says so plainly rather than presenting it as a new invention.
