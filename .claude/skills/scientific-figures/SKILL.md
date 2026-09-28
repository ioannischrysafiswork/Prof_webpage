---
name: scientific-figures
description: Produce publication-quality, theme-aware SVG figures and plots (from Python/Matplotlib) for theses, simulations and academic work, styled to match the site's fonts and palette and switching automatically between light and dark mode. Use when a plot, simulation result or thesis figure must appear on the site.
argument-hint: "[what to plot] [data file or script]"
---

# Scientific figures for the website

Request: `$ARGUMENTS`

Figures must look like part of the site: same fonts, same palette, transparent
background, and colours that follow the light/dark theme. Only plot **real data or real
results** from Ioannis's work (or clearly label an illustrative demo).

## Tools in this skill

- [site.mplstyle](site.mplstyle) — Matplotlib style matching the design tokens.
- [scripts/export_figure.py](scripts/export_figure.py) — `save_themed_svg(fig, path)`
  saves an SVG whose ink colour becomes `currentColor` and whose series colours become
  CSS variables (`var(--plot-1)` … `var(--plot-6)`), so the figure re-colours with the
  theme when **inlined** in the page.

## Steps

1. Make sure Python has `matplotlib` and `numpy` (`python -m pip install matplotlib numpy`).
2. Put the plotting script in `scripts/figures/<slug>.py` (committed, reproducible) and
   any data in `scripts/figures/data/`.
3. In the script:
   ```python
   import sys; sys.path.insert(0, r"${CLAUDE_SKILL_DIR}/scripts")
   from export_figure import use_site_style, save_themed_svg
   use_site_style()                       # loads site.mplstyle
   fig, ax = plt.subplots(figsize=(6.4, 4.0))
   ...                                    # plot with default colour cycle
   save_themed_svg(fig, "src/assets/academic/<slug>.svg")
   ```
   Copy the two helper files into `scripts/figures/` if the site should not depend on
   the skill folder.
4. Keep figures clean: label axes with units (LaTeX via `$...$`), no chart junk, no
   titles inside the figure (the caption carries the title), ≤ 6 series.
5. Embed with the `Figure` component from `science-visuals` using **inline SVG** (e.g.
   `import svg from '…/fig.svg?raw'` and `set:html`) so `currentColor` and CSS variables
   apply. Provide a caption and meaningful alt/`aria-label`.
6. Ensure the site defines `--plot-1 … --plot-6` in `src/styles/global.css` for both
   themes (ask the `design-system` agent if missing). Check contrast in both themes.
7. Keep each SVG < 200 KB; for dense scatter/field plots use `rasterized=True` on the
   heavy artist or export a PNG/AVIF instead.
