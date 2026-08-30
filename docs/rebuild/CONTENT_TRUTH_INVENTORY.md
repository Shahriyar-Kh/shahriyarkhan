# Content Truth Inventory

Audit date: 2026-08-27. Every row cites the exact file(s) it was found in. Nothing here has been invented, rounded, or reconciled across conflicting sources — conflicts are listed as their own rows, not resolved. "Confidence" reflects how directly the repository supports the value, not whether it is true.

Legend — **Verification status**: `Repo-confirmed` (appears consistently in code/config), `Contradicted` (repo sources disagree), `Unverified` (only self-declared, no external evidence), `Missing` (referenced but not backed by data), `Private` (should not be republished as-is).

## Identity

| Content item | Source(s) | Current wording/value | Public/private | Verification | Confidence | Recommendation | Notes |
|---|---|---|---|---|---|---|---|
| Full name | `frontend/index.html:49`, seed data, Header/Footer everywhere | Shahriyar Khan | Public | Repo-confirmed | High | Keep | Fully consistent everywhere. |
| Preferred short/alt name | `frontend/index.html:50` (`alternateName: "Shary"`), meta keywords on every page | Shary | Public | Repo-confirmed | High | Keep | Used only in metadata/keywords, never in visible body copy. |
| Professional title | `frontend/index.html:9`, `about.tsx:33-37`, hero typewriter roles (`index.tsx:15-21`) | Varies: "Software Engineer", "Python Developer", "Django Developer", "Backend Developer", "Full Stack Developer" — all used as equally-weighted self-descriptions | Public | Repo-confirmed (as a *set*, not one canonical title) | Medium | Request approval | No single canonical title exists; rebuild positioning ("Software Engineering Studio") is a stated *intention*, not present in current content. |
| Location | Header, Footer, Contact page, `SiteSetting` seed (`seed_portfolio_data.py:61`) | Islamabad, Pakistan (Footer adds "· Remote-friendly") | Public | Repo-confirmed | High | Keep | Consistent. |
| Public email (primary) | `index.html:53`, Header, Footer, Contact fallback, `SiteSetting.public_email` seed | shahriyarkhanpk1@gmail.com | Public | Repo-confirmed | High | Keep, confirm still monitored | |
| Secondary email (send-from identity) | `DEPLOYMENT_ENV.md:41` (`DEFAULT_FROM_EMAIL`) | shahriyarkhanpk3@gmail.com | Currently semi-private (only in a committed doc, not shown to site visitors) | Repo-confirmed as a config value | Medium | Request approval | Different address than the public contact email; confirm this is intentional (transactional "from" address vs. public contact address) before reusing. |
| Phone / WhatsApp | Contact page, Footer, Resume fallback | +92 311 0924560 (Contact/Resume) vs. "+92 311 092 4560" (Footer — extra space) | Public | Contradicted (formatting only, same number) | High | Rewrite | Standardize formatting; number itself is consistent. |
| LinkedIn | `index.html:61`, Header, Footer, Contact, seed `social_links` | https://linkedin.com/in/shahriyarkhan786 | Public | Repo-confirmed | High | Keep | Identical string everywhere (no `www.`, no trailing slash) — good, keep exact form or deliberately normalize once. |
| GitHub | `index.html:62`, Header, Footer, Contact, seed `social_links`, **every single project's `github_url`** | https://github.com/Shahriyar-Kh | Public | Repo-confirmed (profile), **Missing** (per-project repos) | High (profile) / Low (per-project) | Request approval | Every showcased project links to the same generic profile URL, not its own repository — no project has a distinct, verifiable source-code link. |
| Canonical public domain | `index.html:14,18,52` (`https://shahriyarkhan.dev`) **vs.** live infra (`https://shahriyarkhan.vercel.app` frontend, `https://shahriyarkhan.onrender.com` backend, per `DEPLOYMENT_ENV.md`) | Three different domains in play | Public | **RESOLVED (P01A, 2026-08-27, temporary):** `shahriyarkhan.dev` removed from all public metadata; `https://shahriyarkhan.vercel.app` is now the approved temporary canonical everywhere (index.html, seo.ts, JSON-LD, sitemap, robots.txt). A permanent domain decision is still open. | High that this is a real conflict | Approved — temporary canonical set; permanent domain still open | See [OPEN_DECISIONS.md](OPEN_DECISIONS.md) and [P01A_STABILIZATION_REPORT.md](P01A_STABILIZATION_REPORT.md). |

## Biography

| Content item | Source | Value (summarized) | Verification | Confidence | Recommendation | Notes |
|---|---|---|---|---|---|---|
| Bio narrative | `about.tsx:64-93` | Backend-focused Software Engineer, Python/Django/DRF/FastAPI/React, open to full-time and freelance | Repo-confirmed as *stated self-description* | High (it's the owner's own words) / Unverifiable (career claims) | Rewrite for studio positioning | Reasonable raw material; needs to be reframed for the four target audiences, not copied verbatim. |
| Work philosophy / how-I-work copy | `about.tsx:76-94` | "Clarity over complexity," milestone-based delivery | Unverified (aspirational statements, no evidence of process) | Medium | Rewrite | Generic; fine as a starting point, not evidence of practice. |
| Languages spoken | `about.tsx:115` | Pashto (Native), Urdu (Native), English (Professional) | Unverified (self-declared) | Medium | Keep | Low risk, plausible personal fact. |

## Education

| Content item | Source(s) | Value | Verification | Confidence | Recommendation | Notes |
|---|---|---|---|---|---|---|
| Degree | `about.tsx:10`, `resume.tsx:189-190`, `seed_portfolio_data.py` `Education` seed | BS Software Engineering, Abasyn University, Peshawar, CGPA 3.67 | Repo-confirmed (consistent across 3 independent sources) | High for consistency, Unverified for the CGPA/graduation claim itself (no transcript/certificate in repo) | Keep, request approval to confirm graduation status wording | Seed data models it as `start_date=2021-09-01`, `end_date=2025-06-30`, `description="Graduated 2025 • CGPA 3.67"`. |

## Experience / employment history — ⚠ contains an unresolved contradiction

| Content item | Source(s) | Value | Verification | Confidence | Recommendation | Notes |
|---|---|---|---|---|---|---|
| Current role | `index.tsx:119-131`, `resume.tsx:119-130`, seed `experiences[0]` | Software Developer, **HA Technologies (Private) Limited** — homepage wording — vs. **HA Technologies (Pvt) Ltd** — résumé/seed wording; Islamabad; Jun 2025–Present | Repo-confirmed (role/dates), Contradicted (company-name formatting only) | High | Rewrite (standardize legal-name wording), confirm still current | |
| Internship 2 | `index.tsx:132-145`, `resume.tsx:131-140`, seed `experiences[1]` | Python Developer Intern, CodeAlpha, Remote, Feb 2025–May 2025 | Repo-confirmed, consistent | Medium (dates/title consistent across sources; underlying employment itself unverified beyond self-report) | Keep | |
| Internship 3 | `index.tsx:146-159`, `resume.tsx:141-150`, seed `experiences[2]` | Web Developer Intern (**"Team Lead"** per résumé/seed only), Abasyn University Incubation Center, Peshawar, Sep 2024–Feb 2025 | Contradicted (homepage omits "Team Lead" title/scope; résumé and seed both include it) | Medium | Request approval | Minor but real scope discrepancy — was this a lead role or not? |
| Internship 4 — **only on homepage** | `index.tsx` — moved 2026-08-27 into `hiddenExperienceItemsPendingVerification` (was `experienceItems`) | Python Development Intern, CognoRise InfoTech, Remote, Oct 2024–Dec 2024 | **Contradicted / Missing** — does not appear in `resume.tsx` fallback, does not appear in `seed_portfolio_data.py` at all | Low | **HIDDEN pending approval (P01A, 2026-08-27)** — not carried forward, not deleted | This role's dates (Oct–Dec 2024) overlap with the Abasyn Incubation Center role (Sep 2024–Feb 2025) listed everywhere else. Either this is a genuine concurrent internship (plausible) or a leftover/erroneous entry — only the owner can say which. P01A moved this entry out of the public-rendering array into a separate, clearly-named, non-deleted constant so it no longer displays on the home page; it has no backend record to hide separately (confirmed absent from `Experience` model/seed data). See [OPEN_DECISIONS.md](OPEN_DECISIONS.md) and [P01A_STABILIZATION_REPORT.md](P01A_STABILIZATION_REPORT.md). |
| Certifications | `resume.tsx:205-213` **only** (hardcoded fallback array; no backend model exists for certifications at all) | 5 Coursera course-completions (Python, Front-End Dev, Advanced React, HTML/CSS, Version Control) | **Missing backing model + Unverified** | Low | Request approval | No certificate IDs/links/dates in the repo to confirm completion; also has no way to be managed short of editing source code. |

## Skills

| Content item | Source | Value | Verification | Confidence | Recommendation | Notes |
|---|---|---|---|---|---|---|
| Skill categories & items | `skills.tsx` fallback, `seed_portfolio_data.py` skill_map | Backend, Frontend, Database, Tools, Deployment, AI & ML — ~25 named technologies | Repo-confirmed (internally consistent) | Medium (technology names are verifiable; usage/depth is not) | Rewrite (drop 0–100% bars) | Reasonable raw list. |
| Skill proficiency percentages | `skills.tsx:24-93` (e.g. Python 90%, Docker 50%) | Numeric 0–100 self-ratings | **Unverified — self-rated, no external validation, arbitrary precision** | Low | Retire the precise-percentage presentation | A studio-positioned site should not present unverifiable precision as fact; qualitative framing (e.g. "primary stack" vs "familiar with") is more defensible. |

## Projects

| Content item | Source(s) | Value | Verification | Confidence | Recommendation | Notes |
|---|---|---|---|---|---|---|
| NoteAssist AI — Productivity Platform | `index.tsx`, `projects.tsx`, `projects.$slug.tsx` fallback, seed data | Django/DRF/React/PostgreSQL/Redis/JWT; live at noteassistai.vercel.app | Live URL **confirmed reachable** 2026-08-27 (200) | Medium-High | Keep, verify exact role/authorship | Case-study prose ("reduced time-to-answer by over 60%", `projects.$slug.tsx:63`) is an **unverified metric** — no source data for the 60% figure anywhere in the repo. |
| SK-LearnTrack — AI Learning Platform | Same sources | Django/DRF/React/PostgreSQL/OpenAI; live at sk-learntrack.vercel.app | Live URL **confirmed reachable** 2026-08-27 (200) | Medium-High | Keep, verify exact role/authorship | |
| FeelWise — Emotion Detection System | Same sources | FastAPI/Node.js/MongoDB/JWT, microservices; live at feelwise-emotion-detection.feelwise.workers.dev | Live URL **confirmed reachable** 2026-08-27 (200) | Medium-High | Keep, verify exact role/authorship | |
| Advanced Restaurant Management System | `projects.tsx`, `projects.$slug.tsx` fallback, seed data | Desktop app, Python/Django/PyQt5/SQLite, no live URL (by design — desktop app) | Not applicable (no live URL claimed) | Medium | Keep | Internally consistent, no contradiction found. |
| **InsightBoard CRM — Sales Intelligence Dashboard** | `seed_portfolio_data.py`, `seed_insightboard_project.py` **only** — absent from every frontend fallback array | Django/DRF/React/PostgreSQL/Chart.js/Tailwind; claimed live at insightboard-crm.vercel.app | **Live URL confirmed dead (404) 2026-08-27**; preview/featured images are generic Unsplash stock photos, not product screenshots | **Low — do not present as a real shipped product without owner confirmation** | **HIDDEN (P01A, 2026-08-27)** — both seed scripts now create/update this Project row with `status=draft, featured=False`; it is excluded from every public API endpoint and the sitemap, still fully visible/editable via the Django admin, and not deleted. Not yet retired outright pending an explicit owner decision. | This is the clearest instance in the repo of exactly the kind of synthetic/decorative content the rebuild must not carry forward. See risk #4 in [P00_EVIDENCE_FREEZE.md](P00_EVIDENCE_FREEZE.md) and [P01A_STABILIZATION_REPORT.md](P01A_STABILIZATION_REPORT.md) for the fix and its test coverage. |
| Project outcome/impact metrics (all projects) | `projects.$slug.tsx` `overview`/`solution`/`outcome` fields | Prose like "reduced time-to-answer by over 60%", "production-grade", "successfully deployed" | **Unverified — no measurement data, client confirmation, or analytics behind any of these claims** | Low | Rewrite or request approval per project | Per the critical content rule, none of these should be restated as fact in the rebuild without a verifiable source. |

## Services

| Content item | Source | Value | Verification | Confidence | Recommendation | Notes |
|---|---|---|---|---|---|---|
| Service catalog (7 services) | `services.tsx` fallback, `seed_portfolio_data.py` services list | Website Dev, Restaurant Website, Ecommerce, SaaS, Portfolio Sites, Backend Dev, Custom Web App | Repo-confirmed (consistent naming/descriptions) | Unverified as *deliverable capability* — no evidence of a completed engagement for several of these (e.g. no restaurant-website or ecommerce project appears anywhere in the projects list) | Request approval per service | Ask which of these 7 can genuinely be delivered now vs. are aspirational (see [OPEN_DECISIONS.md](OPEN_DECISIONS.md)). |

## Metrics (home-page stat strip)

| Content item | Source | Value | Verification | Confidence | Recommendation | Notes |
|---|---|---|---|---|---|---|
| "Happy Clients" | `index.tsx:96` | 2+ | **Unverified — no client list, testimonial, or contract evidence anywhere in the repo** | Low | Retire or request approval | Per the critical content rule, client-count claims must not be invented or carried forward unverified. |
| "Projects Built" | `index.tsx:97` | 10+ | **Unverified** — only 5 distinct projects (4 real + 1 unverified/InsightBoard) are documented anywhere in the repo | Low | Retire or request approval | Repo evidence supports at most 4–5, not 10+. |
| "Real Roles" | `index.tsx:100` | **UPDATED (P01A, 2026-08-27): 3** (was 4, hardcoded stat, independent of the experience list) | This stat previously counted CognoRise InfoTech even though it was displayed alongside 3 other roles in the same array; hiding CognoRise (see Experience section above) would otherwise have left the stat saying "4" next to a visibly 3-entry timeline | Low-Medium | Updated to stay consistent with the now-visible 3-role timeline; still a hardcoded number, not derived from `experienceItems.length` - a future phase should make it derive automatically so it can't drift again | Fixed as a direct, necessary consequence of hiding CognoRise, not scope creep - see [P01A_STABILIZATION_REPORT.md](P01A_STABILIZATION_REPORT.md). |
| "Core Data Layers" / "Primary Stacks" | `index.tsx:99-100` | 4+ / 5+ | Repo-confirmed as a count of named technologies in the fallback list itself (i.e., true by construction of the copy, not by independent evidence) | Medium | Keep or retire per studio-tone decision | Lower-risk than the client/project counts since it's just counting named tools. |

## Testimonials, team, awards

| Content item | Finding | Verification | Recommendation |
|---|---|---|---|
| Testimonials | **None found anywhere in the repository** — no model, no seed data, no frontend content | N/A | Do not invent; if desired for the rebuild, must be sourced and attributed with explicit permission. |
| Team members | **None found** — repo consistently presents a single-person practice | N/A | Consistent with solo positioning; do not imply a team. |
| Awards / certifications beyond the 5 Coursera entries | **None found** | N/A | Do not invent. |

## Availability

| Content item | Source | Value | Verification | Recommendation |
|---|---|---|---|---|
| Availability statement | Footer (`footer-availability-badge`), hero portrait badge (`index.tsx:833`) | "Open to Work — Full-time or Freelance" / "Available" | Unverified — self-declared, time-sensitive, not database-backed (hardcoded, not from `SiteSetting`) | Should become a single source of truth (e.g. a `SiteSetting` field) so it can be turned on/off truthfully; currently two hardcoded badges could drift out of sync with reality. |

## Résumé file

| Content item | Source | Value | Verification | Recommendation |
|---|---|---|---|---|
| Résumé PDF | `frontend/public/resume/Shahriyar_Khan_Software_Engineer.pdf` (268,930 bytes) | Real file, downloadable from `/resume` page | File existence repo-confirmed; **contents not opened by this audit** (privacy-minimizing, per instructions) | Confirm this is the current/approved version before carrying forward; note it is disconnected from the `ResumeVersion`/`ResumeExport` backend models (§5 of P00_EVIDENCE_FREEZE.md). |
