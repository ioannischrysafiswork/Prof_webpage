---
name: og-images
description: Create the Open Graph / social preview images (1200×630) for Home, Work and Academic so each shared link shows its own branded card in LinkedIn, email and messaging apps. Use when setting up SEO, after changing the headline or design, or when a preview card looks wrong.
disable-model-invocation: true
---

# Open Graph images

Each shareable page gets its own card: `public/og/home.png`, `public/og/work.png`,
`public/og/academic.png` (1200×630 PNG, < 300 KB).

## Approach: render a dev-only Astro template, screenshot it with Playwright

1. Create `src/pages/og-card/[slug].astro` that renders **only in development**:
   ```astro
   ---
   export function getStaticPaths() {
     if (!import.meta.env.DEV) return [];          // never shipped to production
     return ['home', 'work', 'academic'].map((slug) => ({ params: { slug } }));
   }
   const { slug } = Astro.params;
   ---
   ```
   Content of the card (use design tokens and site fonts, 1200×630 fixed box, no nav):
   - Name "Ioannis Chrysafis" in the display serif, large.
   - Subtitle from `profile.yaml`: headline (home), "Work Experience" + current role
     (work), "Academic" + degree focus (academic).
   - The section tint as a thin accent bar / subtle scientific motif (grid or wave).
   - Domain in monospace at the bottom (from `site` in `astro.config.mjs`).
   - Light theme, high contrast, text ≥ 48px for the name, safe margins ≥ 64px.
   - Add `<meta name="robots" content="noindex">`.
2. Start `npm run dev` in the background and wait for `http://localhost:4321/`.
3. Run `node "${CLAUDE_SKILL_DIR}/scripts/og-shots.mjs" --url http://localhost:4321/`
   (add the base path to the URL if `base` is not `/`).
4. Stop the dev server. Open the three PNGs with the Read tool and check them visually.
5. Confirm each page's `<head>` references its image with an **absolute** URL
   (`og:image`, `twitter:image`, `og:image:width/height`, `og:image:alt`).
