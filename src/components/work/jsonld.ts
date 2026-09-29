/**
 * JSON-LD for /work: a schema.org `ProfilePage` whose main entity is the `Person`, with
 * current roles (`hasOccupation`, `worksFor`), certifications (`hasCredential`) and
 * skills (`knowsAbout`). Built only from content collections; placeholders are omitted,
 * so the markup never states anything that is not in the content files.
 *
 * NOTE: page-local on purpose (file ownership). The Person part should move to a shared
 * `src/lib/jsonld.ts` so Home and Academic describe the same Person (same `@id`).
 */
import type { CollectionEntry } from 'astro:content';
import { parseDate, toDateTimeAttr } from '@/lib/dates';
import type { Profile } from '@/lib/profile';
import { absoluteUrl } from '@/lib/url';
import { hasValue } from './links';

type Json = Record<string, unknown>;

interface WorkJsonLdInput {
  profile: Profile;
  /** Site path of the page, e.g. '/work'. */
  path: string;
  title: string;
  description: string;
  experience: readonly CollectionEntry<'experience'>[];
  certifications: readonly CollectionEntry<'certifications'>[];
  skills: readonly CollectionEntry<'skills'>[];
}

/** Drop undefined values and empty arrays so the output stays minimal. */
function compact(object: Json): Json {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined && !(Array.isArray(value) && value.length === 0),
    ),
  );
}

/** Absolute URL for a content link, or undefined for placeholders. */
function linkUrl(value: string | undefined): string | undefined {
  return hasValue(value) ? absoluteUrl(value) : undefined;
}

/** Shared identifier of the Person node across pages. */
export function personId(): string {
  return `${absoluteUrl('/')}#person`;
}

export function workJsonLd(input: WorkJsonLdInput): Json {
  const { profile, path, title, description, experience, certifications, skills } = input;

  const current = experience.filter(
    ({ data }) =>
      parseDate(data.end).kind === 'present' && hasValue(data.role) && hasValue(data.organisation),
  );

  const organisations = new Map<string, Json>();
  for (const { data } of current) {
    if (organisations.has(data.organisation)) continue;
    organisations.set(
      data.organisation,
      compact({
        '@type': 'Organization',
        name: data.organisation,
        url: linkUrl(data.links.website),
      }),
    );
  }

  const occupations = current.map(({ data }) =>
    compact({
      '@type': 'Occupation',
      name: data.role,
      occupationLocation: hasValue(data.location)
        ? { '@type': 'Place', name: data.location }
        : undefined,
      skills: data.tech.filter(hasValue).join(', ') || undefined,
    }),
  );

  const credentials = certifications
    .filter(({ data }) => hasValue(data.name) && hasValue(data.issuer))
    .map(({ data }) =>
      compact({
        '@type': 'EducationalOccupationalCredential',
        name: data.name,
        credentialCategory: 'certification',
        recognizedBy: { '@type': 'Organization', name: data.issuer },
        dateCreated: toDateTimeAttr(data.date),
        expires: toDateTimeAttr(data.expires ?? undefined),
        identifier: hasValue(data.credentialId) ? data.credentialId : undefined,
        url: linkUrl(data.links.credential),
      }),
    );

  const knowsAbout = [
    ...new Set(skills.flatMap(({ data }) => data.items.map((item) => item.name)).filter(hasValue)),
  ];

  const sameAs = profile.socials.map((social) => linkUrl(social.url)).filter(hasValue);
  const email = hasValue(profile.contact.email) ? `mailto:${profile.contact.email}` : undefined;
  const firstRole = current[0]?.data.role;

  const person = compact({
    '@type': 'Person',
    '@id': personId(),
    name: profile.name,
    url: absoluteUrl('/'),
    jobTitle: firstRole,
    email,
    homeLocation: hasValue(profile.location)
      ? { '@type': 'Place', name: profile.location }
      : undefined,
    sameAs,
    worksFor: [...organisations.values()],
    hasOccupation: occupations,
    hasCredential: credentials,
    knowsAbout,
  });

  const pageUrl = absoluteUrl(path);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${pageUrl}#profilepage`,
    url: pageUrl,
    name: title,
    description,
    inLanguage: 'en',
    mainEntity: person,
  };
}

/** Serialise for an inline <script type="application/ld+json"> (no `</script>` breakout). */
export function serializeJsonLd(data: Json): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
