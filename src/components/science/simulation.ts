/**
 * Contract for <SimulationCanvas> modules.
 *
 * A simulation lives in `src/components/science/sims/<name>.ts` and default-exports a
 * factory. It is code-split and only downloaded when its canvas scrolls near the viewport.
 * Only add simulations Ioannis actually worked on (CLAUDE.md §6).
 *
 *   import type { CreateSimulation } from '../simulation';
 *
 *   const create: CreateSimulation = (params) => {
 *     let x = 0;
 *     return {
 *       reset() { x = 0; },
 *       step(dt) { x += dt; },
 *       draw(ctx, { width, height, colors }) {
 *         ctx.clearRect(0, 0, width, height);
 *         ctx.fillStyle = colors.accent;
 *         ctx.fillRect(x % width, height / 2, 4, 4);
 *       },
 *     };
 *   };
 *   export default create;
 */

/** Theme colours resolved from the design tokens (valid canvas fillStyle strings). */
export interface SimColors {
  ink: string;
  muted: string;
  faint: string;
  border: string;
  surface: string;
  accent: string;
  tint: string;
  /** --plot-1 … --plot-6 */
  plot: string[];
}

export interface SimView {
  /** Canvas size in CSS pixels (the context is already scaled for devicePixelRatio). */
  width: number;
  height: number;
  colors: SimColors;
}

export interface Simulation {
  /** Restore the initial state (also called once before the first frame). */
  reset(): void;
  /** Advance by `dt` seconds of wall time (≤ 1/30 s; sub-step internally if needed). */
  step(dt: number): void;
  /** Draw the current state. Must not assume a previous frame (clear first). */
  draw(ctx: CanvasRenderingContext2D, view: SimView): void;
  /** Canvas size changed (CSS pixels). */
  resize?(width: number, height: number): void;
  /** Release resources when the page is left. */
  destroy?(): void;
}

export type SimParams = Record<string, string | number | boolean>;
export type CreateSimulation = (params: SimParams) => Simulation;
export interface SimulationModule {
  default: CreateSimulation;
}

const TOKENS: [keyof Omit<SimColors, 'plot'>, string][] = [
  ['ink', '--color-foreground'],
  ['muted', '--color-muted'],
  ['faint', '--color-faint'],
  ['border', '--color-border-strong'],
  ['surface', '--color-surface'],
  ['accent', '--color-accent'],
  ['tint', '--tint'],
];

/**
 * Resolve design tokens to concrete colours. Tokens use light-dark(), which
 * getPropertyValue() does not resolve, so each one is applied to a probe's `color`.
 */
export function readColors(host: Element): SimColors {
  const probe = document.createElement('span');
  probe.hidden = true;
  host.append(probe);
  const read = (token: string): string => {
    probe.style.color = `var(${token})`;
    return getComputedStyle(probe).color;
  };
  const colors = Object.fromEntries(TOKENS.map(([key, token]) => [key, read(token)]));
  const plot = [1, 2, 3, 4, 5, 6].map((n) => read(`--plot-${n}`));
  probe.remove();
  return { ...(colors as Omit<SimColors, 'plot'>), plot };
}
