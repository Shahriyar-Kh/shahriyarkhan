# P01A.5H — Emergency Public-Asset Privacy Hotfix Report

**Date:** 2026-08-30
**Branch:** `fix/p01a-live-yango-image-privacy`, based directly on `origin/main`
**PR:** [#3](https://github.com/Shahriyar-Kh/shahriyarkhan/pull/3)

---

## 1. Overall result

Complete. The sensitive asset was deleted from the deployable public asset tree (not just unreferenced), every application reference was removed, a dependency-free regression script was added and passes both locally and in a real GitHub Actions run, every other Yango screenshot was audited (none else are sensitive), and the git-history exposure was correctly classified as requiring an owner decision rather than being resolved unilaterally. PR #2 was not touched, merged, or modified.

## 2. Current `main` SHA

`94341e22767ce95033a9eb28e97b1f9959b2d0b2` — confirmed unchanged throughout this phase via repeated re-fetch before every push.

## 3. Hotfix branch/head SHA

`fix/p01a-live-yango-image-privacy` @ `5893dcf5e112cea7b37cd11e0568867b748cfe23` (3 commits: the asset removal, the minimal CI workflow, and a CI-robustness fix found and applied during this same phase — see §11).

## 4. Exact sensitive asset state before fix

- `frontend/public/images/yangowing_images/custom_dashbaord_image2.png` present in `origin/main`'s tree.
- Two active code references in `origin/main`: `projects.$slug.tsx`'s `detail_images` array, and a CSS `background-image: url(...)` in `styles.css`.
- **Live production confirmation:** `GET https://shahriyarkhan.vercel.app/images/yangowing_images/custom_dashbaord_image2.png` returned **HTTP 200** at the start of this phase, with response headers showing `Cache-Control: public, max-age=0, must-revalidate` and `X-Vercel-Cache: HIT`.

## 5. All references found

```
frontend/src/routes/projects.$slug.tsx:64:      "/images/yangowing_images/custom_dashbaord_image2.png"
frontend/src/styles.css:4878:  background-image: ..., url('/images/yangowing_images/custom_dashbaord_image2.png');
```

No SEO/schema/social-metadata, sitemap, or backend/media reference existed (`origin/main` has no frontend-static sitemap/robots at all — those are P01A additions, not yet on `main`).

## 6. Asset removal result

- `git rm` the physical PNG — it is now absent from the working tree and, after a production build, absent from `dist/` (verified: `grep -rl` over `dist/` finds nothing, and the built file path does not exist).
- `detail_images` array entry removed; the gallery now shows its remaining 6 images (not padded with a fabricated replacement).
- CSS rule's `url(...)` layer removed; the decorative element keeps its existing gradient background instead of a substitute image.

## 7. Other Yango screenshot privacy audit

Full detail in `docs/rebuild/P01A5H_YANGO_MEDIA_PRIVACY_AUDIT.md`. Summary: every other file in `yangowing_images/` (8 remaining, including 3 previously-unreviewed, unreferenced files) was visually inspected — none show personal or operational data. `custom_dashbaord_image2.png` was the only offender.

## 8. Git-history exposure assessment

**`PUBLIC GIT HISTORY EXPOSURE — OWNER DECISION REQUIRED.`**

The file has existed in this **public** repository's history since commit `8add866` ("add Yango wing project") and remains retrievable from that commit (and every commit since) regardless of this hotfix. **Deleting the working-tree file stops future deployments from serving it but does not erase it from git history** — anyone who clones the repository or browses its commit history on GitHub can still retrieve the exact file. Whether the displayed registrant data (names, a phone number) is synthetic test data or real was not established with certainty in this or the prior P01A.4/P01A.5 audits — some entries look like the owner's own test records, others do not carry an obvious marker either way. **No force-push, history rewrite, `git filter-repo`/`filter-branch` pass, or repository recreation was performed in this phase** — that is a separate, explicitly-authorized decision the owner must make, informed by whichever way the authenticity question resolves.

## 9. Files changed

- `frontend/public/images/yangowing_images/custom_dashbaord_image2.png` — deleted.
- `frontend/src/routes/projects.$slug.tsx` — 1 array entry removed, replaced with an explanatory comment.
- `frontend/src/styles.css` — 1 `url(...)` layer removed from one rule.
- `frontend/scripts/verify-privacy-hotfix.mjs` — new, dependency-free regression script.
- `.github/workflows/hotfix-verify.yml` — new, minimal CI workflow scoped to this hotfix only.
- `docs/rebuild/P01A5H_PRIVACY_HOTFIX_BASELINE.md`, `P01A5H_YANGO_MEDIA_PRIVACY_AUDIT.md`, this report — new documentation.

**Zero backend files changed. Zero P01A stabilization content imported. PR #2 untouched.**

## 10. Tests changed/added

One new file, `frontend/scripts/verify-privacy-hotfix.mjs` (a plain Node script, not a test-framework suite — `origin/main` has no test framework at all, and installing one would mean importing PR #2's broader test tooling into what must stay the smallest possible fix). It proves, in order: (1) no active source reference to the filename outside a comment; (2) the physical asset is absent from `public/`; (3) `dist/`, once built, contains neither the asset nor a reference to it; (4) Yango's gallery still has a non-empty, non-fabricated image list; (5) every remaining Yango image path resolves to a real file on disk; (6) `index.tsx` and every backend file are byte-for-byte unchanged from `origin/main` (i.e., this hotfix touches nothing related to CognoRise/InsightBoard visibility, which this branch's baseline does not even implement, since that's P01A work not yet on `main`).

## 11. Exact frontend results

| Check | Result |
|---|---|
| `npm ci` | Reproducible install, pass (13 pre-existing, unrelated audit warnings from transitive deps — same as every other phase) |
| `npm run lint` | **2 pre-existing errors** (`ProjectImageGallery.tsx` hook-order violation) — confirmed via `git stash` to be identical on unmodified `origin/main`; not introduced by this hotfix, not fixed here (that's PR #2's job; fixing it here would import broader stabilization work) |
| `npx tsc --noEmit` | **2 pre-existing errors** (`skills.tsx`) — same confirmation method, same reasoning |
| `node scripts/verify-privacy-hotfix.mjs` | **All 6 checks pass**, both locally (before and after build) and in CI |
| `git diff --check` | Pass |
| Secret-pattern scan | Clean |
| Backend files changed | Zero (`git diff --name-only -- backend/` is empty) |

## 12. Production build result

Pass — 1743 modules transformed (vs. 1746 on PR #2's branch, consistent with this branch lacking PR #2's additional test/lib files), `dist/index.html`/CSS/JS all generated normally.

## 13. `dist/` asset absence proof

```
$ find dist -iname "*image2*"
(no output)
$ grep -rl "custom_dashbaord_image2" dist/
(no output)
```

Confirmed by the regression script's own automated check, re-run after every build in this phase.

## 14. Secret/privacy scan result

Secret-pattern scan (AWS keys, private-key headers, common token prefixes, inline `SECRET_KEY`/`PASSWORD` literals) across every changed file: clean. No secret value was read, printed, or exposed at any point. The privacy audit (§7) is documented above; no other exposure found beyond the one asset this hotfix removes.

## 15. GitHub CI run ID/URL/final tested SHA

- Run `33294392733` (push): https://github.com/Shahriyar-Kh/shahriyarkhan/actions/runs/33294392733 — **success**
- Run `33294394113` (pull_request, PR #3): https://github.com/Shahriyar-Kh/shahriyarkhan/actions/runs/33294394113 — **success**
- Both against the exact final head `5893dcf5e112cea7b37cd11e0568867b748cfe23`. Log-verified real execution (1743 modules transformed, all 6 script checks printed and passed), not assumed from green checkmarks alone.

An earlier run against an intermediate commit (`3fd8146`) failed due to a CI-environment-specific bug in the verification script itself (assumed a full git clone; GitHub's shallow checkout didn't have `origin/main` resolvable) — found and fixed within this same phase (commit `5893dcf`), not silently worked around.

## 16. Hotfix PR URL

https://github.com/Shahriyar-Kh/shahriyarkhan/pull/3

## 17. PR mergeability

`OPEN`, not draft, `mergeable: MERGEABLE`. `mergeStateStatus: UNSTABLE`, caused solely by the pre-existing, unrelated Cloudflare "Workers Builds" check (fails identically on `main`'s own current HEAD) — `main` has no branch protection rules, so this does not block a merge at the GitHub level.

## 18. Expected Vercel auto-deployment behavior

**Merging this PR will very likely auto-deploy Vercel Production**, per the direct deployment-history evidence already established in P01A.5 (`P01A5_DEPLOYMENT_TRIGGER_MAP.md`) — every historical push to `main` has produced a Production deployment with no manual gate. This hotfix does not change that behavior; it is a narrow content fix, not a configuration change.

**Cache invalidation:** the live asset's actual response headers (checked read-only during this phase) show `Cache-Control: public, max-age=0, must-revalidate` and `X-Vercel-Cache: HIT`. `must-revalidate` means no downstream cache should serve a stale copy without checking back — combined with Vercel's documented behavior of routing the production alias to the newest deployment immediately upon promotion, **no manual cache-purge action should be required** beyond the deploy itself. A brief edge-propagation window (typically seconds, across Vercel's global points of presence) is normal for any CDN and is not something this audit can fully rule out without live testing post-deploy — the post-merge checklist below explicitly re-checks the URL for exactly this reason.

## 19. Post-merge verification checklist (not executed — for after owner authorization)

1. Merge only PR #3 (this hotfix) — not PR #2.
2. Wait for the Vercel Production deployment to complete (watch the Deployments API or dashboard for a new `Production`-environment entry for this merge commit).
3. Verify normal portfolio pages still load (`/`, `/projects`, `/projects/yango-wing-fleet-digital-registration-platform`).
4. Request the old direct screenshot URL again: `GET https://shahriyarkhan.vercel.app/images/yangowing_images/custom_dashbaord_image2.png`.
5. **Expected result: no longer returns the sensitive asset** (a 404, or Vercel's own not-found handling — not the image).
6. Inspect the Yango gallery on the live `/projects/yango-wing-fleet-digital-registration-platform` page — confirm it renders normally with its remaining images and no broken image icon.
7. Inspect the Vercel build/deploy logs for this merge for any unexpected error.
8. Confirm the deployed commit SHA shown in the Vercel dashboard matches this PR's merge commit.
9. **Do not touch Render or any backend configuration** — this hotfix has no backend component.

## 20. Whether history cleanup needs a separate owner decision

**Yes — explicitly, per §8.** This report does not resolve it and performed no history-rewriting action. The owner should decide whether to pursue a history-scrubbing pass (a materially more disruptive, separately-authorized operation that would invalidate every existing clone/fork/PR reference to this repository) once the underlying authenticity question is resolved.

## 21. `git status --short`

Clean at the time of writing (see the final response for the live command output).

## 22. Ready to merge hotfix: **YES**

CI green (log-verified, not just green checkmarks) on the exact final head, no merge conflict, zero backend changes, zero P01A content imported, exact minimal diff (one file deleted, two files with a one-line-equivalent change each, plus new verification tooling and documentation).

## 23. Ready to deploy hotfix: **YES, pending owner merge authorization**

This report recommends merging PR #3 as soon as the owner authorizes it — independent of and not blocked by PR #2's own unresolved production-database issue (`P01A5_PRE_MERGE_READINESS_REPORT.md`), since this hotfix does not touch the backend at all and the exposure is actively live right now.

## 24. Explicit confirmation: PR #2 was not merged or modified

Confirmed. PR #2 (`fix/p01a-stabilization-integrated`) was not merged, closed, edited, rebased, or otherwise touched at any point in this phase. Its head remains exactly where the P01A.5 phase left it. This hotfix branch and PR are entirely separate, built directly from `origin/main`.
