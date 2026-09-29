# source-material/

Raw inputs for the website. Drop your files here; the `content-curator` agent (and the
`ingest-source-material` skill) reads them and turns verified facts into the content files
in `src/content/`. Nothing on the site is invented: if something is not here, in your
public GitHub, or in your direct answers, it appears as a `TODO(ioannis): …` placeholder.

**Privacy:** everything in this folder except this README is git-ignored, so it is never
committed or published. Files meant for download on the site (CV PDF, thesis PDFs) are
copied separately to `public/documents/` once you approve them.

## What to put here

| File(s) | Used for |
| --- | --- |
| **CV / résumé** (PDF or DOCX, the most recent one; older versions help too) | Work timeline, education, skills, certifications |
| **LinkedIn export** (optional: LinkedIn → Settings → Data privacy → Get a copy of your data) | Cross-checking roles and dates |
| **Bachelor's thesis** (PDF) | Title, supervisor, abstract, methods, key figure, download link |
| **Master's thesis** (PDF) | Same as above |
| **Degree certificates / transcripts** (PDF or scans) | Institution, programme, dates, grade (only shown if you want) |
| **Certificates** (PDF or screenshots, with credential IDs / verification links) | Certifications section |
| **Photo** (JPG/PNG, at least 800×800, ideally a neutral background) | Optional portrait on Home |
| **Academic work** (reports, notebooks, figures, simulation outputs, code links) | Projects & simulations cards on `/academic` |
| **Notes** (`notes.md` or any text file) | Hobbies and interests, how you like to work, what you want emphasised or left out, which contact details may be public |

## Suggested layout

```
source-material/
├── cv/
├── theses/
├── certificates/
├── academic-work/
├── photos/
└── notes.md
```

Any structure works; file names just need to make clear what each file is.
