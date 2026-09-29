/**
 * Site-wide behaviour, loaded once by BaseLayout (a bundled module script).
 * Uses event delegation on `document`, so it keeps working across Astro <ClientRouter />
 * page swaps without re-binding. State is re-synced on `astro:page-load`.
 *
 * - Theme toggle: [data-theme-toggle] buttons (aria-pressed = dark on), persisted in
 *   localStorage (try/catch). The initial theme is set by ThemeScript.astro in <head>.
 * - Mobile menu: [data-nav] with [data-nav-toggle] (aria-expanded). Escape closes and
 *   returns focus; clicking outside closes.
 * - Print: all <details> are opened before printing and restored afterwards.
 */

const THEME_KEY = 'theme';
type Theme = 'light' | 'dark';

const root = (): HTMLElement => document.documentElement;
const currentTheme = (): Theme => (root().dataset.theme === 'dark' ? 'dark' : 'light');

function syncThemeToggles(): void {
  const pressed = String(currentTheme() === 'dark');
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', pressed);
  });
}

function setTheme(theme: Theme): void {
  root().dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage unavailable: the choice lasts for this page view only */
  }
  syncThemeToggles();
}

function setMenu(nav: HTMLElement, open: boolean): void {
  nav.dataset.open = String(open);
  nav.querySelector('[data-nav-toggle]')?.setAttribute('aria-expanded', String(open));
}

function openMenu(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-nav][data-open="true"]');
}

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  if (target.closest('[data-theme-toggle]')) {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    return;
  }

  const toggle = target.closest<HTMLElement>('[data-nav-toggle]');
  const nav = toggle?.closest<HTMLElement>('[data-nav]');
  if (toggle && nav) {
    setMenu(nav, nav.dataset.open !== 'true');
    return;
  }

  const open = openMenu();
  if (open && (!open.contains(target) || target.closest('a'))) setMenu(open, false);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const open = openMenu();
  if (!open) return;
  setMenu(open, false);
  open.querySelector<HTMLElement>('[data-nav-toggle]')?.focus();
});

// Sync now (the first astro:page-load can fire before this module runs) and after swaps.
syncThemeToggles();
document.addEventListener('astro:page-load', syncThemeToggles);
document.addEventListener('site:themechange', syncThemeToggles);

/* Print expanded: open every closed <details>, restore after printing. */
const openedForPrint = new Set<HTMLDetailsElement>();
window.addEventListener('beforeprint', () => {
  document.querySelectorAll<HTMLDetailsElement>('details:not([open])').forEach((details) => {
    details.open = true;
    openedForPrint.add(details);
  });
});
window.addEventListener('afterprint', () => {
  openedForPrint.forEach((details) => (details.open = false));
  openedForPrint.clear();
});
