---
name: export-cv-pdf
description: Generate downloadable PDF CVs from the live pages (/work → professional CV, /academic → academic CV) using the site's print stylesheet and Playwright, saved to public/documents/. Use after content changes on /work or /academic, or when Ioannis asks for an up-to-date PDF CV.
argument-hint: "[work | academic | both]"
disable-model-invocation: true
---

# Export the CV PDFs

Target: `$ARGUMENTS` (default: `both`).

The PDFs are printed from the real pages, so the website stays the single source of truth.

## Steps

1. Ensure Playwright is available as a dev dependency:
   `npm ls playwright || npm i -D playwright && npx playwright install chromium`
2. Build and serve the site: `npm run build`, then start `npm run preview` **in the
   background** and wait until `http://localhost:4321/` responds.
   (If `base` is not `/`, use the full base URL, e.g. `http://localhost:4321/Prof_webpage/`.)
3. Run:
   `node "${CLAUDE_SKILL_DIR}/scripts/export-pdf.mjs" --url http://localhost:4321/ --pages $ARGUMENTS`
   It emulates print media, expands all `<details>`, waits for fonts, and writes
   - `public/documents/ioannis-chrysafis-cv-work.pdf`
   - `public/documents/ioannis-chrysafis-cv-academic.pdf`
4. Stop the preview server.
5. Open each PDF with the Read tool and check: 1–2 pages each (the script warns if more),
   no navigation/animations, readable typography, links shown, no `TODO(ioannis)`,
   no cut-off timeline items. If layout is off, fix `@media print` rules in
   `src/styles/global.css` (design-system agent) and re-run.
6. Make sure the "Download CV (PDF)" buttons on `/work` and `/academic` point to these files.
