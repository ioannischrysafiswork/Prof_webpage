# CLAUDE.md — Ioannis Chrysafis · Personal Website

This file is the single source of truth for Claude Code when working in this repository.
Read it fully before making changes. Specialised subagents live in `.claude/agents/`
(see "Agent team & workflow" at the bottom).

---

## 1. Purpose

A personal website that represents **Ioannis Chrysafis as a whole person**, not just an
online CV. It showcases personality and interests, professional experience, academic
background, technical skills, certifications, and projects.

Tone: **professional but personal**. Calm, confident, precise, never boastful.
Language: **English only**.

---

## 2. Information architecture (non-negotiable)

Three distinct areas, always visible in the main navigation, in this order:

```
Home  |  Work Experience  |  Academic
```

| Route       | Page               | Must be independently shareable |
|-------------|--------------------|---------------------------------|
| `/`         | Home / Personal    | yes                             |
| `/work`     | Work Experience    | yes — used in professional CVs  |
| `/academic` | Academic profile   | yes — used in academic/computational CVs |

Rules:

- `/work` and `/academic` are **stable, permanent URLs**. Never rename, nest, or move them.
  They will be printed in CVs, emails, and applications.
- Each page must be **complete and readable on its own**: a visitor landing directly on
  `/academic` must understand who Ioannis is and how to contact him without visiting Home.
  Therefore every page has its own intro, its own meta title/description, its own Open Graph
  image, and a shared footer with contact links.
- Consistent visual identity across all three pages (same tokens, typography, header, footer).
- Anchor links inside pages (e.g. `/work#certifications`, `/academic#master-thesis`) must be
  stable too, so specific sections can be linked directly.

### 2.1 Home (`/`)

1. **Personal introduction (4–5 lines)** at the top: personality, hobbies and interests,
   mentality and approach to learning, curiosity and motivation, what he enjoys outside
   work and academia.
2. **Highlights** — a concise overview of major qualifications: degrees (Bachelor's,
   Master's), key certifications, notable achievements. Pulled from the same content
   collections as `/work` and `/academic` (no duplicated data).
3. **Two clear entry points** (large cards/CTAs) → Work Experience and Academic, each with a
   one-line description of what the visitor will find there.
4. Optional: "Outside work" section (hobbies, interests), contact links.

### 2.2 Work Experience (`/work`)

1. **Intro (4–5 lines)**: professional approach — work ethic, ability to analyse and solve
   difficult problems, adaptability, and ability to integrate effectively into different
   teams and working environments.
2. **Experience timeline** — complete professional history up to the present (reverse
   chronological). Role, organisation, dates, location, 2–4 impact-oriented bullets, tech used.
3. **Certifications** — name, issuer, date, credential ID/verification link.
4. **Selected GitHub projects** — curated cards: title, one-line problem statement, stack,
   links (repo / demo), optional thumbnail.
5. **Programming & coding skills** — languages, frameworks, tools, software, platforms,
   and other technical/professional skills, grouped by category.

### 2.3 Academic (`/academic`)

1. **Intro (4–5 lines)**: interest in physics, computational methods, numerical simulations,
   and using computational tools to investigate and understand physical problems.
2. **Academic roadmap** — chronological progression (visual timeline).
3. **Bachelor's degree** and **Master's degree** — institution, dates, focus, grade (if wanted).
4. **Other academic qualifications**.
5. **Bachelor's thesis** and **Master's thesis** — title, supervisor, abstract, key
   methods, key figure/result, PDF link.
6. **Academic exercises, assignments, projects & simulations** — cards with method,
   tools, a figure/animation, and link to code or report.
7. **Other academic work** demonstrating knowledge and technical ability.

---

## 3. Recommended technology stack (best stylistic result)

Chosen for: pixel-level design control, excellent typography, near-zero JavaScript,
perfect Lighthouse scores, easy content editing, and free hosting on GitHub Pages.

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro** (latest stable), static output | Ships zero JS by default, file-based routing gives `/work` and `/academic` as real pages, content collections, first-class GitHub Pages support. "Islands" allow interactive widgets only where needed. |
| Language | **TypeScript** (strict) | Typed content schemas catch missing fields at build time. |
| Styling | **Tailwind CSS v4** (via `@tailwindcss/vite`) + CSS custom properties for design tokens | Fast iteration, consistent spacing/type scale, tokens defined once in `src/styles/global.css` with `@theme`. |
| Content | **Astro Content Collections** (Content Layer API, `src/content.config.ts`) with **Zod** schemas; Markdown/MDX + YAML | All CV data lives in content files, not in components. One source of truth reused across pages. |
| Rich content | **MDX** (`@astrojs/mdx`) | Thesis and project write-ups can embed figures, equations, and interactive components. |
| Maths | **KaTeX** via `remark-math` + `rehype-katex` | Server-rendered equations for physics content; no client JS. |
| Code blocks | **Shiki** (built into Astro) with a custom theme matching the palette | Beautiful, build-time syntax highlighting. |
| Fonts | **Fontsource** self-hosted variable fonts | No third-party requests, no layout shift. Suggested pairing: **Newsreader** or **Fraunces** (display/serif headings), **Inter** or **IBM Plex Sans** (body), **JetBrains Mono** or **IBM Plex Mono** (code, dates, data labels). |
| Icons | **astro-icon** with Iconify sets (`lucide`, `simple-icons` for tech logos) | Inline SVG, tree-shaken. |
| Images | **`astro:assets`** (`<Image />`, `<Picture />`) | Automatic AVIF/WebP, responsive sizes, no CLS. |
| Motion | CSS transitions + **Astro View Transitions** (`<ClientRouter />`) for smooth page-to-page navigation; IntersectionObserver for subtle reveal-on-scroll | Polished feel with minimal JS. Always honour `prefers-reduced-motion`. |
| Interactive islands | **Svelte** (`@astrojs/svelte`) or vanilla TS `<script>`; `<canvas>` for simulations | Tiny runtime; ideal for a physics hero animation or small interactive simulation demos. |
| Plots | Pre-rendered **SVG** exported from Python/Matplotlib (preferred), or **Observable Plot** for interactive charts | Crisp at any resolution, themeable. |
| SEO | `@astrojs/sitemap`, per-page `<head>` via a `SEO.astro` component, **JSON-LD** (`Person`, `ProfilePage`, `EducationalOccupationalCredential`) | Good ranking for the name; rich previews when links are shared. |
| OG images | Static per-page images in `public/og/` (or generated at build with `satori`) | Each shareable page gets its own preview card. |
| Quality | Prettier (+ `prettier-plugin-astro`, `prettier-plugin-tailwindcss`), ESLint, `astro check`, Lighthouse CI / `unlighthouse`, `pa11y` or axe | Consistent code, enforced a11y/perf budgets. |
| Hosting | **GitHub Pages** via GitHub Actions (`withastro/action`) | Free, deploys on every push to `main`. |

**Do not** introduce: React/Next.js (unnecessary runtime), CSS-in-JS, jQuery, Bootstrap,
UI kits that impose their own look, client-side routers other than Astro's, Google Fonts
CDN links, analytics that require cookie banners.

### 3.1 GitHub Pages & URL stability — IMPORTANT

- `astro.config.mjs` must set `site`, `base`, `output: 'static'`, `build.format: 'directory'`
  (produces `work/index.html`, served at `/work` and `/work/`), and `trailingSlash: 'ignore'`.
- If the repo is deployed as a **project site** (e.g. `github.io/Prof_webpage/`), all URLs
  get a `/Prof_webpage` prefix, which breaks the "clean, stable URL" requirement.
  **Preferred:** use a **custom domain** (e.g. `ioannischrysafis.com`, with `public/CNAME`)
  or a **user site** repo named `<username>.github.io`. Then `base` is `/` and URLs are
  exactly `/`, `/work`, `/academic`.
- Never hard-code internal links. Always build them with the `url()` helper in
  `src/lib/url.ts`, which respects `import.meta.env.BASE_URL`, so switching between project
  site and custom domain requires changing config only.
- Add a `404.astro` page that links back to all three sections.

---

## 4. Design direction

- **Concept:** "Physicist-engineer's notebook" — editorial, calm, precise. Generous white
  space, strong typographic hierarchy, a restrained palette with **one** accent colour.
  Subtle scientific motifs (fine grid lines, a wave/particle field in the Home hero,
  monospaced data labels for dates) — never gimmicky.
- **Section accents:** shared palette; each area may have a slight tint for orientation
  (e.g. Home = neutral accent, Work = deep blue/teal, Academic = warm amber/indigo) applied
  only to small details (active nav underline, timeline dots, section eyebrow labels).
- **Light & dark mode** via `prefers-color-scheme` plus a manual toggle (persisted in
  `localStorage`, wrapped in try/catch, no flash of wrong theme — inline script in `<head>`).
- **Layout:** max content width ~70ch for prose, 12-column grid for cards, mobile-first.
  Must look excellent from 360px phones to 1440px+ desktops. No horizontal scroll.
- **Timelines** (work + academic) are the signature component: vertical line, dated nodes
  in monospace, expandable details.
- **Skills:** grouped chips with context (e.g. "Python — numerical simulation, data
  analysis, automation"). **No percentage bars or star ratings** — they are meaningless.
- **Print stylesheet:** `/work` and `/academic` must print (or "Save as PDF") as a clean
  1–2 page CV: hide nav/animations, black on white, show URLs after links.
- **Accessibility:** WCAG 2.2 AA minimum — contrast ≥ 4.5:1, visible focus rings, semantic
  landmarks, skip link, alt text on every image, keyboard navigable, reduced-motion support.
- **Performance budget:** Lighthouse ≥ 95 in all four categories on every page; total JS on
  `/work` and `/academic` < 20 KB; LCP < 1.5 s on fast 4G.

Design tokens (colours, type scale, spacing, radii, shadows, motion durations) are defined
**only** in `src/styles/global.css`. Components use tokens, never raw hex values.

---

## 5. Project structure

```
/
├── CLAUDE.md
├── .mcp.json                    # MCP connections (see §10)
├── .claude/
│   ├── agents/                  # Claude Code subagents (see §8)
│   ├── skills/                  # reusable procedures (see §9)
│   └── settings.json            # permissions + approved MCP servers
├── source-material/             # RAW inputs from Ioannis: CV PDFs, thesis PDFs,
│                                #   certificates, notes. Read by content-curator.
│                                #   NOT published (outside src/public). Add to .gitignore
│                                #   if it holds private data — a Pages repo is usually public.
├── public/
│   ├── CNAME                    # only if a custom domain is used
│   ├── documents/               # downloadable PDFs (CV, theses) — published
│   ├── og/                      # Open Graph images: home.png, work.png, academic.png
│   └── favicon.svg
├── src/
│   ├── content.config.ts        # collection definitions + Zod schemas
│   ├── content/
│   │   ├── profile.yaml         # name, headline, intros (home/work/academic), contact, socials
│   │   ├── experience/*.md      # one file per role
│   │   ├── education/*.md       # one file per degree/qualification
│   │   ├── theses/*.mdx         # bachelor.mdx, master.mdx
│   │   ├── certifications.yaml
│   │   ├── projects/*.mdx       # GitHub projects (professional)
│   │   ├── academic-work/*.mdx  # exercises, assignments, simulations
│   │   ├── skills.yaml          # grouped skills with context
│   │   └── interests.yaml       # hobbies/interests for Home
│   ├── assets/                  # images processed by astro:assets
│   ├── components/
│   │   ├── layout/              # Header, Nav, Footer, ThemeToggle, SkipLink, SEO
│   │   ├── ui/                  # Card, Chip, Button, SectionHeading, Eyebrow
│   │   ├── timeline/            # Timeline, TimelineItem
│   │   ├── home/  work/  academic/
│   │   └── science/             # Equation, Figure, SimulationCanvas, PlotEmbed
│   ├── layouts/BaseLayout.astro
│   ├── lib/                     # url.ts, dates.ts, jsonld.ts
│   ├── pages/
│   │   ├── index.astro          # /
│   │   ├── work.astro           # /work
│   │   ├── academic.astro       # /academic
│   │   └── 404.astro
│   └── styles/global.css        # Tailwind import + @theme tokens + print styles
├── astro.config.mjs
├── tsconfig.json
└── .github/workflows/deploy.yml
```

---

## 6. Content rules — CRITICAL

- **Never invent facts** about Ioannis: no made-up employers, dates, grades, thesis titles,
  certifications, projects, or skills. Real data comes only from `source-material/`,
  existing content files, his public GitHub, or his direct answers.
- When data is missing, insert a clearly marked placeholder: `TODO(ioannis): <what is needed>`
  and list all open TODOs in the final summary of the task. The build must still pass with
  placeholders present.
- Intros (4–5 lines each) are written in first person, in a warm professional voice,
  and must be approved by Ioannis before being considered final.
- Dates: store as ISO (`2024-03`), render as `Mar 2024`; current roles use `end: present`.
- All content lives in `src/content/`. Components never contain hard-coded CV data.
- Contact details shown publicly: only what Ioannis explicitly approves (email, LinkedIn,
  GitHub, ORCID/Google Scholar if applicable). No phone number or home address by default.

---

## 7. Commands & conventions

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static build → dist/
npm run preview    # serve dist/
npx astro check    # type-check .astro + content schemas
npm run lint       # eslint + prettier --check
```

- Node LTS. Package manager: npm (commit `package-lock.json`).
- Components: PascalCase `.astro`; utilities: camelCase `.ts`; content files: kebab-case.
- Commit messages: Conventional Commits (`feat:`, `fix:`, `content:`, `style:`, `chore:`).
- Work on feature branches; `main` deploys to production.
- Before declaring any task done: `npm run build` and `npx astro check` must pass with zero
  errors, and the three routes must render.

---

## 8. Agent team & workflow

Subagents in `.claude/agents/` — delegate to them by name:

| Agent | Responsibility |
|---|---|
| `site-architect` | Scaffold Astro project, config, routing, base-URL helper, tooling, content schemas. Runs first. |
| `design-system` | Tokens, typography, colour, dark mode, layout primitives, shared UI components, print styles. |
| `content-curator` | Turns `source-material/` and Ioannis's answers into content files; writes intros; tracks TODOs. Never invents facts. |
| `home-page-builder` | Builds `/` — personal intro, highlights, entry cards, interests. |
| `work-page-builder` | Builds `/work` — intro, experience timeline, certifications, GitHub projects, skills. |
| `academic-page-builder` | Builds `/academic` — intro, roadmap, degrees, theses, academic work & simulations. |
| `science-visuals` | KaTeX, figures, plots, simulation canvases, the Home hero animation. |
| `qa-auditor` | Read-only review: accessibility, performance, SEO, responsive, print, link stability, content accuracy. |
| `deploy-engineer` | GitHub Actions workflow, GitHub Pages setup, custom domain, post-deploy checks. |

Recommended build order:

1. `site-architect` → 2. `design-system` → 3. `content-curator` (in parallel with 2)
→ 4. page builders (`home-page-builder`, `work-page-builder`, `academic-page-builder`,
with `science-visuals` supporting) → 5. `qa-auditor` → fixes → 6. `deploy-engineer`.

---

## 9. Skills (`.claude/skills/`)

Reusable procedures. Agents and the main session should use them instead of improvising.
Skills marked *manual* run only when Ioannis types the slash command.

| Skill | Use it to | Invocation |
|---|---|---|
| `ingest-source-material` | Read `source-material/` and build `_inventory.md` (facts + sources + gaps) | auto or `/ingest-source-material` |
| `add-content-entry` | Add/update one job, degree, thesis, certificate, project, simulation, skill or interest | auto or `/add-content-entry <type>` |
| `write-intros` | Draft the three 4–5 line intros (2 variants each) and store approved text | auto or `/write-intros <page>` |
| `scientific-figures` | Theme-aware SVG plots from Matplotlib (`site.mplstyle`, `export_figure.py`) | auto or `/scientific-figures` |
| `site-preflight` | Build + check + lint + structural check of `dist/` (routes, anchors, SEO, TODOs) | auto or `/site-preflight` |
| `export-cv-pdf` | Print `/work` and `/academic` to PDF CVs in `public/documents/` | manual `/export-cv-pdf` |
| `og-images` | Generate 1200×630 social preview cards per page | manual `/og-images` |
| `ship` | Preflight → QA → commit → push → PR → verify live | manual `/ship` |

## 10. Connections (MCP servers, `.mcp.json`)

| Server | Purpose | Setup |
|---|---|---|
| `astro-docs` | Official, always-current Astro documentation — check it before using any Astro API | none |
| `context7` | Up-to-date docs for Tailwind, KaTeX, Playwright, Svelte and other libraries | none |
| `playwright` | Drive a real browser for visual QA: screenshots at 360/768/1024/1440px, both themes, print preview | Node.js installed (runs via `npx`) |
| `github` | Read Ioannis's repos to curate projects, open PRs, check Actions/Pages status | env var `GITHUB_PAT` (fine-grained token, see below) |

Rules: prefer `astro-docs` / `context7` over memory for library APIs and versions.
Never print, log or commit tokens. `settings.json` pre-approves these servers and safe
commands; `git push`/`merge` always ask first; force-push is denied.

GitHub token: GitHub → Settings → Developer settings → Fine-grained tokens → access to
this repository only, permissions *Contents: read/write, Pull requests: read/write,
Actions: read, Pages: read, Metadata: read*. On Windows: `setx GITHUB_PAT "<token>"`,
then open a new terminal.
