/**
 * Build-time helpers for inline SVG figures (Figure, PlotEmbed).
 * Input is trusted repository content (e.g. `import svg from './fig.svg?raw'`).
 */

/**
 * Prepare a raw SVG string for inlining: drops the XML prolog, doctype, comments and
 * scripts, and the fixed width/height of the root element (the viewBox keeps the aspect
 * ratio), and marks the graphic as non-focusable. Themed exports from the
 * scientific-figures skill already use `currentColor` and `var(--plot-N)`.
 */
export function prepareSvg(raw: string): string {
  const svg = raw
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .trim();
  return svg.replace(/<svg\b[^>]*>/i, (tag) =>
    tag
      .replace(/\s(width|height)="[^"]*"/g, '')
      .replace(/\s(focusable|aria-hidden)="[^"]*"/g, '')
      .replace(/^<svg/i, '<svg focusable="false" aria-hidden="true"'),
  );
}
