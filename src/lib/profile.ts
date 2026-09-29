import { getEntry, type CollectionEntry } from 'astro:content';

export type Profile = CollectionEntry<'profile'>['data'];

/** Load `src/content/profile.yaml`. Fails the build loudly if it is missing. */
export async function getProfile(): Promise<Profile> {
  const entry = await getEntry('profile', 'profile');
  if (!entry) throw new Error('Missing src/content/profile.yaml (profile collection).');
  return entry.data;
}
