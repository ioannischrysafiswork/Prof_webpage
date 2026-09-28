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
- Dates: ISO `YYYY-MM`; ongoing → `present`.
- File names: kebab-case, prefixed with start year for dated entries
  (e.g. `2023-acme-software-engineer.md`).
- Bullets start with a strong verb, describe impact, max ~25 words, max 4 per entry.
  Use numbers only if they are real.
- No duplicated data: Home highlights reference entries via `featured: true`, never copy text.

## Steps

1. Read `src/content.config.ts` to confirm the current schema (it wins over the templates
   if they differ).
2. Check for an existing entry for the same item (Grep by organisation/title) — update it
   instead of creating a duplicate.
3. Create/update the file using the matching template in [templates.md](templates.md).
4. If a PDF or image is referenced, place it in `public/documents/` or `src/assets/` with a
   kebab-case name and link it.
5. Run `npx astro check` and fix schema errors.
6. Report: file path, fields filled, and remaining `TODO(ioannis)` items for this entry.
