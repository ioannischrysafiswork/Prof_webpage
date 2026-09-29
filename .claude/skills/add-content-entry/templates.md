# Content templates

These match the schemas in `src/content.config.ts` field for field. The schema is the
source of truth: if it changes, update this file (and re-validate, see the end).

**All values below are illustrative placeholders, not facts about Ioannis.** Replace every
value with verified data or `TODO(ioannis): …`, and delete optional lines you do not need.

## Shared conventions (all collections)

| Field | Rule |
|---|---|
| Dates (`start`, `end`, `date`, `expires`) | Quoted ISO string: `'2024-03'` (preferred) or `'2024'`. `end` may also be `'present'`. Always quote dates so YAML keeps them as strings. |
| Placeholders | `'TODO(ioannis): <what is needed>'` — the text after the colon is required; a bare `TODO(ioannis)` fails validation on date, link and enum fields. Allowed in any text, date, enum or link field. |
| `tech` | The **only** name for tools / stack / software lists, in every collection. |
| `links` | One optional object with any subset of `repo`, `demo`, `pdf`, `credential`, `code`, `report`, `slides`, `website`. Values: absolute `https://…` URL, site-relative path to a file in `public/` (e.g. `/documents/master-thesis.pdf`), or a TODO placeholder. No other keys, no top-level `repo:` / `pdf:` / `verifyUrl:` fields. |
| `images` | Optional list of `{ src, alt, caption? }`. `src` is a path **relative to the content file** pointing into `src/assets/` (the file must exist); `alt` is required; `images[0]` is the cover / key figure. |
| `featured` | `true` surfaces the entry in the Home highlights (never copy its text elsewhere). Default `false`. Not available on skills or interests. |
| `order` | Number, ascending tie-breaker / order for undated lists. Default `0`. |
| `anchor` | Lowercase kebab-case, stable forever (deep links such as `/academic#master-thesis`). |
| `id` | Required on every item of the single-file YAML collections (`certifications.yaml`, `skills.yaml`, `interests.yaml`); unique, kebab-case. |

Collection ids for `getCollection()`: `experience`, `education`, `theses`,
`certifications`, `projects`, `academicWork` (folder `academic-work/`), `skills`,
`interests`, `profile`.

## experience — `src/content/experience/<yyyy>-<org>-<role>.md`

```markdown
---
role: 'Software Engineer'
organisation: 'Example Organisation'
location: 'City, Country'                 # optional; city/country only
employmentType: 'Full-time'               # optional: Full-time | Part-time | Contract | Freelance | Internship | Traineeship | Volunteer
start: '2023-01'
end: 'present'                            # or '2024-06'
summary: 'One sentence on the scope of the role.'   # optional
highlights:                               # 2–4 bullets, strong verb first, real numbers only
  - 'Designed … which reduced … by …'
  - 'Led … across … teams …'
tech: ['Python', 'Docker']
links:                                    # optional; any subset of the shared keys
  website: 'https://example.com'
images:                                   # optional; images[0] = cover
  - src: '../../assets/experience/example-organisation.svg'
    alt: 'Describe what the image shows.'
    caption: 'Optional caption.'
featured: true                            # show on Home highlights
order: 0                                  # optional tie-breaker
---

Optional longer description (Markdown), shown in the expandable details.
```

## education — `src/content/education/<yyyy>-<level>-<institution>.md`

```markdown
---
level: 'master'                           # bachelor | master | phd | other
degree: 'MSc in Example Physics'
institution: 'Example University'
location: 'City, Country'                 # optional
start: '2021-10'
end: '2023-07'                            # or 'present'
grade: 'TODO(ioannis): show the grade? If yes, value and scale'   # optional; only if Ioannis wants it shown
summary: 'One sentence on the programme.' # optional
focus: ['Numerical methods', 'Statistical physics']
keyCourses: ['Computational Physics', 'Monte Carlo Methods']
highlights: ['Optional achievement, e.g. a scholarship or distinction.']
tech: ['Python', 'Fortran']
anchor: 'master-degree'                   # optional; bachelor-degree | master-degree on /academic
links:                                    # optional
  website: 'https://example.com/programme'
  pdf: '/documents/example-diploma-supplement.pdf'
images: []                                # optional; same shape as in experience
featured: true
order: 0
---
```

## thesis — `src/content/theses/bachelor.mdx` or `master.mdx`

```mdx
---
level: 'master'                           # bachelor | master | phd | other
title: 'Exact thesis title, copied verbatim'
supervisor: 'Prof. Name Surname'
coSupervisors: ['Dr. Name Surname']       # optional
institution: 'Example University'
department: 'Department of Physics'       # optional
start: '2022-10'                          # optional
end: '2023-07'                            # required: completion / submission date
grade: '10/10'                            # optional; only if Ioannis wants it shown
abstract: '≤120-word faithful summary of the original abstract.'
methods: ['Finite-difference time domain', 'Runge–Kutta 4']
tech: ['Python', 'NumPy', 'Matplotlib']
keyResult: 'One sentence stating the main result, as written in the thesis.'   # optional
highlights: []                            # optional
anchor: 'master-thesis'                   # required: bachelor-thesis | master-thesis
links:
  pdf: '/documents/master-thesis.pdf'     # file placed in public/documents/
  code: 'https://github.com/example/thesis-code'   # optional
images:                                   # optional; images[0] = key figure
  - src: '../../assets/theses/master-key-figure.svg'
    alt: 'Describe what the figure shows.'
    caption: 'What the figure shows and why it matters.'
featured: true
order: 0
---

Optional extended write-up (MDX). Maths is rendered at build time by KaTeX, e.g.

$$ i\hbar \frac{\partial \psi}{\partial t} = \hat H \psi $$
```

Science components (`Equation`, `Figure`, …) from `src/components/science/` may be
imported in the MDX body once `science-visuals` has created them.

## certification — append to `src/content/certifications.yaml`

```yaml
- id: example-cloud-fundamentals          # required, unique, kebab-case
  name: 'Example Cloud Fundamentals'
  issuer: 'Example Issuer'
  date: '2024-05'                         # issue date
  expires: null                           # optional; '2027-05' or null
  credentialId: 'TODO(ioannis): credential ID, if any'   # optional; string or null
  summary: 'One line on what it covers.'  # optional
  tech: ['Cloud', 'Networking']           # optional
  links:
    credential: 'https://example.com/verify/abc123'   # verification page
  featured: true
  order: 0
```

## project (professional / GitHub) — `src/content/projects/<slug>.mdx`

```mdx
---
title: 'Example Project'
tagline: 'One line: the problem it solves.'
summary: 'Optional two-sentence overview.'   # optional
start: '2025-01'                          # optional
end: '2025-03'                            # optional; or 'present'
highlights: ['Optional outcome or notable detail.']
tech: ['TypeScript', 'Astro']
links:
  repo: 'https://github.com/example/example-project'
  demo: 'https://example.com'             # optional
images:                                   # optional; images[0] = card thumbnail
  - src: '../../assets/projects/example-project.svg'
    alt: "Screenshot of the project's main view."   # double quotes when the text has an apostrophe
featured: true
order: 0
---

Short write-up: problem → approach → result.
```

## academic-work — `src/content/academic-work/<slug>.mdx`

```mdx
---
title: '2D heat diffusion solver'
type: 'simulation'                        # exercise | assignment | project | simulation | seminar | report | talk | poster | other
course: 'Computational Physics'           # optional
institution: 'Example University'         # optional
start: '2022-03'                          # optional
end: '2022-06'                            # optional
summary: 'The physical or technical question it addresses.'   # required
methods: ['Crank–Nicolson', 'Sparse linear solvers']
tech: ['Python', 'SciPy']
highlights: []                            # optional
links:
  code: 'https://github.com/example/heat-diffusion'   # optional
  report: '/documents/heat-diffusion-report.pdf'      # optional
images:                                   # optional; images[0] = card figure
  - src: '../../assets/academic/heat-diffusion.svg'
    alt: 'Temperature field on a square plate after 1 s.'
    caption: 'Temperature field at t = 1 s.'
featured: false
order: 0
---
```

## skill — edit `src/content/skills.yaml`

Each list item is a **group**; add skills to the `items` of the matching group.

```yaml
- id: programming-languages               # required, unique, kebab-case
  group: 'Programming languages'
  order: 1
  items:
    - name: 'Python'
      context: 'numerical simulation, data analysis, automation'   # optional but expected
      icon: 'simple-icons:python'         # optional Iconify name
```

Groups (ids, in order): `programming-languages` Programming languages ·
`scientific-computing` Scientific computing · `web-and-software` Web & software ·
`data-and-tools` Data & tools · `platforms-and-devops` Platforms & DevOps ·
`professional-skills` Professional skills. No ratings, levels or percentages.

## interest — edit `src/content/interests.yaml`

```yaml
- id: hiking                              # required, unique, kebab-case
  name: 'Hiking'
  note: "Short personal phrase in Ioannis's own words."   # optional
  icon: 'lucide:mountain'                 # optional Iconify name
  order: 1
```

## Validating this file

After changing the schema or these templates: copy each block above into a temporary
entry (create any referenced image under `src/assets/`), run `npx astro check` and
`npm run build`, then delete the temporary entries and images.
