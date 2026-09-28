---
name: site-preflight
description: Run the full pre-commit / pre-deploy verification for the website — build, type and schema check, lint, and a structural check of the built pages (stable routes /, /work, /academic, required anchors, SEO tags, hard-coded links, open TODOs). Use before declaring any task done, before committing, and before deploying.
allowed-tools: Bash(npm run *) Bash(npx astro check*) Bash(node *) Read Grep Glob
---

# Site preflight

Run every step; stop and report at the first **failing** step, with the exact error and
the file responsible.

1. **Build** — `npm run build`
2. **Types & content schemas** — `npx astro check`
3. **Lint & format** — `npm run lint` (skip with a note if the script does not exist yet)
4. **Structural check of `dist/`** —
   `node "${CLAUDE_SKILL_DIR}/scripts/check-dist.mjs"`
   It verifies:
   - `dist/index.html`, `dist/work/index.html`, `dist/academic/index.html`, `dist/404.html` exist
   - each page has `<title>`, meta description, canonical link, `og:image`, `lang="en"`,
     exactly one `<h1>`, and nav links to all three areas
   - required anchor ids exist (`/work`: about, experience, certifications, projects, skills;
     `/academic`: about, roadmap, bachelor-degree, master-degree, qualifications,
     bachelor-thesis, master-thesis, projects)
   - no `TODO(ioannis)` leaks into production HTML (reported as **warning** while the
     site is still in draft, **error** with `--strict`)
   - `<img>` elements all have `alt`
   Use `--strict` before the first public deploy. If the site is deployed as a project
   site, pass the base path, e.g. `--base /Prof_webpage/` (must match `base` in
   `astro.config.mjs`).
5. **Source hygiene** (Grep in `src/`):
   - internal links not using the `url()` helper: `href="/` or `href='/` in `.astro` files
   - raw hex colours in components (`#[0-9a-fA-F]{3,6}` outside `src/styles/`)
   - hard-coded CV data in components (organisation names, degree names found in content)

## Report

A table of steps with ✅ / ⚠️ / ❌, followed by the list of errors and warnings with file
paths, and the count of open `TODO(ioannis)` items (from `src/content/`). If everything
passes, say so in one line.
