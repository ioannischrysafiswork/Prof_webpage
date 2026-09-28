#!/usr/bin/env node
// Screenshot the dev-only /og-card/<slug>/ pages to public/og/<slug>.png (1200x630).
// Usage: node og-shots.mjs [--url http://localhost:4321/] [--out public/og] [--slugs home,work,academic]
import { mkdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};

const baseUrl = opt('--url', 'http://localhost:4321/').replace(/\/?$/, '/');
const outDir = resolve(opt('--out', 'public/og'));
const slugs = opt('--slugs', 'home,work,academic').split(',').map((s) => s.trim()).filter(Boolean);

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
let failed = false;
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });
  for (const slug of slugs) {
    const url = new URL(`og-card/${slug}/`, baseUrl).href;
    const res = await page.goto(url, { waitUntil: 'networkidle' });
    if (!res || !res.ok()) {
      console.error(`❌ ${url} → HTTP ${res ? res.status() : 'no response'}`);
      failed = true;
      continue;
    }
    await page.evaluate(() => document.fonts.ready);
    const out = join(outDir, `${slug}.png`);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } });
    const kb = Math.round(statSync(out).size / 1024);
    console.log(`✅ ${url} → ${out} (${kb} KB)`);
    if (kb > 300) console.log(`⚠️  ${slug}.png is ${kb} KB — simplify the card or compress it.`);
  }
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
