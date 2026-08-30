# P01A.4 — Content and Media Audit

**Date:** 2026-08-30
**Scope:** Step 5.5 of the P01A.4 reconciliation task — auditing new/changed fallback content (Yango Wing Fleet, and the three pre-existing projects named in the task) and the Yango screenshots, for unverifiable claims and privacy exposure.

---

## 1. Yango Wing Fleet — claims audit (new content, edited in this phase)

This is genuinely new content, introduced by `origin/main`'s divergent commits and being integrated for the first time in this reconciliation. Conservative wording was applied directly (not just flagged), since this session is the first to carry it forward.

| Location | Before | After | Reason |
|---|---|---|---|
| `projects.tsx` list entry, `description` | "**Production-grade** full-stack web platform... Features online rider registration, custom admin dashboard, **real-time analytics**, and JWT-based authentication." | "Full-stack web platform... Features online rider registration, a custom admin dashboard, **operational analytics**, and JWT-based authentication." | "Production-grade" is a quality claim with no evidence in the repo; "real-time" is not established anywhere (the feature list only claims "Analytics summaries and trend visualization," not a real-time data pipeline) |
| `projects.$slug.tsx` fallback, `description` | Same as above | Same fix as above | Same |
| `projects.$slug.tsx` fallback, `ai_summary` | "A **production-ready** fleet operations platform that unifies driver onboarding, admin workflows, and **live** operational insights..." | "A fleet operations platform that combines driver onboarding, admin workflows, and operational analytics in one system." | "Production-ready" and "live" are unverifiable quality/recency claims |
| `projects.$slug.tsx` fallback, `overview` | "...built for **real-world** logistics workflows. It combines a **conversion-focused** public onboarding experience with a secure, **high-utility** admin dashboard..." | "...built for logistics workflows. It combines a public onboarding experience with an authenticated admin dashboard for day-to-day operations." | "Real-world," "conversion-focused," and "high-utility" are marketing adjectives with no supporting evidence (e.g., no conversion-rate data exists anywhere in the repo) |
| `projects.$slug.tsx` fallback, `outcome` | "A production deployment on Vercel and Render that demonstrates **enterprise-style architecture**, reliable content operations, and a polished UX..." | "A deployed platform on Vercel and Render with a clear separation between public registration flows and an authenticated admin dashboard for day-to-day fleet operations." | "Enterprise-style architecture" and "reliable content operations" are unverifiable, generic claims; replaced with a factual description of what the `solution` field already establishes (public/admin route separation, JWT auth) |

**Live-status verification** (read-only HTTP checks, matching P00's own methodology):

- `https://yango-wing-fleet.vercel.app/` → **HTTP 200** (live)
- `https://github.com/Shahriyar-Kh/yango-wing-fleet` → **HTTP 200** (public repo exists)

Unlike InsightBoard CRM, Yango Wing Fleet's live/GitHub links are genuinely reachable — no "live and accessible" language was removed, since it's accurate. The `feature_bullets`, `problem`, and `solution` fields were left unchanged — they describe implementation choices (JWT auth, admin CRUD tools, CSV export, polling-based refresh) rather than outcome metrics, and nothing in them was found to be unverifiable in the same way.

**Not fabricated by this phase:** none of the above numbers/adjectives were invented here — this audit only *removed* unverifiable language that arrived with the divergent commits; no new claim, metric, or technology was added.

## 2. Yango Wing Fleet — screenshot privacy audit

All 7 images referenced by the new fallback content were visually inspected.

| File | Referenced in code? | Content | Verdict |
|---|---|---|---|
| `Landing_Preview_page.png` | Yes (`featured_image`, `detail_images`) | Public marketing landing page (Rawalpindi city page), no personal data | **Safe, kept** |
| `homepage.png` | Yes (`preview_image`, `detail_images`) | Public homepage hero + offer card, no personal data | **Safe, kept** |
| `Registration_page.png` | Yes (`detail_images`) | Public registration **form**, all fields show placeholder text ("Muhammad Ahmad," "0300-1234567," "35202-1234567-1" as `placeholder=` attribute text, not submitted data) | **Safe, kept** |
| `Rawalpindi_Registration.png` | Yes (`detail_images`) | Public city landing page, only business contact numbers (0323-1213999, 0324-4110141) and a business email — these are the site's own published support contacts, intentionally public | **Safe, kept** |
| `Services_page.png` | Yes (`detail_images`) | Public services page, no personal data | **Safe, kept** |
| `custom_dashbaord_image1.png` | Yes (`detail_images`) | Admin "Analytics Overview" — **aggregate counts only** (Total Registrations: 5, Today: 2, etc.), no individual records | **Safe, kept** |
| `custom_dashbaord_image2.png` | **Removed from `detail_images` by this phase** | Admin "Registration Management" table showing **individual rows with names ("Khan," "asad," "Shahriyar Khan1," "Shahriyar Khan333333333") and a phone number pattern (03295448590 / 03295448434) repeated across rows** | **Excluded — see below** |

**Decision on `custom_dashbaord_image2.png`:** while two of the five visible names look like the owner's own test entries ("Shahriyar Khan1," "Shahriyar Khan333333333" — clearly self-registered test data), the other three rows ("Khan" ×2, "asad") share the same phone number pattern and have no obvious "test data" marker. No permission to publish real or plausibly-real registrant names and phone numbers was found anywhere in the repository. Per the task's explicit instruction ("if permission cannot be established, keep the project entry but exclude public screenshots and record an owner decision"):

- The reference to this file was **removed from `detail_images`** in `projects.$slug.tsx` (see the inline comment there), so it is no longer rendered on the public project page.
- The file itself **was not deleted** — it remains at `frontend/public/images/yangowing_images/custom_dashbaord_image2.png` for the owner to review.
- A regression test (`contentVisibility.test.ts`) asserts this filename never appears in the Yango fallback's image list again.
- **Owner decision needed:** confirm whether the registration rows shown are all synthetic/self-test data (in which case the image could be safely restored) or include real early customers (in which case it should either stay excluded or be replaced with a redacted/blurred version).

**Unreferenced files found, not part of any current display:** `homepage1.png`, `homepage2.png`, `homepage3.png` exist in the same directory but are not referenced by any route. Not reviewed further since they render nowhere; flagged here for awareness only.

**Alt text and responsive behavior:** unchanged — `buildGallery()` in `projects.$slug.tsx` already generates `alt={project.title} screenshot ${i+1}` for every gallery image uniformly across all projects (not Yango-specific), and the gallery's CSS/layout (`pd-gallery__img`, `object-fit`-based sizing) was not touched by this phase.

## 3. Pre-existing project claims (flagged, not rewritten)

Verified via `git show 2d654dd:frontend/src/routes/projects.$slug.tsx` that the following claims **predate P00's original audit entirely** — they are not new or changed by the divergent `origin/main` commits this phase reconciles, and rewriting them would mean rewriting unrelated, long-standing portfolio copy well beyond this reconciliation's scope ("do not rewrite the entire portfolio in this phase"). They are flagged here, exactly as the task requires, for an explicit owner decision — the same pattern already used for CognoRise/InsightBoard (flag and defer, don't unilaterally rewrite):

| Project | Claim | Concern |
|---|---|---|
| SK-LearnTrack | "AI assistance reduces time-to-answer by **over 60%** compared to traditional search." | Specific percentage with no supporting measurement anywhere in the repo |
| NoteAssist AI | "Full RBAC ensures **enterprise-grade** data isolation." | Unverifiable quality descriptor |
| NoteAssist AI | "A **production-grade** productivity tool... **Live and accessible** for real users." | "Production-grade" unverifiable; "live and accessible" was spot-checked in P00 (2026-08-27) as reachable then — not re-verified this phase, so left as-is rather than asserted or retracted without a fresh check |
| FeelWise | "Microservices-based AI system," "**real-time** insights," "compelling **real-time** visualization" | "Real-time" is asserted three times across `description`/`overview`/`solution`/`feature_bullets` with no measurement of actual latency; "microservices" is an architecture claim not independently verifiable from this repo alone |
| Home page bio (`index.tsx`) | "I design **scalable** API-driven architectures... build **production-ready** backend systems... Experienced in **microservices architecture**... deploying **cloud-native** solutions..." | General self-description using the same buzzword family the task calls out; this is personal bio copy, not a specific project metric, and predates P00 |

**Recommendation:** resolve in a dedicated content-copy pass with the owner, using the real project repos as evidence, rather than as a side effect of this reconciliation.

## 4. Gallery completion (cross-reference)

Full detail in `P01A4_CHANGE_BOUNDARY.md` §2. Summary: `origin/main` has zero backend `ProjectImage` support (no model/migration/serializer/admin/API). The two gallery-related components (`ProjectImageGallery.tsx`, `AdminProjectForm.tsx`) are both unreachable from any route today. This phase fixed `ProjectImageGallery.tsx`'s hook-order and timer-type bugs (since the task explicitly required it, and it's reasonable to keep dead code correct for whenever it is wired in) but did not build out the missing backend or wire either component into the app — that remains explicitly deferred, documented work for a later phase, not resolved here.

## 5. Summary of code changes from this audit

- `frontend/src/routes/projects.tsx`, `frontend/src/routes/projects.$slug.tsx`: Yango description/summary/outcome text reworded per §1.
- `frontend/src/routes/projects.$slug.tsx`: `custom_dashbaord_image2.png` removed from `detail_images` per §2.
- `frontend/src/routes/contentVisibility.test.ts`: added a regression test asserting the excluded image never resurfaces.
- No changes were made to NoteAssist/SK-LearnTrack/FeelWise/home-page bio content (§3) or to any technology/employment/business claim beyond what's listed above.
