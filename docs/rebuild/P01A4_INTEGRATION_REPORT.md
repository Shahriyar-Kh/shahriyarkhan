# P01A.4 — Integration Report

**Date:** 2026-08-30
**Branch:** `fix/p01a-stabilization-integrated`, created from `origin/main` @ `94341e22767ce95033a9eb28e97b1f9959b2d0b2`
**Supersedes:** `fix/p01a-stabilization-clean` (PR #1) for merge purposes — PR #1 was left open and untouched, per instruction; the owner decides whether to close it.

---

## 1. Why PR #1 could not merge cleanly

`fix/p01a-stabilization-clean` was created from `main` @ `2d654dd85e60ca5bda9fb39bd8a097ccbe4809ce`. Before PR #1 could be reviewed, `origin/main` advanced 4 more commits — `1438ac7` ("final optimized animated frontend version 2"), `8add866`/`c3d8391`/`94341e2` ("add Yango wing project") — pushed from outside this session. These touched 5 files PR #1 also touched (`seo.ts`, `index.tsx`, `projects.$slug.tsx`, `projects.tsx`, `skills.tsx`) plus added a whole new project (Yango Wing Fleet), a new Tailwind entry point (`styles.css`), and a tracked `frontend/.env`. GitHub correctly reported PR #1 as `CONFLICTING`/`DIRTY`. Full detail in `P01A4_RECONCILIATION_BASELINE.md`.

## 2. Base and head SHAs

| | SHA |
|---|---|
| Merge base | `2d654dd85e60ca5bda9fb39bd8a097ccbe4809ce` |
| `origin/main` (this branch's actual base) | `94341e22767ce95033a9eb28e97b1f9959b2d0b2` |
| `fix/p01a-stabilization-clean` (PR #1 head, unchanged) | `086c6731cbe3a3ff12abbe3fe9e6a217cbb60db2` |
| `fix/p01a-stabilization-integrated` (this branch, after 4 commits) | see `git log --oneline -6` in the final response |

## 3. What was preserved from latest `main`

- The Yango Wing Fleet project (list entry, detail page, 7 screenshots minus one excluded — §6), with conservative wording applied to its unverifiable claims.
- `frontend/src/styles.css` and `frontend/src/styles-premium-enhancements.css` — the real, committed, wired-in (`main.tsx` imports `styles.css`, which `@import`s the premium file) visual design. Unlike in P01A.1–3 (where this CSS was uncommitted, optional, out-of-scope experimental work), it is now load-bearing for the live site's actual appearance and was not touched.
- The "backend empty" banner removal in `about.tsx`/`resume.tsx`/`skills.tsx` (cosmetic, unrelated to any P01A concern).
- The committed schema-markup/Twitter-card/robots-meta SEO feature in `seo.ts`, `index.tsx`, and `projects.$slug.tsx` — kept in full, only its `window.location.href`/`.origin` call sites were redirected to the centralized `site.ts`.

## 4. What was ported from P01A

All 5 stabilization commits (`79eaab5`, `14a9596`, `f2f902d`, `314b83f`, `086c673`) — full backend fixes, canonical-domain centralization, experience-endpoint fix, CognoRise/InsightBoard hiding, the `skills.tsx` TypeScript fix, the 31+18 test suites, and the CI workflow. See `P01A4_CHANGE_BOUNDARY.md` for the exact per-file classification and `P01A4_RECONCILIATION_BASELINE.md`/commit `d92cd5b`'s message for what was zero-conflict vs. manually combined.

## 5. Conflict-resolution summary by file

| File | Resolution |
|---|---|
| `seo.ts` | Kept main's schema-markup feature; replaced 2× `window.location.href` with `canonicalUrl(window.location.pathname)` |
| `index.tsx` | Reapplied all P01A hunks (endpoint fix, exports, CognoRise split, stat fix) on top of main's version; fixed the Person schema's `url` to `SITE_URL` |
| `projects.$slug.tsx` | Reapplied `canonicalUrl()`/`export` fixes on both the `applySeo` call and the `CreativeWork` schema `url`; reworded Yango's unverifiable claims; removed one privacy-sensitive screenshot reference |
| `projects.tsx` | Reapplied `export`; reworded Yango's list-entry description |
| `skills.tsx` | Reapplied the `GroupedSkill`/`GroupedCategory` type fix on top of main's unrelated banner removal |
| `ProjectImageGallery.tsx` | Fixed hook-order violation and `NodeJS.Timeout` typing (unreachable dead code, fixed per explicit instruction) |
| `frontend/.env` | Untracked, gitignored, replaced with `.env.example` |
| `frontend/public/sitemap.xml` | Added the verified-live Yango route |
| All other overlapping files | Zero-conflict ports (see §4) |

## 6. Gallery backend/frontend completeness result

**Backend: incomplete, confirmed by direct inspection** — `origin/main` has no `ProjectImage` model, migration, serializer, admin, or API view (`grep -rn "ProjectImage" backend/apps/portfolio/` returns nothing; only `0001_initial.py` exists in migrations). The old uncommitted gallery backend (from the original dirty workspace) was **not** imported, per instruction.

**Frontend: already safe** — the live gallery on `/projects/:slug` (`ProjectGallery`, inline in `projects.$slug.tsx`) already degrades gracefully when the API's `images` field is absent (which it always is today) by falling back to `detail_images`/`featured_image`/`preview_image`. No public page regression exists or was introduced.

**Orphaned code, not reachable from any route** (confirmed via `grep -rl` for both, excluding self-references): `ProjectImageGallery.tsx` (hook-order + timer-type bugs fixed in place) and `AdminProjectForm.tsx` (its gallery-upload path targets a nonexistent backend endpoint; left unmodified since there is no live route rendering it — building a real admin upload flow is out of this phase's scope and is documented as deferred work).

## 7. `.env` correction result

`frontend/.env` (tracked, `VITE_API_BASE_URL=http://localhost:8000`) untracked and gitignored; `frontend/.env.example` added with the same value as a documented placeholder. Verified: `api.ts`'s existing fallback resolves to a same-origin-relative path with no `.env` present (new test, `api.test.ts`); the separate, pre-existing, non-secret `frontend/.env.production` (`VITE_API_BASE_URL=https://shahriyarkhan.onrender.com`) is unaffected and was confirmed still correctly baked into a fresh production build (`grep shahriyarkhan.onrender.com dist/assets/*.js` succeeds).

## 8. Yango/content/media audit result

Summary (full detail in `P01A4_CONTENT_AND_MEDIA_AUDIT.md`):
- Yango's description/summary/outcome text: 5 unverifiable claims ("production-grade" ×2, "real-time analytics", "enterprise-style architecture", "live"/"real-world"/"conversion-focused"/"high-utility") reworded to conservative, repo-grounded language.
- Yango's `live_url` and `github_url` verified reachable (HTTP 200 both) — no "live and accessible" language needed removal.
- `custom_dashbaord_image2.png` (shows apparent real driver names + a phone number) removed from the public gallery reference; file not deleted; regression test added; owner decision recorded as needed.
- Pre-existing NoteAssist/SK-LearnTrack/FeelWise claims (including the literal "over 60%" figure) and the home-page bio's buzzword-heavy paragraph: confirmed to predate P00 entirely; flagged in the audit doc, not rewritten, consistent with this phase's "do not rewrite the entire portfolio" scope limit.

## 9. SEO/canonical reconciliation result

Canonical origin is `https://shahriyarkhan.vercel.app` everywhere (index.html, seo.ts, index.tsx's Person schema, projects.$slug.tsx's CreativeWork schema, sitemap.xml, robots.txt) — zero remaining `window.location.origin`/`.href` canonical sources, zero `shahriyarkhan.dev` references outside documentation and negative-assertion tests. CognoRise and InsightBoard confirmed absent from all public HTML, JSON-LD, and the sitemap (automated tests + build-output grep). No duplicate/conflicting JSON-LD blocks were introduced — exactly one `Person` script (home page) and one `CreativeWork` script (project detail page), matching main's pre-existing structure.

## 10. Files changed

22 files in commit `d92cd5b` (reconcile), 5 in `4010ce2` (env hardening), 12 in `b859009` (tests), plus this phase's `docs/rebuild/P01A4_*.md` files in the forthcoming docs commit. Full list: `git show --stat` on each commit hash.

## 11. Tests added or changed

- New: `frontend/src/lib/api.test.ts` (7 tests), `frontend/src/components/ProjectImageGallery.test.tsx` (3 tests), `frontend/src/sitemapRobots.test.ts` (5 tests).
- Changed: `frontend/src/routes/contentVisibility.test.ts` (+1 test, Yango screenshot exclusion).
- Carried over unchanged: all 31 backend tests, and 17 of the original 18 frontend tests (the 18th, in `contentVisibility.test.ts`, gained the one new case above).
- **Total: 31 backend + 34 frontend = 65 tests, all passing.**

## 12. Exact backend results

| Command | Result |
|---|---|
| `manage.py check` | Pass — 0 issues |
| `manage.py makemigrations --check --dry-run` | Pass — "No changes detected" |
| `manage.py test apps.portfolio apps.site_config apps.resume_builder apps.core` | **31/31 pass** |

## 13. Exact frontend results

| Command | Result |
|---|---|
| `npm ci` | Pass, reproducible |
| `npx vitest run` | **34/34 pass**, 8 test files |
| `npm run lint` | **0 errors**, 13 pre-existing warnings (unchanged) |
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | Pass — 1746 modules; canonical/sitemap/robots verified correct in `dist/`; `dist/assets/*.js` correctly contains `shahriyarkhan.onrender.com` (from `.env.production`), zero `shahriyarkhan.dev` |

## 14. Additional repository checks

| Check | Result |
|---|---|
| `git diff --check` | Pass |
| Secret-pattern scan (all changed/new files) | Clean |
| Binary-file scan (all changed/new files) | Clean (no unexpected binaries; the Yango PNGs are inherited from `origin/main`, not new) |
| Tracked `.env` files with real values | Zero (only `.env.example` and the pre-existing, non-secret `.env.production` remain) |
| `shahriyarkhan.dev` references | Zero outside `docs/` and negative-assertion tests |
| Public InsightBoard/CognoRise references | Zero (automated tests + build-output grep) |
| Route regression | None — `routeMatch.test.ts` (5 tests) unchanged and passing |
| Calls to nonexistent gallery endpoints | None reachable (see §6) |
| Unexpected migrations | None (`makemigrations --check --dry-run` confirms) |

## 15. Remaining owner decisions

1. `custom_dashbaord_image2.png` — confirm whether the Registration Management rows are all synthetic test data (safe to restore) or include real customers (should stay excluded or be redacted).
2. Pre-existing unverifiable claims in NoteAssist/SK-LearnTrack/FeelWise and the home-page bio (§8) — a dedicated content-copy pass, not resolved here.
3. Gallery completion — build the missing `ProjectImage` backend and wire `ProjectImageGallery.tsx`/`AdminProjectForm.tsx` into real routes, or formally retire them, in a later phase.
4. The permanent canonical domain, and real-deployment verification of every P01A fix — unchanged from every prior phase's reporting.
5. Whether to close PR #1 in favor of this branch's new PR — left entirely to the owner; PR #1 was not touched.

## 16. Explicit statement: nothing was deployed

No Vercel, Render, or Cloudflare deployment was triggered, promoted, or configured by this phase. Any automatic provider preview (Vercel) triggered by pushing this branch is recorded as evidence only, per the same rule applied in P01A.2/P01A.3.

## 17. Rollback/recovery notes

- This branch (`fix/p01a-stabilization-integrated`) has 4 local commits (plus a 5th, documentation-only commit to follow), not pushed at the time of writing this report, not merged. Safe to delete locally with no effect on `main`, the original dirty workspace, or PR #1.
- PR #1 (`fix/p01a-stabilization-clean`) remains open, draft, and untouched — it is not superseded automatically; the owner decides.
- The original dirty workspace (`d:\Django Projects\shahriyarkhan-portfolio`) was not touched by any command in this phase — confirmed via `git status --short` before and after.
- If this branch needs to be abandoned: `git worktree remove ../shahriyarkhan-p01a-integrated` and delete the local/remote branch — no effect on any other worktree or branch.
