// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/*
 * Hosting target (CLAUDE.md §3.1)
 * --------------------------------
 * `site` and `base` come from env vars so switching between a GitHub Pages
 * project site, a user site or a custom domain is config-only:
 *
 *   User site (default, repo ioannischrysafiswork.github.io):
 *                               SITE_URL=https://ioannischrysafiswork.github.io  BASE_PATH=/
 *   Custom domain:              SITE_URL=https://example.com                     BASE_PATH=/
 *   Project site:               SITE_URL=https://<user>.github.io                BASE_PATH=/<repo>
 *
 * Set them in a local `.env` file (git-ignored) or as env vars in the deploy workflow.
 * Internal links must always go through `url()` in `src/lib/url.ts`.
 */
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

const DEFAULT_SITE = 'https://ioannischrysafiswork.github.io';
const DEFAULT_BASE = '/';

/** Normalise a base path to "/" or "/segment" (leading slash, no trailing slash). */
function normaliseBase(/** @type {string | undefined} */ value) {
  const trimmed = (value ?? '').trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '/';
}

const site = (env.SITE_URL || DEFAULT_SITE).replace(/\/+$/, '');
const base = normaliseBase(env.BASE_PATH ?? DEFAULT_BASE);

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // work.astro -> dist/work/index.html, served at /work and /work/
    format: 'directory',
  },

  integrations: [
    mdx(),
    sitemap(),
    // Inline SVG icons from Iconify sets (lucide, simple-icons); only used icons are bundled.
    icon(),
  ],

  markdown: {
    // Astro 7 defaults to the Sätteri processor; remark/rehype plugins (maths) need unified().
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      // Palette-matched highlighting: token colours are CSS variables
      // (--astro-code-*) defined for both themes in src/styles/global.css.
      theme: 'css-variables',
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
