/**
 * Shared JSON-LD helpers (CLAUDE.md §3 SEO). Every page describes the same `Person`
 * (same `@id`), built from `profile.yaml`; pages add their own extras on top
 * (credentials, occupations, theses …). `TODO(ioannis)` placeholders are always omitted,
 * so structured data never states anything that is not real content.
 */
import { isTodo } from './dates';
import type { Profile } from './profile';
import { absoluteUrl } from './url';

export type Json = Record<string, unknown>;

/** True for real content: non-empty and not a `TODO(ioannis)` placeholder. */
export function isReal(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== '' && !isTodo(value);
}

/** Drop undefined/null values and empty arrays so the output stays minimal. */
export function compact(object: Json): Json {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) =>
        value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0),
    ),
  );
}

/** Stable identifier of the Person node, shared by all pages. */
export function personId(): string {
  return `${absoluteUrl('/')}#person`;
}

/** Identifier of a page's ProfilePage node. */
export function profilePageId(path: string): string {
  return `${absoluteUrl(path)}#profilepage`;
}

/** The Person fields every page agrees on; pages spread extras over the result. */
export function basePerson(profile: Profile): Json {
  return compact({
    '@type': 'Person',
    '@id': personId(),
    name: profile.name,
    url: absoluteUrl('/'),
    description: isReal(profile.headline) ? profile.headline : undefined,
    email: isReal(profile.contact.email) ? `mailto:${profile.contact.email}` : undefined,
    homeLocation: isReal(profile.location)
      ? { '@type': 'Place', name: profile.location }
      : undefined,
    sameAs: profile.socials
      .map((social) => social.url)
      .filter(isReal)
      .map((link) => absoluteUrl(link)),
  });
}

/** Serialise for an inline `<script type="application/ld+json">` (no `</script>` breakout). */
export function serializeJsonLd(data: Json): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
