---
name: ship
description: Safely ship a change to the live website — preflight checks, QA review, Conventional Commit on a feature branch, push, and merge to main (which triggers the GitHub Pages deploy), then verify the live URLs. Use only when Ioannis asks to publish, release or deploy.
argument-hint: "[short description of the change]"
disable-model-invocation: true
---

# Ship to production

Change: `$ARGUMENTS`

## Current state
- Branch: !`git branch --show-current`
- Status: !`git status --short`

## Steps

1. **Preflight** — run the `site-preflight` skill. Any ❌ → stop and fix first.
   Before the first public launch use `--strict` (no `TODO(ioannis)` visible).
2. **QA** — delegate to the `qa-auditor` agent for the pages touched. Any **Blocker** → stop.
3. **Branch** — if on `main`, create `feat/<slug>`, `fix/<slug>` or `content/<slug>`.
4. **Commit** — stage only relevant files (never `source-material/` if it is git-ignored,
   never `.env*`, never `dist/`). Conventional Commit message, e.g.
   `content: add master thesis summary and key figure`.
5. **Push** the branch and open a PR to `main` with the `gh` CLI (`gh pr create`), with a
   summary and the preflight table.
6. **Merge** only after Ioannis confirms. Merging to `main` triggers the deploy workflow.
7. **Verify** — delegate to `deploy-engineer` for post-deploy checks of `/`, `/work`,
   `/academic`, 404, sitemap and OG images on the live domain. Report the live URLs.

Never force-push, never push directly to `main` without Ioannis's explicit OK.
