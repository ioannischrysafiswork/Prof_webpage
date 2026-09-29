/**
 * Home-page data, derived from the SAME content collections as /work and /academic
 * (CLAUDE.md §2.1: no duplicated data). Nothing here holds CV text: it only selects,
 * orders and links entries.
 *
 * - Highlights: entries marked `featured: true` — degrees, current/key roles,
 *   certifications, and up to two achievements (theses, projects, academic work).
 *   Each links to its stable anchor on /work or /academic.
 * - Entry previews: the current (or latest) role and degree for the two entry cards.
 *
 * `TODO(ioannis)` placeholders are kept in titles (so gaps stay visible in drafts) but
 * dropped from secondary meta lines and previews, which would otherwise be all noise.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { formatDate, formatRange, isTodo, sortByDateDesc } from '@/lib/dates';

export type HighlightTint = 'work' | 'academic';

export interface Highlight {
  /** Unique key for rendering. */
  key: string;
  /** Short kind label, e.g. "Master's degree", "Certification". UI copy, not CV data. */
  kind: string;
  title: string;
  /** Mono meta line (institution · dates); TODO values removed. */
  meta?: string;
  /** Unprefixed site path with anchor, e.g. `/academic#master-degree`. Render via `url()`. */
  path: string;
  tint: HighlightTint;
}

export interface EntryPreview {
  /** "Currently" for ongoing entries, "Latest" otherwise. */
  label: string;
  text: string;
}

/** Maximum number of achievements (theses, projects, academic work) on Home. */
const MAX_ACHIEVEMENTS = 2;

type Level = CollectionEntry<'education'>['data']['level'];

const LEVEL_RANK: Record<Level, number> = { phd: 0, master: 1, bachelor: 2, other: 3 };

const DEGREE_KIND: Record<Level, string> = {
  phd: 'Doctorate',
  master: "Master's degree",
  bachelor: "Bachelor's degree",
  other: 'Qualification',
};

const THESIS_KIND: Record<Level, string> = {
  phd: 'Doctoral thesis',
  master: "Master's thesis",
  bachelor: "Bachelor's thesis",
  other: 'Thesis',
};

/** Fallback anchors on /academic when an education entry has no `anchor`. */
const DEGREE_ANCHOR: Record<Level, string> = {
  phd: 'degrees',
  master: 'master-degree',
  bachelor: 'bachelor-degree',
  other: 'qualifications',
};

/** True for a non-empty value that is not a `TODO(ioannis)` placeholder. */
export function known(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== '' && !isTodo(value);
}

/** Join the known parts with " · ". */
function metaLine(...parts: (string | null | undefined)[]): string | undefined {
  const line = parts.filter(known).join(' · ');
  return line || undefined;
}

/** Date range, or undefined while either end is still a placeholder (a half range misleads). */
function knownRange(start?: string | null, end?: string | null): string | undefined {
  return known(start) && known(end) ? formatRange(start, end) : undefined;
}

const featured = <T extends { data: { featured: boolean } }>(entry: T) => entry.data.featured;

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

/** Featured entries for the Home highlights, in display order. */
export async function getHighlights(): Promise<Highlight[]> {
  const [education, experience, certifications, theses, projects, academicWork] = await Promise.all(
    [
      getCollection('education', featured),
      getCollection('experience', featured),
      getCollection('certifications', featured),
      getCollection('theses', featured),
      getCollection('projects', featured),
      getCollection('academicWork', featured),
    ],
  );

  const degrees: Highlight[] = [...education]
    .sort((a, b) => LEVEL_RANK[a.data.level] - LEVEL_RANK[b.data.level] || byOrder(a, b))
    .map(({ id, data }) => ({
      key: `education-${id}`,
      kind: DEGREE_KIND[data.level],
      title: data.degree,
      meta: metaLine(data.institution, knownRange(data.start, data.end)),
      path: `/academic#${data.anchor ?? DEGREE_ANCHOR[data.level]}`,
      tint: 'academic',
    }));

  const roles: Highlight[] = sortByDateDesc(experience, (entry) => entry.data).map(
    ({ id, data }) => ({
      key: `experience-${id}`,
      kind: data.end === 'present' ? 'Current role' : 'Experience',
      title: data.role,
      meta: metaLine(data.organisation, knownRange(data.start, data.end)),
      path: '/work#experience',
      tint: 'work',
    }),
  );

  const certs: Highlight[] = sortByDateDesc(certifications, (entry) => ({
    start: entry.data.date,
    order: entry.data.order,
  })).map(({ id, data }) => ({
    key: `certification-${id}`,
    kind: 'Certification',
    title: data.name,
    meta: metaLine(data.issuer, known(data.date) ? formatDate(data.date) : undefined),
    path: '/work#certifications',
    tint: 'work',
  }));

  const achievements: Highlight[] = [
    ...[...theses]
      .sort((a, b) => LEVEL_RANK[a.data.level] - LEVEL_RANK[b.data.level] || byOrder(a, b))
      .map(({ id, data }): Highlight => ({
        key: `thesis-${id}`,
        kind: THESIS_KIND[data.level],
        title: data.title,
        meta: metaLine(data.institution, known(data.end) ? formatDate(data.end) : undefined),
        path: `/academic#${data.anchor}`,
        tint: 'academic',
      })),
    ...sortByDateDesc(academicWork, (entry) => entry.data).map(({ id, data }): Highlight => ({
      key: `academic-work-${id}`,
      kind: 'Academic project',
      title: data.title,
      meta: metaLine(data.course, data.institution),
      path: '/academic#projects',
      tint: 'academic',
    })),
    ...sortByDateDesc(projects, (entry) => entry.data).map(({ id, data }): Highlight => ({
      key: `project-${id}`,
      kind: 'Project',
      title: data.title,
      meta: metaLine(data.tagline),
      path: '/work#projects',
      tint: 'work',
    })),
  ].slice(0, MAX_ACHIEVEMENTS);

  return [...degrees, ...roles, ...certs, ...achievements];
}

/** Current (or latest) role and degree for the Work / Academic entry cards. */
export async function getEntryPreviews(): Promise<{
  work?: EntryPreview;
  academic?: EntryPreview;
}> {
  const [experience, education] = await Promise.all([
    getCollection('experience'),
    getCollection('education', ({ data }) => data.level !== 'other'),
  ]);

  const role = sortByDateDesc(experience, (entry) => entry.data)[0]?.data;
  const degree = sortByDateDesc(education, (entry) => entry.data)[0]?.data;

  const preview = (
    current: boolean,
    main: string | undefined,
    secondary: string | undefined,
  ): EntryPreview | undefined => {
    if (!known(main)) return undefined;
    return { label: current ? 'Currently' : 'Latest', text: metaLine(main, secondary) ?? main };
  };

  return {
    work: role && preview(role.end === 'present', role.role, role.organisation),
    academic: degree && preview(degree.end === 'present', degree.degree, degree.institution),
  };
}
