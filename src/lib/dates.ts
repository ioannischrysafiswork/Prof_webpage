/**
 * Date helpers for CV content (CLAUDE.md §6).
 *
 * Content stores dates as ISO strings: `YYYY-MM` (preferred) or `YYYY` (year only).
 * End dates of current roles use `present`. While data is missing, a date may be a
 * `TODO(ioannis): …` placeholder; every helper here handles that gracefully:
 * formatting returns the placeholder text unchanged (so it stays visible in drafts)
 * and sorting puts placeholders last.
 */

export const PRESENT = 'present';

/** Fixed English month abbreviations (Intl's en-GB would give "Sept"). */
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export type ParsedDate =
  | { kind: 'month'; year: number; month: number } // month: 1–12
  | { kind: 'year'; year: number }
  | { kind: 'present' }
  | { kind: 'unknown'; raw: string }; // TODO placeholder or malformed value

const ISO_MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;
const ISO_YEAR = /^(\d{4})$/;

/** True for `TODO(ioannis): …` placeholder strings. */
export function isTodo(value: unknown): boolean {
  return typeof value === 'string' && value.trim().startsWith('TODO(ioannis)');
}

/** Parse `YYYY-MM`, `YYYY` or `present` (case-insensitive). Anything else is `unknown`. */
export function parseDate(value: string | null | undefined): ParsedDate {
  const raw = (value ?? '').trim();
  if (raw.toLowerCase() === PRESENT) return { kind: 'present' };
  const month = ISO_MONTH.exec(raw);
  if (month) return { kind: 'month', year: Number(month[1]), month: Number(month[2]) };
  const year = ISO_YEAR.exec(raw);
  if (year) return { kind: 'year', year: Number(year[1]) };
  return { kind: 'unknown', raw };
}

/**
 * Format for display: `2024-03` -> `Mar 2024`, `2024` -> `2024`, `present` -> `Present`.
 * Placeholders / malformed values are returned unchanged.
 */
export function formatDate(value: string | null | undefined): string {
  const date = parseDate(value);
  switch (date.kind) {
    case 'month':
      return `${MONTHS[date.month - 1]} ${date.year}`;
    case 'year':
      return String(date.year);
    case 'present':
      return 'Present';
    default:
      return date.raw;
  }
}

/** Machine-readable value for `<time datetime="…">`, or `undefined` if not applicable. */
export function toDateTimeAttr(value: string | null | undefined): string | undefined {
  const date = parseDate(value);
  if (date.kind === 'month') return `${date.year}-${String(date.month).padStart(2, '0')}`;
  if (date.kind === 'year') return String(date.year);
  return undefined;
}

/** `Mar 2024 – Present`; a single date if start and end format identically or end is missing. */
export function formatRange(start: string | null | undefined, end?: string | null): string {
  const from = formatDate(start);
  if (end === undefined || end === null || end === '') return from;
  const to = formatDate(end);
  return from === to ? from : `${from} – ${to}`;
}

/**
 * Month index (year * 12 + month0) for arithmetic and sorting.
 * `edge` decides where a year-only date falls: 'start' -> January, 'end' -> December.
 * `present` resolves to `now`. Returns `null` for unknown values.
 */
export function toMonthIndex(
  value: string | null | undefined,
  edge: 'start' | 'end' = 'start',
  now: Date = new Date(),
): number | null {
  const date = parseDate(value);
  switch (date.kind) {
    case 'month':
      return date.year * 12 + (date.month - 1);
    case 'year':
      return date.year * 12 + (edge === 'start' ? 0 : 11);
    case 'present':
      return now.getFullYear() * 12 + now.getMonth();
    default:
      return null;
  }
}

export interface Duration {
  years: number;
  months: number;
  totalMonths: number;
}

/**
 * Inclusive duration between two dates (Jan–Mar = 3 months, LinkedIn-style).
 * Missing `end` means `present`. Returns `null` if either date is unknown or end < start.
 */
export function duration(
  start: string | null | undefined,
  end: string | null | undefined = PRESENT,
  now: Date = new Date(),
): Duration | null {
  const from = toMonthIndex(start, 'start', now);
  const to = toMonthIndex(end || PRESENT, 'end', now);
  if (from === null || to === null || to < from) return null;
  const totalMonths = to - from + 1;
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12, totalMonths };
}

/** `1 yr 3 mos`, `8 mos`, `2 yrs`. Empty string when the duration cannot be computed. */
export function formatDuration(
  start: string | null | undefined,
  end: string | null | undefined = PRESENT,
  now: Date = new Date(),
): string {
  const d = duration(start, end, now);
  if (!d) return '';
  const parts: string[] = [];
  if (d.years) parts.push(`${d.years} ${d.years === 1 ? 'yr' : 'yrs'}`);
  if (d.months) parts.push(`${d.months} ${d.months === 1 ? 'mo' : 'mos'}`);
  return parts.join(' ');
}

/** Anything with an ISO start and optional end, e.g. a collection entry's `data`. */
export interface Dated {
  start?: string | null;
  end?: string | null;
}

/**
 * Comparator for reverse-chronological order: ongoing (`present`) first, then by end
 * date (latest first), then by start date (latest first). Unknown dates sort last.
 */
export function compareByDateDesc(a: Dated, b: Dated, now: Date = new Date()): number {
  const key = (item: Dated): [number, number] => {
    const start = toMonthIndex(item.start, 'start', now);
    const endValue = item.end ?? item.start;
    const end = toMonthIndex(endValue, 'end', now);
    const ongoing = parseDate(item.end).kind === 'present';
    const NEG = Number.NEGATIVE_INFINITY;
    // An unknown (TODO) end falls back to the start, so the entry still sorts by when it began.
    return [ongoing ? Number.POSITIVE_INFINITY : (end ?? start ?? NEG), start ?? NEG];
  };
  const [aEnd, aStart] = key(a);
  const [bEnd, bStart] = key(b);
  if (aEnd !== bEnd) return bEnd > aEnd ? 1 : -1;
  if (aStart !== bStart) return bStart > aStart ? 1 : -1;
  return 0;
}

/**
 * Sort items reverse-chronologically (newest first) without mutating the input.
 * `pick` maps an item to its dates, e.g. `(entry) => entry.data`.
 * Ties are broken by an optional numeric `order` (ascending).
 */
export function sortByDateDesc<T>(
  items: readonly T[],
  pick: (item: T) => Dated & { order?: number } = (item) => item as Dated,
  now: Date = new Date(),
): T[] {
  return [...items].sort((a, b) => {
    const da = pick(a);
    const db = pick(b);
    return compareByDateDesc(da, db, now) || (da.order ?? 0) - (db.order ?? 0);
  });
}

/**
 * Chronological order (oldest first), e.g. for the academic roadmap: by start date,
 * then by end date (ongoing last). Unknown dates sort last. Ties use `order` (ascending).
 */
export function sortByDateAsc<T>(
  items: readonly T[],
  pick: (item: T) => Dated & { order?: number } = (item) => item as Dated,
  now: Date = new Date(),
): T[] {
  const INF = Number.POSITIVE_INFINITY;
  const key = (item: Dated): [number, number] => {
    const start = toMonthIndex(item.start, 'start', now) ?? INF;
    const end =
      parseDate(item.end).kind === 'present'
        ? Number.MAX_SAFE_INTEGER // ongoing: after any finished item, before unknowns
        : (toMonthIndex(item.end ?? item.start, 'end', now) ?? INF);
    return [start, end];
  };
  return [...items].sort((a, b) => {
    const da = pick(a);
    const db = pick(b);
    const [aStart, aEnd] = key(da);
    const [bStart, bEnd] = key(db);
    if (aStart !== bStart) return aStart < bStart ? -1 : 1;
    if (aEnd !== bEnd) return aEnd < bEnd ? -1 : 1;
    return (da.order ?? 0) - (db.order ?? 0);
  });
}
