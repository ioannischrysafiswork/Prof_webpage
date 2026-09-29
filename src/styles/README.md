# Design system — tokens & components

Concept: a **physicist-engineer's notebook**. Warm paper, graphite ink, a single ink-blue
accent, fine rules, monospaced data labels. Calm and precise, with room around everything.
All tokens live in [`global.css`](./global.css). Components never use raw hex values or
ad-hoc sizes. Try every component on the dev-only styleguide at
`http://localhost:4321/<base>/dev/styleguide` (`npm run dev`; it is never built for production).

## Rules for page builders

- Use **semantic tokens** (`bg-surface`, `text-muted`, `border-border`, `var(--space-lg)`),
  not the neutral scale or `dark:` overrides. Every semantic colour switches theme on its own.
- There is **one accent** (links, focus, primary buttons). Tints are for **small details only**:
  eyebrows, timeline nodes, the nav underline, feature-card tabs. Never use them for backgrounds or large text.
- Tailwind's default palette is removed (`--color-*: initial`), so `text-red-500` does not exist.
- Every `href` passed to a component must already be final: `url('/work')` for internal paths.
  Content `links.*` values are already absolute or site-relative, so run them through `url()` too.
  Components never call `url()` themselves.
- Skills are **chips with context**. Never use levels, bars, stars or percentages.
- Do not wrap above-the-fold content (the page intro / LCP element) in `<Reveal>`.
- Hide screen-only controls in print with `data-print="hide"` (or Tailwind `print:hidden`).

## Tokens

| Group                      | Tokens (CSS var → Tailwind utility)                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces                   | `--color-background` (page), `--color-surface` (cards), `--color-sunken` (code, chip wells) → `bg-background`, `bg-surface`, `bg-sunken`                                                                                                                                                                |
| Text                       | `--color-foreground`, `--color-muted` (secondary, AA) → `text-foreground`, `text-muted`. `--color-faint` is **decorative only** (not text).                                                                                                                                                             |
| Lines                      | `--color-border` (hairlines), `--color-border-strong` (rails, outlines) → `border-border`, `border-border-strong`                                                                                                                                                                                       |
| Accent                     | `--color-accent`, `--color-accent-strong` (hover), `--color-on-accent` (text on accent)                                                                                                                                                                                                                 |
| Tints                      | `--color-tint-home` (= accent), `--color-tint-work` (teal), `--color-tint-academic` (amber); aliases `--tint-home/-work/-academic`. **`--tint` / `text-tint` / `border-tint`** = tint of the current page (`html[data-page]`), overridable per element with `data-tint="home\|work\|academic\|accent"`. |
| Plots                      | `--plot-1 … --plot-6`, series colours for theme-aware SVG figures (scientific-figures skill), ≥ 3:1 on every surface                                                                                                                                                                                    |
| Code                       | Shiki `css-variables` theme: `--astro-code-*` (set in `astro.config.mjs`)                                                                                                                                                                                                                               |
| Fonts                      | `font-serif` Newsreader (headings, optical sizes), `font-sans` Inter (body), `font-mono` JetBrains Mono (dates, labels, code)                                                                                                                                                                           |
| Type (fluid, 360 → 1440px) | `text-xs` 12–13 · `text-sm` 14–15 · `text-base` 16–17 · `text-lg` 19–21 · `text-xl` 23–27 · `text-2xl` 28–33 · `text-3xl` 33–42 (h2) · `text-4xl` 40–52 · `text-5xl` 48–65 (h1) px; each has a paired line height. Body line height is 1.6.                                                             |
| Tracking / leading         | `tracking-display` (−0.015em), `tracking-label` (0.08em, uppercase labels), `leading-body` 1.6, `leading-display` 1.1                                                                                                                                                                                   |
| Space (fluid)              | `--space-2xs … --space-3xl`; named Tailwind spacing: `p-gutter` (page side padding), `py-section`, `gap-block`, `gap-stack`. The numeric scale (`p-4` = 1rem) is still available.                                                                                                                       |
| Widths                     | `max-w-measure` (70ch prose), `max-w-title` (20ch), `max-w-page` (76rem frame); utility `container-page` (centred frame + gutter)                                                                                                                                                                       |
| Radii                      | `rounded-xs` 2px · `rounded-sm` 4px (chips, buttons) · `rounded-md` 8px (cards, code) · `rounded-lg` 12px · `rounded-full`                                                                                                                                                                              |
| Shadows                    | `shadow-xs`, `shadow-sm` (hover), `shadow-md` (overlays only). Keep them subtle.                                                                                                                                                                                                                        |
| Motion                     | `--duration-fast` 120ms, `--duration-base` 200ms, `--duration-slow` 450ms; `ease-standard`, `ease-emphasized`; `--reveal-distance`, `--reveal-stagger`. All motion is disabled under `prefers-reduced-motion`.                                                                                          |
| Sizes                      | `--size-target` 44px (touch targets), `--size-icon`, `--size-icon-sm`, `--rule-width` 1px, `--rule-width-strong` 2px, `--label-col` 11rem, `--tl-*` (timeline geometry), `--header-height`                                                                                                              |
| Utilities                  | `container-page`, `bg-grid` (graph-paper motif, decorative layers only), `link` (accent inline link), `sr-only`, `sr-only-focusable`, `print-only`                                                                                                                                                      |

### Contrast (WCAG 2.2 AA, verified)

| Pair                                           | Light              | Dark               |
| ---------------------------------------------- | ------------------ | ------------------ |
| foreground on background / surface / sunken    | 16.7 / 17.5 / 15.6 | 15.3 / 13.4 / 15.9 |
| muted on background / surface / sunken         | 5.8 / 6.1 / 5.4    | 7.9 / 6.9 / 8.2    |
| accent on background / surface / sunken        | 6.9 / 7.2 / 6.4    | 9.0 / 7.9 / 9.3    |
| tint-work on background / surface / sunken     | 6.1 / 6.4 / 5.7    | 10.1 / 8.8 / 10.5  |
| tint-academic on background / surface / sunken | 5.6 / 5.9 / 5.2    | 10.3 / 9.0 / 10.6  |
| on-accent on accent (primary button)           | 7.2                | 9.0                |
| plot-1…6 on any surface (graphics, need ≥ 3:1) | ≥ 3.6              | ≥ 6.3              |

### Theming

`light-dark(<light>, <dark>)` values follow `color-scheme`. With no JS, the OS preference applies.
`ThemeScript.astro` (inline in `<head>`) sets `html[data-theme]` from localStorage or the OS
before first paint, adds `html.js`, and re-applies both on every `<ClientRouter />` swap.
The toggle stores `"light"`/`"dark"` under the key `theme`. Browsers without `light-dark()`
(pre-2024) fall back to plain black on white.

## Components

All components are in `src/components/`. Every `class` prop is merged into the root element.
`Tint` = `'home' | 'work' | 'academic' | 'accent'` (from `@/lib/site`).

### Layout (used by `BaseLayout`, rarely imported directly)

- `layouts/BaseLayout.astro`: props `page?: PageKey`, `path`, `title?`, `description?`, `ogImage?`, `noindex?`; slots default and `head`. `<main>` is full width; frame content with `Section` / `PageHeader` / `container-page`.
- `layout/Header.astro` (+ `Nav.astro`, `ThemeToggle.astro`): sticky header. Below 40rem the nav becomes a disclosure menu when JS is on.
- `layout/Footer.astro`: contact (profile `contact.email`, `socials`, `cv`), section cross-links with one-line descriptions (`NAV[].description` in `lib/site.ts`), and the last-updated (build) date. `TODO(ioannis)` values are skipped in chrome.
- `layout/PrintMasthead.astro`: print-only CV header (name, headline, contact, online URL).

### `ui/PageHeader.astro`: page intro, the page's only `<h1>`

Props: `title`, `id = 'about'` (h1 id = `${id}-title`), `eyebrow?`, `lede?`, `tint?`, `grid = true`.
Slots: default (intro paragraphs, 70ch), `actions` (buttons), `aside` (portrait / hero visual, sits right from 64rem).

```astro
<PageHeader eyebrow={profile.name} title="Work Experience" lede={profile.headline}>
  <p>{profile.intro.work}</p>
  <Fragment slot="actions">
    <LinkButton href={url(profile.cv.work)} data-print="hide">
      Download CV
    </LinkButton>
  </Fragment>
</PageHeader>
```

### `ui/Section.astro`: section with a stable anchor

Props: `id` (permanent), `title`, `eyebrow?`, `description?`, `level = 2 | 3 | 4`, `as = 'section' | 'article'`, `tint?`, `contained` (default: level 2), `divider` (default: level 2).
Slots: default, `actions`. Renders `<section id aria-labelledby="${id}-title">` + `SectionHeading`.
Nest level-3 sections for sub-anchors: `<Section id="master-thesis" as="article" level={3} title="Master's thesis">`.

### `ui/SectionHeading.astro`

Props: `anchor` (section id), `title`, `id = ${anchor}-title`, `level = 2`, `eyebrow?`, `description?`. Default slot = actions. Shows a `#` permalink on hover/focus (always on touch screens).

### `ui/Eyebrow.astro`

Props: `as = 'p' | 'span' | 'div'`, `tint?`, `rule = true`. Mono uppercase label in the section tint.

### `ui/Card.astro`

Props: `as = 'article' | 'div' | 'li' | 'section'`, `title?`, `headingLevel = 3`, `href?` (stretches the title link over the card), `external?` (auto), `eyebrow?`, `meta?` (mono line, e.g. `issuer · date`), `variant = 'default' | 'feature' | 'plain'`, `tint?`, `id?`.
Slots: `media` (full-bleed top image), default (body, muted), `footer` (chips/links; stays clickable, pinned to the bottom).
Grid: `<ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><Card as="li" …/></ul>`.

### `ui/Chip.astro` / `ui/ChipList.astro`

Chip props: `as = 'span' | 'li'`, `variant = 'default' | 'tint' | 'outline'`, `size = 'md' | 'sm'`, `tint?`, `title?`.
ChipList props: `items: string[]`, `label?` (aria-label), `variant?`, `size?`, `tint?`. Renders nothing if empty.
For skills with context, pair a chip with muted text, e.g. `<Chip>Python</Chip> <span class="text-muted text-sm">numerical simulation, data analysis</span>`.

### `ui/Button.astro` / `ui/LinkButton.astro`

Shared props: `variant = 'primary' | 'secondary' | 'quiet'` (default `secondary`; use at most one `primary` per view), `size = 'md' | 'sm'`, `icon?` (Iconify name, e.g. `lucide:download`), `iconPosition = 'end' | 'start'`.
`Button`: `type = 'button'`, plus any `<button>` attributes. `LinkButton`: `href` (final), `external?` (auto; adds ↗), `printUrl = true`, plus any `<a>` attributes (`download`, `data-print="hide"` …).

### `ui/Prose.astro`

`<Prose><Content /></Prose>` styles Markdown/MDX output (headings, lists, quotes, code, tables, figures, KaTeX overflow), 70ch. Props: `as?`.

### `ui/Reveal.astro`

`<Reveal stagger={i}>…</Reveal>` gives a fade-up on scroll. Props: `as = 'div' | 'li' | 'section' | 'article'`, `stagger` (0–6). Content stays visible without JS, under reduced motion, and in print. Adds about 0.6 KB of JS to the page.

### `timeline/Timeline.astro` + `timeline/TimelineItem.astro`: the signature component

Timeline props: `label?` (aria-label of the `<ol>`), `tint?`.
TimelineItem props: `title`, `subtitle?` (organisation), `meta?: (string|undefined)[]` (location, type…), `start?`, `end?` (ISO / `present` / TODO), `showDuration?`, `summary?`, `highlights?`, `tech?`, `techLabel?`, `links?: {label, href}[]`, `collapsible = true`, `open = false`, `detailsLabel = 'Highlights & tools'`, `current?` (default `end === 'present'`, filled node), `id?` (anchor), `headingLevel = 3`.
Default slot: extra detail content (e.g. `<Content />` of the entry). Sort before rendering (`sortByDateDesc` for work, `sortByDateAsc` for the roadmap).

```astro
<Timeline label="Work experience, most recent first">
  {jobs.map(({ data }) => (
    <TimelineItem
      title={data.role}
      subtitle={data.organisation}
      meta={[data.location, data.employmentType]}
      start={data.start}
      end={data.end}
      showDuration
      summary={data.summary}
      highlights={data.highlights}
      tech={data.tech}
    />
  ))}
</Timeline>
```

## Print (`/work`, `/academic` → CV)

`@media print` in `global.css` §7 re-declares the type and space tokens in pt, turns everything
black on white with a serif body, hides the header, menu, toggle, `#` links, footer cross-links and
`[data-print="hide"]`, shows a print-only masthead, prints URLs after external links (internal
links opt in with `data-print-url`, which LinkButton, Card and TimelineItem set automatically), expands
`<details>`, and keeps timeline items and cards on one page. Decorative lines use borders
(not backgrounds) so they survive `printBackground: false`.
Check it with the `export-cv-pdf` skill.

## Science components (`src/components/science/`)

Only real data/results from Ioannis, or say "Illustrative" in the caption. All colours come
from tokens and follow the theme.

- **`HeroField.astro`**: decorative Home-hero wave/particle field (aria-hidden, ≈1.6 KB gzip
  JS, ≤ 30 fps, paused off-screen / hidden tab / reduced motion, static CSS lattice without
  JS, hidden in print). Props: `layout = 'fill' | 'box'` (fill = absolute layer, parent needs
  `position: relative; isolation: isolate`; box = block with `aspect`), `aspect = '4 / 3'`,
  `mask = 'edge' | 'radial' | 'none'`, `tint?: Tint` (default accent), `class`.
- **`Equation.astro`**: KaTeX at build time (HTML + MathML), no JS. Props: `tex` (always
  ``tex={String.raw`…`}`` — quoted attributes eat backslashes), `inline = false`, `label?`
  ("1" → "(1)"), `id?` (e.g. `eq-heat`), `ariaLabel?`, `macros?`, `class`. Display equations
  scroll inside their own box and are focusable. Invalid TeX fails the build.
- **`MathStyles.astro`**: no props; add once to a page that shows maths only via MDX
  `$…$` / `$$…$$` (Equation already includes the CSS).
- **`Figure.astro`**: numbered `<figure>`. Media: `src?: ImageMetadata`, `svg?: string`
  (`?raw` import, inlined, theme-aware) or default slot. Props: `alt` (required), `caption?`
  (or slot `caption`), `number?`, `prefix = 'Figure'`, `credit?`, `creditHref?`, `id?`,
  `enlarge = true` (native `<dialog>`, ≈0.4 KB gzip JS), `framed = true`, `loading = 'lazy'`,
  `sizes?`, `mediaClass?`, `class`.
- **`PlotEmbed.astro`**: theme-aware Matplotlib SVG (scientific-figures skill); maps
  Matplotlib fonts to site fonts. Props: `svg`, `alt` (required), `caption?`, `number?`,
  `prefix?`, `credit?`, `creditHref?`, `id?`, `enlarge = true`, `framed = true`, `minWidth?`,
  `bare = false`, `class`.
- **`SimulationCanvas.astro`**: lazy canvas for real simulations; module in
  `src/components/science/sims/<sim>.ts` default-exports a `CreateSimulation` (see
  `simulation.ts`: `reset()`, `step(dt)`, `draw(ctx, {width, height, colors})`, optional
  `resize`, `destroy`). Props: `sim`, `alt` (required), `params?`, `aspect = '16 / 9'`,
  `poster?: ImageMetadata`, `label`, `autoplay = true`, `staticTime = 0`, `class`. Wrap in
  `<Figure>` for a caption. Runtime ≈2.1 KB gzip + the sim chunk, loaded near the viewport.
