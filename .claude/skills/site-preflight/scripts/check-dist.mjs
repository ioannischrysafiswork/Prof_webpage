#!/usr/bin/env node
// Structural check of the built site in dist/ (no dependencies).
// Usage: node check-dist.mjs [--dist <dir>] [--base </ or /Prof_webpage/>] [--strict]
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const strict = args.includes('--strict');
const dist = resolve(opt('--dist', 'dist'));
const base = opt('--base', process.env.BASE_PATH || '/');

const PAGES = {
  '/': { file: 'index.html', anchors: [] },
  '/work': {
    file: 'work/index.html',
    anchors: ['about', 'experience', 'certifications', 'projects', 'skills'],
  },
  '/academic': {
    file: 'academic/index.html',
    anchors: [
      'about', 'roadmap', 'bachelor-degree', 'master-degree', 'qualifications',
      'bachelor-thesis', 'master-thesis', 'projects',
    ],
  },
};

const errors = [];
const warnings = [];
const err = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

if (!existsSync(dist)) {
  console.error(`❌ ${dist} not found — run "npm run build" first.`);
  process.exit(1);
}

if (!existsSync(join(dist, '404.html'))) err('/404', 'dist/404.html missing');

for (const [route, { file, anchors }] of Object.entries(PAGES)) {
  const path = join(dist, file);
  if (!existsSync(path)) {
    err(route, `missing ${file}`);
    continue;
  }
  const html = readFileSync(path, 'utf8');

  if (!/<html[^>]*\slang=["']en/i.test(html)) err(route, 'missing <html lang="en">');
  if (!/<title>[^<]{3,}<\/title>/i.test(html)) err(route, 'missing or empty <title>');
  if (!/<meta[^>]+name=["']description["'][^>]*content=["'][^"']{20,}/i.test(html) &&
      !/<meta[^>]+content=["'][^"']{20,}["'][^>]*name=["']description["']/i.test(html))
    err(route, 'missing meta description (≥20 chars)');
  if (!/<link[^>]+rel=["']canonical["']/i.test(html)) err(route, 'missing canonical link');
  if (!/<meta[^>]+property=["']og:image["']/i.test(html)) err(route, 'missing og:image');

  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1s !== 1) err(route, `expected exactly one <h1>, found ${h1s}`);

  const hrefs = [...html.matchAll(/<a[^>]+href=["']([^"'#?]*)/gi)].map((m) => m[1]);
  const norm = (h) => h.replace(/\/+$/, '').replace(/\/index\.html$/, '');
  for (const target of ['/work', '/academic']) {
    if (!hrefs.some((h) => norm(h).endsWith(target))) err(route, `no link to ${target}`);
  }
  // Home link = the base path ("/" or e.g. "/Prof_webpage/"), relative or absolute URL
  const homePath = norm(base);
  const isHome = (h) => norm(h.replace(/^https?:\/\/[^/]+/, '')) === homePath;
  if (!hrefs.some(isHome)) err(route, `no link to Home (${base})`);

  for (const id of anchors) {
    if (!new RegExp(`\\sid=["']${id}["']`).test(html)) err(route, `missing anchor #${id}`);
  }

  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\salt=/i.test(t)).length;
  if (noAlt) err(route, `${noAlt} <img> without alt`);

  const todos = (html.match(/TODO\(ioannis\)/g) || []).length;
  if (todos) (strict ? err : warn)(route, `${todos} TODO(ioannis) visible in HTML`);
}

for (const w of warnings) console.log(`⚠️  ${w}`);
for (const e of errors) console.log(`❌ ${e}`);
if (!errors.length) console.log(`✅ dist structure OK (${Object.keys(PAGES).length} pages checked${warnings.length ? `, ${warnings.length} warning(s)` : ''})`);
process.exit(errors.length ? 1 : 0);
