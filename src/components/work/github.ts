/**
 * Optional build-time enrichment of project cards with public GitHub metadata
 * (primary language, star count). Runs ONLY while Astro renders the page (build / dev
 * server); nothing is fetched in the browser.
 *
 * Fails gracefully: no network, rate limits (60 req/h unauthenticated), timeouts, private
 * or renamed repos all simply return `undefined` and the card renders without metadata.
 *
 * Environment (optional):
 *   GITHUB_TOKEN   token for a higher rate limit (the default token in GitHub Actions works).
 *                  Only sent to api.github.com, never logged.
 *   GITHUB_META=off  skip all requests (offline or reproducible builds).
 */
import process from 'node:process';

export interface RepoMeta {
  /** Primary language as reported by GitHub, e.g. "Python". */
  language?: string;
  stars: number;
  archived: boolean;
}

const GITHUB_REPO = /^https:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i;
const TIMEOUT_MS = 5000;

/** One request per repository per build, shared by every card that needs it. */
const cache = new Map<string, Promise<RepoMeta | undefined>>();

/** `{ owner, name }` for a plain repository URL (https://github.com/owner/name), else null. */
export function parseGitHubRepo(href: string): { owner: string; name: string } | null {
  const match = GITHUB_REPO.exec(href.trim());
  if (!match?.[1] || !match[2]) return null;
  return { owner: match[1], name: match[2] };
}

export function getRepoMeta(href: string | undefined): Promise<RepoMeta | undefined> {
  if (!href || process.env.GITHUB_META === 'off') return Promise.resolve(undefined);
  const repo = parseGitHubRepo(href);
  if (!repo) return Promise.resolve(undefined);

  const key = `${repo.owner}/${repo.name}`.toLowerCase();
  let pending = cache.get(key);
  if (!pending) {
    pending = fetchRepoMeta(repo.owner, repo.name).catch((error: unknown) => {
      const reason = error instanceof Error ? error.name : 'error';
      console.warn(`[work] GitHub metadata for ${key} unavailable (${reason}); skipped.`);
      return undefined;
    });
    cache.set(key, pending);
  }
  return pending;
}

async function fetchRepoMeta(owner: string, name: string): Promise<RepoMeta | undefined> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'ioannis-chrysafis-website-build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
    { headers, signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  if (!response.ok) {
    console.warn(`[work] GitHub metadata for ${owner}/${name}: HTTP ${response.status}; skipped.`);
    return undefined;
  }

  const json = (await response.json()) as {
    language?: unknown;
    stargazers_count?: unknown;
    archived?: unknown;
  };
  return {
    language: typeof json.language === 'string' && json.language ? json.language : undefined,
    stars: typeof json.stargazers_count === 'number' ? json.stargazers_count : 0,
    archived: json.archived === true,
  };
}
