---
name: add-content-entry
description: Add or update one entry in the site's content collections (experience, education, thesis, certification, project, academic-work, skill, interest) using the correct file location, schema and conventions. Use whenever a job, degree, thesis, certificate, GitHub project, simulation, skill or hobby must be added or edited.
argument-hint: "[type] [short description]"
arguments: [type]
---

# Add a content entry

Entry type requested: **$type** — full request: `$ARGUMENTS`

Valid types: `experience`, `education`, `thesis`, `certification`, `project`,
`academic-work`, `skill`, `interest`. If the type is missing or unclear, ask.

## Rules (from CLAUDE.md §6)

- Facts only from `source-material/_inventory.md`, source files, Ioannis's GitHub, or his
  direct answers. Missing value → `TODO(ioannis): <precise question>`.
- Dates: quoted ISO `'YYYY-MM'` (or `'YYYY'` if only the year is known); ongoing →
  `end: 'present'`. Theses use `start` (optional) / `end` (submission date), not `year`.
- Placeholders must read `TODO(ioannis): <question>` — text after the colon is required.
- Uniform field names across collections: `tech` for every tools/stack list; a single
  `links` object (`repo`, `demo`, `pdf`, `credential`, `code`, `report`, `website`);
  `images: [{ src, alt, caption }]` with `images[0]` as cover / key figure.
- Items in `certifications.yaml`, `skills.yaml` and `interests.yaml` need a unique
  kebab-case `id`.
- File names: kebab-case, prefixed with start year for dated entries
  (e.g. `2023-acme-software-engineer.md`); theses are always `bachelor.mdx` / `master.mdx`.
- Bullets start with a strong verb, describe impact, max ~25 words, max 4 per entry.
  Use numbers only if they are real.
- No duplicated data: Home highlights reference entries via `featured: true`, never copy text.

## Steps

1. Read `src/content.config.ts` to confirm the current schema (it wins over the templates
   if they differ).
2. Check for an existing entry for the same item (Grep by organisation/title) — update it
   instead of creating a duplicate.
3. Create/update the file using the matching template in [templates.md](templates.md).
4. If a PDF or image is referenced, use a kebab-case name and:
   - PDFs → `public/documents/<name>.pdf`, linked as `links.pdf: '/documents/<name>.pdf'`
     (or `links.report` for academic reports);
   - images → `src/assets/<collection>/<name>.<ext>`, referenced in `images[].src` by a
     path relative to the content file (e.g. `../../assets/projects/<name>.png`) with
     meaningful `alt` text.
5. Run `npx astro check` and fix schema errors.
6. Report: file path, fields filled, and remaining `TODO(ioannis)` items for this entry.
