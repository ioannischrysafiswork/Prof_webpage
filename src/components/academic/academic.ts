/**
 * Helpers for the /academic page components. Pure functions over content-collection
 * data: no CV facts live here, only UI labels and formatting rules.
 */
import type { CollectionEntry } from 'astro:content';
import { formatRange, isTodo } from '@/lib/dates';
import { url } from '@/lib/url';

export type EducationEntry = CollectionEntry<'education'>;
export type ThesisEntry = CollectionEntry<'theses'>;
export type AcademicWorkEntry = CollectionEntry<'academicWork'>;
export type Level = EducationEntry['data']['level'];
export type Links = EducationEntry['data']['links'];

/** A labelled, final href (already passed through `url()`). */
export interface LabelledLink {
  label: string;
  href: string;
  icon?: string;
}

/** True for real, non-placeholder text. */
export function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== '' && !isTodo(value);
}

/** True for any non-empty text, including `TODO(ioannis)` placeholders (shown in drafts). */
export function present(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/** Order of academic levels on the page: Bachelor → Master → PhD → other. */
export const LEVEL_RANK: Record<Level, number> = { bachelor: 0, master: 1, phd: 2, other: 3 };

/** UI labels per level (not CV data). */
export const DEGREE_LABEL: Record<Level, string> = {
  bachelor: "Bachelor's degree",
  master: "Master's degree",
  phd: 'Doctorate',
  other: 'Qualification',
};

export const THESIS_LABEL: Record<Level, string> = {
  bachelor: "Bachelor's thesis",
  master: "Master's thesis",
  phd: 'Doctoral thesis',
  other: 'Thesis',
};

/** Link labels + icons for the `links` object, in display order. */
const LINK_META: Record<keyof Links, { label: string; icon: string }> = {
  pdf: { label: 'PDF', icon: 'lucide:file-text' },
  report: { label: 'Report', icon: 'lucide:file-text' },
  code: { label: 'Code', icon: 'lucide:code' },
  repo: { label: 'Repository', icon: 'simple-icons:github' },
  demo: { label: 'Demo', icon: 'lucide:play' },
  website: { label: 'Website', icon: 'lucide:globe' },
  credential: { label: 'Credential', icon: 'lucide:badge-check' },
};

/**
 * Turn a `links` object into a list of final hrefs. Placeholders are skipped (a TODO
 * href would be a broken link). `labels` overrides the default label per key.
 */
export function toLinks(
  links: Links,
  labels: Partial<Record<keyof Links, string>> = {},
  skip: readonly (keyof Links)[] = [],
): LabelledLink[] {
  return (Object.keys(LINK_META) as (keyof Links)[])
    .filter((key) => !skip.includes(key) && hasText(links[key]))
    .map((key) => ({
      label: labels[key] ?? LINK_META[key].label,
      href: url(links[key] as string),
      icon: LINK_META[key].icon,
    }));
}

/** `Mar 2024 – Jul 2026`, or the single date / placeholder that is known. */
export function dateRange(start?: string | null, end?: string | null): string {
  if (present(start)) return formatRange(start, end);
  return present(end) ? formatRange(end) : '';
}

/**
 * Give each entry a unique, stable anchor. The preferred anchor comes from content
 * (`anchor`), else `fallback`; later duplicates get `-2`, `-3`… so ids never collide.
 */
export function uniqueAnchors<T>(
  items: readonly T[],
  preferred: (item: T) => string,
  used: Set<string> = new Set(),
): Map<T, string> {
  const result = new Map<T, string>();
  for (const item of items) {
    const base = preferred(item);
    let id = base;
    for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
    used.add(id);
    result.set(item, id);
  }
  return result;
}

/** Split a multi-paragraph text field (blank-line separated) into paragraphs. */
export function paragraphs(text: string | undefined): string[] {
  return (text ?? '')
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** True if a Markdown/MDX body contains TeX maths (`$…$` or `$$…$$`). */
export function hasMaths(body: string | undefined): boolean {
  if (!body) return false;
  return /\$\$[\s\S]+?\$\$|(?:^|[^\\$\w])\$(?=\S)[^$\n]*?\S\$(?!\w)/m.test(body);
}

/** True if an entry has a non-empty Markdown/MDX body to render. */
export function hasBody(entry: { body?: string }): boolean {
  return typeof entry.body === 'string' && entry.body.trim() !== '';
}

/* --------------------------------------------------------------- Academic work */

/**
 * Types listed under #projects; the rest (talks, posters, seminars…) go to #other.
 * Keep in sync with the per-type filter rules in AcademicWorkGrid.astro.
 */
export const PROJECT_TYPES = ['exercise', 'assignment', 'project', 'simulation', 'report'] as const;
export const OTHER_TYPES = ['seminar', 'talk', 'poster', 'other'] as const;

export type WorkType = (typeof PROJECT_TYPES)[number] | (typeof OTHER_TYPES)[number];

export const WORK_TYPE_LABEL: Record<WorkType, string> = {
  exercise: 'Exercise',
  assignment: 'Assignment',
  project: 'Project',
  simulation: 'Simulation',
  report: 'Report',
  seminar: 'Seminar',
  talk: 'Talk',
  poster: 'Poster',
  other: 'Other',
};

/** The known type of an entry, or `undefined` while it is still a placeholder. */
export function workType(entry: AcademicWorkEntry): WorkType | undefined {
  const type = entry.data.type;
  return isTodo(type) ? undefined : (type as WorkType);
}

/** Display label for an entry's type (placeholder text is kept visible in drafts). */
export function workTypeLabel(entry: AcademicWorkEntry): string {
  const type = workType(entry);
  return type ? WORK_TYPE_LABEL[type] : entry.data.type;
}

/** Placeholder-typed entries stay in #projects so they remain visible while drafting. */
export function isOtherWork(entry: AcademicWorkEntry): boolean {
  const type = workType(entry);
  return type !== undefined && (OTHER_TYPES as readonly string[]).includes(type);
}
