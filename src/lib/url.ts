/**
 * Base-aware URL helpers (CLAUDE.md §3.1).
 *
 * Every internal link in the project MUST be built with `url()`, so the site works
 * unchanged as a GitHub Pages project site (`/Prof_webpage/...`), a user site or a
 * custom domain (`/...`). Only `astro.config.mjs` (via SITE_URL / BASE_PATH) changes.
 *
 * Trailing-slash policy: page paths (no file extension) get a trailing slash, because
 * `build.format: 'directory'` emits `work/index.html` and GitHub Pages serves it at
 * `/work/` (redirecting `/work` there). Linking to the final URL avoids a redirect hop.
 * `/work` and `/work/` both keep working for links printed in CVs.
 *
 *   url('/')                  -> '/Prof_webpage/'
 *   url('/work')              -> '/Prof_webpage/work/'
 *   url('work#skills')        -> '/Prof_webpage/work/#skills'
 *   url('/documents/cv.pdf')  -> '/Prof_webpage/documents/cv.pdf'
 *   url('https://github.com') -> 'https://github.com' (external: unchanged)
 *   url('#experience')        -> '#experience' (same-page anchor: unchanged)
 */

/** Matches external/absolute URLs and special schemes: https:, mailto:, tel:, //cdn, data: … */
const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

/** Base path without trailing slash: '' for root deployments, '/Prof_webpage' otherwise. */
function basePath(): string {
  return (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');
}

/** Split 'path?query#hash' into ['path', '?query#hash']. */
function splitSuffix(input: string): [string, string] {
  const index = input.search(/[?#]/);
  return index === -1 ? [input, ''] : [input.slice(0, index), input.slice(index)];
}

/** True when the last path segment looks like a file (has an extension), e.g. `cv.pdf`. */
function isFilePath(pathname: string): boolean {
  const last = pathname.split('/').pop() ?? '';
  return /\.[a-z\d]+$/i.test(last);
}

/**
 * Build an internal, base-aware URL for a site path.
 * External URLs, `mailto:`/`tel:` links and same-page anchors (`#id`) are returned unchanged.
 */
export function url(path: string = '/'): string {
  const input = path.trim();
  if (EXTERNAL.test(input) || input.startsWith('#')) return input;

  const [rawPath, suffix] = splitSuffix(input);
  let pathname = `/${rawPath}`.replace(/\/{2,}/g, '/');

  if (!isFilePath(pathname) && !pathname.endsWith('/')) pathname += '/';

  return `${basePath()}${pathname}${suffix}`;
}

/**
 * Absolute URL (with `site` origin) for canonical links, Open Graph and JSON-LD.
 * Falls back to a root-relative URL if `site` is not configured.
 */
export function absoluteUrl(path: string = '/'): string {
  const relative = url(path);
  if (EXTERNAL.test(relative)) return relative;
  const site = import.meta.env.SITE;
  return site ? new URL(relative, site).href : relative;
}

/**
 * Normalise a pathname for comparisons (e.g. active nav state): strips the base path,
 * `index.html` and trailing slashes. '/Prof_webpage/work/' -> '/work', base -> '/'.
 */
export function stripBase(pathname: string): string {
  const base = basePath();
  let path = pathname.replace(/\/index\.html$/, '');
  if (base && (path === base || path.startsWith(`${base}/`))) path = path.slice(base.length);
  path = path.replace(/\/+$/, '');
  return path === '' ? '/' : path;
}
