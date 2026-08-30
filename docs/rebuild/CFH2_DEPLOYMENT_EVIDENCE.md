# CF-H2 — Deployment Evidence

**Date:** 2026-08-30

---

## Merge (Step 3)

- **Method:** Merge commit (`gh pr merge 5 --merge`), gated with `--match-head-commit 276b451366a01dab9a741a780d85b04dc3d007f1` so the merge could only succeed against the exact tested head.
- **Merge commit SHA:** `ec0a8e14c1ea00f426dae323c0262bfafdc95ca2`
- **New `main` SHA:** `ec0a8e14c1ea00f426dae323c0262bfafdc95ca2`
- **Merge timestamp:** `2026-08-30T14:43:22Z`
- **PR #5 final state:** `MERGED`

## Deployment observation (Step 4)

### GitHub Actions

Post-merge CI run on `main` at the merge commit: **`success`** (run `33317643317`, exact head `ec0a8e14c1ea00f426dae323c0262bfafdc95ca2`).

### Render

No direct provider deployment metadata is available in this environment (no `RENDER_API_KEY`, no dashboard access; confirmed absent before relying on this). Per the task's own instruction, an **application-level differentiator from the CF-H1 behavior** was used instead: CF-H1 established that the pre-fix code unconditionally returns HTTP 500 on `ContactMessage`/`ServiceRequest` creation whenever the notification email fails to send. The post-merge production test in `CFH2_PRODUCTION_VERIFICATION.md` (Steps 5–6) returned HTTP 201 for both endpoints — behavior only possible if the merged code (not the pre-fix code) is what Render is now serving. This is treated as conclusive deployment confirmation for the backend.

A ~6-minute wait (with periodic `/healthz` polling) was inserted between the merge and the production test to allow Render's auto-deploy build/swap to complete before the one-shot verification request was sent.

### Vercel

An automatic frontend deployment was triggered by the merge despite no frontend file changes in this PR (Vercel deploys on every push to the connected branch regardless of changed paths). Commit status API confirmed: `state: success`, description `"Deployment has completed"`, for commit `ec0a8e14c1ea00f426dae323c0262bfafdc95ca2`. No provider configuration was modified.
