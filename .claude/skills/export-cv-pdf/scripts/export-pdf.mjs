#!/usr/bin/env node
// Print /work and /academic to PDF with the site's print stylesheet.
// Usage: node export-pdf.mjs [--url http://localhost:4321/] [--pages work|academic|both] [--out public/documents]
import { mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};

const baseUrl = opt('--url', 'http://localhost:4321/').replace(/\/?$/, '/');
const which = opt('--pages', 'both');
const outDir = resolve(opt('--out', 'public/documents'));

const TARGETS = {
  work: { path: 'work/', file: 'ioannis-chrysafis-cv-work.pdf' },
  academic: { path: 'academic/', file: 'ioannis-chrysafis-cv-academic.pdf' },
};
const selected = which === 'both' ? Object.keys(TARGETS) : [which];
for (const key of selected) {
  if (!TARGETS[key]) {
    console.error(`Unknown page "${key}". Use work, academic or both.`);
    process.exit(2);
  }
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
let failed = false;
try {
  const page = await browser.newPage();
  await page.emulateMedia({ media: 'print', reducedMotion: 'reduce', colorScheme: 'light' });
  for (const key of selected) {
    const { path, file } = TARGETS[key];
    const url = new URL(path, baseUrl).href;
    const res = await page.goto(url, { waitUntil: 'networkidle' });
    if (!res || !res.ok()) {
      console.error(`❌ ${url} → HTTP ${res ? res.status() : 'no response'}`);
      failed = true;
      continue;
    }
    await page.evaluate(async () => {
      document.querySelectorAll('details').forEach((d) => (d.open = true));
      document.documentElement.setAttribute('data-theme', 'light');
      await document.fonts.ready;
    });
    const out = join(outDir, file);
    await page.pdf({
      path: out,
      format: 'A4',
      printBackground: false,
      preferCSSPageSize: true,
      margin: { top: '14mm', bottom: '14mm', left: '14mm', right: '14mm' },
    });
    const pdf = readFileSync(out, 'latin1');
    const pages = (pdf.match(/\/Type\s*\/Page[^s]/g) || []).length;
    const todos = (await page.content()).includes('TODO(ioannis)');
    console.log(`✅ ${url} → ${out} (${pages} page${pages === 1 ? '' : 's'})`);
    if (pages > 2) console.log(`⚠️  ${key}: ${pages} pages — aim for 1–2; tighten print styles.`);
    if (todos) console.log(`⚠️  ${key}: page still contains TODO(ioannis) placeholders.`);
  }
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
