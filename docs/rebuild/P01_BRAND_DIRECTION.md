# P01 Brand Direction

Binding creative direction for the Next.js portfolio rebuild at `web/`. Written before implementation began and followed file-for-file; any deviation is called out in `P01_IMPLEMENTATION_REPORT.md`.

## Positioning

**Statement:** "Python and Django engineering for REST APIs, authenticated business platforms, and deployed web products."

Chosen over the addendum's own suggested "reliable"/"production-ready" wording because "deployed" is checkable against four live URLs in the current project set; the alternatives are not verifiable from anything in this repository. See `docs/rebuild/CONTENT_TRUTH_INVENTORY.md` for the audit this statement was checked against.

## Title

**"Software Engineer · Python & Django"** displayed; `jobTitle: "Software Engineer"` in the `Person` JSON-LD schema (`src/lib/json-ld.ts`). This is already the live value in the legacy app's own schema (`frontend/index.html`), so adopting it introduces zero new claim. "Senior" is never used anywhere in this codebase — the audit found roughly one year in a single full-time role plus two internships and a 2025 degree, which does not support it (mechanically enforced by `src/test-guards/content-truth.test.ts`).

## Brand promise

*"You will always be able to see the system behind the screenshot — and see exactly how confident I am in every claim on this page."*

A promise about epistemics, not outcomes. It is the one thing a template site structurally cannot copy, because no template ships a claim register (`src/content/case-studies/`) or a "what this page does not claim" block (`src/components/work/limitations-note.tsx`).

## Audience priority

**Recruiter → Client → CTO**, taken directly from the order the quality-upgrade addendum itself listed the three journeys in. Every page's primary/secondary CTA pairing follows this priority — see the hero (`src/components/sections/hero.tsx`) and the closing dual-CTA section (`src/components/sections/dual-cta.tsx`), both of which put the recruiter-facing action first.

## Voice and tone

Precise, declarative, engineer-to-engineer, non-superlative. Construction verbs (*built, designed, deployed, implemented, integrated*) over adjectives. Limitations are stated in the same voice as capabilities — a limitation is content, not an apology (see `LimitationsNote`).

**Banned words**, mechanically enforced by `src/test-guards/content-truth.test.ts` against everything except the claim register's own `withheld` arrays (which exist specifically to record these same strings as claims that are never rendered): *AWS certification, senior software engineer, enterprise-grade, production-grade, trusted by, happy clients, projects built, reduces time-to-answer, world-class, best-in-class*.

**Never "we."** This is a single-person practice; the copy says so consistently, and the JSON-LD is `Person`, never `Organization` (also test-enforced, `src/lib/json-ld.test.ts`).

## Visual thesis

*"The site is laid out like a technical document about a system, not a brochure about a person."* Numbered sections (`SectionIndex`, e.g. "03 / WORK"), a persistent measure/rule structure, annotation over decoration.

## Signature motif — "The Connector"

An orthogonal rule-and-node system, pure SVG/CSS — no images, filters, or gradients beyond one hairline grid (see below). Four primitives, all in `src/components/motif/`:

- **`Node`** (`node.tsx`) — a 6×6px square. Filled = verified/active, hollow = inferred/inactive. This is not decorative: it is the *same* status marker the claim register uses (`ClaimBadge`, `src/components/work/claim-badge.tsx`) — the visual system and the truth discipline are one system, not two that happen to share a color.
- **`Connector`/"Run"** (`connector.tsx`) — a 1px orthogonal rule. Never curves; corners are composed from two Runs, not a curved path.
- **`Tick`** (`tick.tsx`) — a perpendicular annotation mark paired with mono text, used for dates and short factual annotations only.
- **`CornerFrame`** (`corner-frame.tsx`) — four L-bracket corner marks replacing a rounded card border.

**Reused across at least nine surfaces** (satisfying the addendum's "recognizably reused across nav/homepage/work/services" requirement): the active nav item (`NavLink`'s underline is a `Run`, not a pill), the hero portrait frame + `Tick` annotations, the homepage system-map section, project cards (`ProjectCard`), the case-study claim badges and evidence rail, the services engagement track (`EngineeringApproach`, `ServiceDetailView`), the global scroll-progress rule (`ScrollProgress`), and the favicon/OG images (`app/icon.tsx`, `src/lib/og-image.tsx`), which draw the same corner mark at a different scale.

## Typography

Kept **Sora** (headings) and **Manrope** (body) from the legacy app — already the correct register for this audience, and changing them would make this a rebrand rather than a rebuild. Added **JetBrains Mono** (`--font-mono`, weights 400/500, `preload:false`) for data and annotation: section numbers, tech names, claim dates, API-shaped labels. All three load via `next/font/google` in `src/app/layout.tsx`, which self-hosts them at build time — closing a real, if minor, privacy gap in the legacy app, which requests fonts from `fonts.googleapis.com` at runtime on every visit.

## Color

The existing OKLCH palette is kept (`src/app/globals.css`) — dark-first is validated for this technical audience by the design research (`P01_DESIGN_RESEARCH.md`), and `--primary`/`--accent` sit at the same OKLCH lightness (0.68), which suits a motif that carries hierarchy through line-weight rather than an accidental lightness jump.

**New semantic rule:** teal `--accent` marks verified/live evidence; blue `--primary` marks structure/navigation. Every filled `Node` is teal; every `Run` is blue.

**Deliberate subtraction:** the legacy body's four stacked radial gradients — exactly the "gradient blob" pattern the addendum bans — are replaced by one hairline blueprint grid (`repeating-linear-gradient`, 1px/96px, ~3% alpha) plus one low-alpha vignette. `--glass`/`--glass-border` are dropped from the token set entirely, not ported-and-unused, so glassmorphism cannot be reached for later by anyone extending this codebase.

## Photography and screenshot policy

Exact allowlist: `public/images/profile.png` or `public/images/shary-photo.jpeg` (one, inside a `CornerFrame`, never a circular/gradient-ringed avatar), the real project screenshots for the four projects with audited images, and Yango Wing Fleet's already-privacy-audited image set (`Landing_Preview_page.png`, `homepage.png`, `Registration_page.png`, `Rawalpindi_Registration.png`, `Services_page.png`, `custom_dashbaord_image1.png`). Two images are excluded beyond the already-removed `custom_dashbaord_image2.png`: `yangowing_images/homepage1.png` (shows a third party's unverified earnings-tier figures — publishing someone else's unverified numbers is the same failure mode as fabricating your own) and the unused `homepage2.png`/`homepage3.png`. No stock photography, no AI illustration, no fake terminal or code screenshot anywhere in this codebase.

## Anti-template rules

No container radius above `--radius-lg`. Zero `backdrop-filter`/`blur(` anywhere (grep-clean as of this report). No decorative gradient beyond the one hairline grid and vignette. No idle/continuous animation — the hero role-rotator (`RoleRotator`) is the single deliberate exception, and it carries real information (rotating job titles), not decoration. Every icon is either a real technology mark or a motif primitive — `src/components/ui/icon.tsx` is an exhaustive, enumerable list of every icon this app uses. No 3-across equal-card grid unless the items are genuine peers. No "we." Never `Organization` schema.
