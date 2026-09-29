/**
 * Helpers for /work components: which content values are real data, and how content
 * `links.*` become final hrefs. Build-time only (never shipped to the browser).
 *
 * TODO(ioannis) placeholders stay VISIBLE as text (so drafts show what is missing), but
 * are never turned into links, JSON-LD or buttons.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { isTodo } from '@/lib/dates';
import { url } from '@/lib/url';

export type LinkKey = 'repo' | 'demo' | 'pdf' | 'credential' | 'code' | 'report' | 'website';
export type Links = Partial<Record<LinkKey, string>>;

/** True for a real value: a non-empty string that is not a `TODO(ioannis)` placeholder. */
export function hasValue(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== '' && !isTodo(value);
}

/** True for absolute http(s) URLs. */
export function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/** Visible labels for content links (UI copy, not CV data). */
const LINK_LABELS: Record<LinkKey, string> = {
  website: 'Website',
  repo: 'Repository',
  demo: 'Live demo',
  code: 'Code',
  report: 'Report',
  pdf: 'Document (PDF)',
  credential: 'Credential',
};

const DEFAULT_ORDER: readonly LinkKey[] = [
  'website',
  'repo',
  'demo',
  'code',
  'report',
  'pdf',
  'credential',
];

export interface ResolvedLink {
  key: LinkKey;
  label: string;
  /** Final href: internal paths already passed through `url()`. */
  href: string;
  external: boolean;
}

/**
 * Turn an entry's `links` object into a list of final links, skipping empty values and
 * placeholders. `labels` overrides the default label per key.
 */
export function resolveLinks(
  links: Links | undefined,
  options: { order?: readonly LinkKey[]; labels?: Partial<Record<LinkKey, string>> } = {},
): ResolvedLink[] {
  const { order = DEFAULT_ORDER, labels = {} } = options;
  if (!links) return [];
  return order.flatMap((key) => {
    const value = links[key];
    if (!hasValue(value)) return [];
    const href = url(value);
    return [{ key, label: labels[key] ?? LINK_LABELS[key], href, external: isExternal(href) }];
  });
}

/**
 * A downloadable document (e.g. the CV PDF) is offered only if it really exists:
 * absolute URLs are trusted; site-relative paths must exist in `public/` at build time.
 * Returns the final href, or `undefined`.
 */
export function publishedDocument(path: string | null | undefined): string | undefined {
  if (!hasValue(path)) return undefined;
  if (isExternal(path)) return path;
  let file: string;
  try {
    file = join(process.cwd(), 'public', decodeURI(path.split(/[?#]/)[0] ?? ''));
  } catch {
    return undefined;
  }
  return existsSync(file) ? url(path) : undefined;
}
