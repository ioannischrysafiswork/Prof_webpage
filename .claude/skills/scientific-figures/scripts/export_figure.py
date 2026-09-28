"""Theme-aware SVG export for the website.

Usage:
    from export_figure import use_site_style, save_themed_svg
    use_site_style()
    fig, ax = plt.subplots()
    ...
    save_themed_svg(fig, "src/assets/academic/my-figure.svg")

The saved SVG uses `currentColor` for ink (text, axes, grid) and
`var(--plot-1)` ... `var(--plot-6)` for the series colours, so it follows
the site's light/dark theme when the SVG is inlined in the HTML.
"""
from __future__ import annotations

import io
import re
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

STYLE_PATH = Path(__file__).resolve().parent.parent / "site.mplstyle"

INK = "#111111"
SERIES = ["#1f5fbf", "#d9822b", "#2a9d8f", "#8a4fbf", "#c0392b", "#6b7c93"]


def use_site_style() -> None:
    """Apply the site Matplotlib style."""
    style = STYLE_PATH
    if not style.exists():  # helper copied next to the style file
        style = Path(__file__).resolve().parent / "site.mplstyle"
    plt.style.use(str(style))


def _themeify(svg: str) -> str:
    svg = re.sub(re.escape(INK), "currentColor", svg, flags=re.IGNORECASE)
    for i, colour in enumerate(SERIES, start=1):
        svg = re.sub(re.escape(colour), f"var(--plot-{i})", svg, flags=re.IGNORECASE)
    # drop fixed width/height so the SVG scales with its container
    svg = re.sub(r'(<svg[^>]*?)\s(width|height)="[^"]*"', r"\1", svg, count=1)
    svg = re.sub(r'(<svg[^>]*?)\s(width|height)="[^"]*"', r"\1", svg, count=1)
    # remove XML prolog/doctype so it can be inlined with set:html
    svg = re.sub(r"<\?xml[^>]*\?>\s*", "", svg)
    svg = re.sub(r"<!DOCTYPE[^>]*>\s*", "", svg)
    return svg


def save_themed_svg(fig, path: str | Path, *, close: bool = True) -> Path:
    """Save `fig` as a theme-aware SVG at `path` and return the path."""
    buf = io.StringIO()
    fig.savefig(buf, format="svg", transparent=True)
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(_themeify(buf.getvalue()), encoding="utf-8")
    if close:
        plt.close(fig)
    return out


if __name__ == "__main__":  # quick self-test / demo
    import numpy as np

    use_site_style()
    x = np.linspace(0, 4 * np.pi, 400)
    fig, ax = plt.subplots()
    for k in range(1, 4):
        ax.plot(x, np.exp(-0.1 * k * x) * np.sin(k * x), label=f"$k={k}$")
    ax.set_xlabel(r"$t$ (s)")
    ax.set_ylabel(r"$x(t)$ (m)")
    ax.legend()
    print(save_themed_svg(fig, "demo-figure.svg"))
