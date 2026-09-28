# Content templates

These mirror the intended schemas in `src/content.config.ts`. If the real schema differs,
follow the schema and update this file.

**All values below are illustrative placeholders, not facts about Ioannis.** Replace every
value with verified data or `TODO(ioannis): …`.

## experience — `src/content/experience/<yyyy>-<org>-<role>.md`

```markdown
---
role: "Software Engineer"
organisation: "Organisation name"
organisationUrl: "https://…"          # optional
location: "Athens, Greece"
employmentType: "Full-time"           # Full-time | Part-time | Contract | Internship
start: "2023-01"
end: "present"                        # or "2024-06"
summary: "One sentence on the role's scope."
highlights:
  - "Designed … which reduced … by …"
  - "Led … across … teams …"
tech: ["Python", "Azure", "Docker"]
featured: true                        # show on Home highlights
order: 0                              # optional tie-breaker
---

Optional longer description (Markdown), shown in the expandable details.
```

## education — `src/content/education/<yyyy>-<level>-<institution>.md`

```markdown
---
level: "master"                       # bachelor | master | phd | other
degree: "MSc in Computational Physics"
institution: "University name"
institutionUrl: "https://…"
location: "City, Country"
start: "2021-10"
end: "2023-07"
grade: "TODO(ioannis): show grade? if yes, value and scale"
focus: ["Numerical methods", "Statistical physics"]
keyCourses: ["Computational Physics", "Monte Carlo Methods"]
anchor: "master-degree"               # stable id on /academic
featured: true
---
```

## thesis — `src/content/theses/bachelor.mdx` or `master.mdx`

```mdx
---
level: "master"
title: "Exact thesis title"
supervisor: "Prof. Name Surname"
institution: "University name"
year: 2023
abstract: "≤120-word faithful summary of the original abstract."
methods: ["Finite-difference time domain", "Runge–Kutta 4"]
tools: ["Python", "NumPy", "Matplotlib"]
pdf: "/documents/master-thesis.pdf"
figure: "../../assets/theses/master-key-figure.svg"   # optional
figureCaption: "What the figure shows."
anchor: "master-thesis"
---

import Equation from '../../components/science/Equation.astro';

Optional extended write-up with equations, e.g.

$$ i\hbar \frac{\partial \psi}{\partial t} = \hat H \psi $$
```

## certification — append to `src/content/certifications.yaml`

```yaml
- id: azure-fundamentals-az-900
  name: "Microsoft Certified: Azure Fundamentals"
  issuer: "Microsoft"
  date: "2024-05"
  expires: null
  credentialId: "TODO(ioannis)"
  verifyUrl: "https://learn.microsoft.com/…"
  featured: true
```

## project (professional / GitHub) — `src/content/projects/<slug>.mdx`

```mdx
---
title: "Project name"
tagline: "One line: the problem it solves."
repo: "https://github.com/<user>/<repo>"
demo: null
stack: ["TypeScript", "Astro"]
image: "../../assets/projects/<slug>.png"   # optional
year: 2025
featured: true
order: 0
---

Short write-up: problem → approach → result.
```

## academic-work — `src/content/academic-work/<slug>.mdx`

```mdx
---
title: "2D heat diffusion solver"
type: "simulation"                    # exercise | assignment | project | simulation | seminar
course: "Computational Physics"       # optional
year: 2022
problem: "What physical question it addresses."
method: ["Crank–Nicolson", "Sparse linear solvers"]
tools: ["Python", "SciPy"]
figure: "../../assets/academic/<slug>.svg"
figureCaption: "…"
code: "https://github.com/…"          # optional
report: "/documents/<slug>.pdf"       # optional
featured: false
---
```

## skill — edit `src/content/skills.yaml`

```yaml
- group: "Programming languages"
  items:
    - name: "Python"
      context: "numerical simulation, data analysis, automation"
      icon: "simple-icons:python"      # optional
```

Groups (in order): Programming languages · Scientific computing · Web & software ·
Data & tools · Platforms & DevOps · Professional skills.

## interest — edit `src/content/interests.yaml`

```yaml
- name: "Hiking"
  note: "Short personal phrase in Ioannis's words."
  icon: "lucide:mountain"
```
