"use client";

import { createContext, useContext } from "react";

/**
 * Palette-aware chart ramps for the shadcn test skin.
 *
 * Charts hardcode their series colors as JS hex (used in inline styles, SVG
 * gradient stops, and `${color}33` alpha appends), so they can't be reskinned
 * with CSS alone. This context lets the active palette swap the ramp.
 *
 * Crucially, `useChartRamp(original)` returns the component's ORIGINAL colors
 * verbatim when no palette is active — so the live /demo (which never sets a
 * palette) is byte-for-byte unchanged. Only the /demo-shadcn test route, which
 * provides a palette key, gets a swapped ramp.
 */

export type ChartPalette =
  | "slate"
  | "carbon"
  | "indigo"
  | "vivid"
  | "mono";

export const ChartPaletteContext = createContext<ChartPalette | undefined>(
  undefined,
);

// Recognized, battle-tested categorical schemes — research-backed rather than
// hand-picked. Good categorical palettes deliberately mix warm + cool hues
// (per IBM Carbon, Tableau, AWS Cloudscape's "blue/pink/teal/purple/orange"),
// which is what reads as a designed palette instead of one color in tints.
// Hues are tuned to stay legible on the dark dashboard surface.
const RAMPS: Record<ChartPalette, string[]> = {
  // Slate → Tableau 10, the de-facto data-viz standard (Maureen Stone),
  // brightened a touch for dark backgrounds.
  slate: ["#6a9bd8", "#f28e2b", "#5bb85b", "#e15759", "#56c4c4", "#edc948", "#bf83b3", "#ff9da7"],
  // Carbon → IBM Carbon categorical — enterprise, accessibility-checked.
  carbon: ["#8a3ffc", "#33b1ff", "#08bdba", "#ff7eb6", "#fa4d56", "#6fdc8c", "#d4bbff", "#fdd13a"],
  // Indigo bg → D3 / Tableau "Category 10" (classic varied), brightened for dark.
  indigo: ["#5b9bd5", "#ff8c42", "#5cc15c", "#e8595b", "#a98ede", "#4ec9c0", "#ef85cf", "#e6c84a"],
  // Vivid → bright modern categorical ("retro metro"), leads cool, pops on dark.
  vivid: ["#27aeef", "#b33dc6", "#87bc45", "#ef9b20", "#f46a9b", "#bdcf32", "#ea5545", "#ede15b"],
  // Mono → neutral grays, the minimal option.
  mono: ["#a1a1aa", "#71717a", "#d4d4d8", "#52525b", "#8b8b92", "#e4e4e7"],
};

/** Take `n` colors from a categorical scheme, cycling if there are more. */
function pick(scheme: string[], n: number): string[] {
  return Array.from({ length: n }, (_, i) => scheme[i % scheme.length]);
}

/**
 * Returns chart series colors. With no active palette (live /demo) the original
 * colors are returned unchanged; with a palette, a same-length set drawn from
 * the categorical scheme (in order) is returned.
 */
export function useChartRamp(original: string[]): string[] {
  const palette = useContext(ChartPaletteContext);
  if (!palette || !RAMPS[palette]) return original;
  return pick(RAMPS[palette], original.length);
}

/** `n` categorical colors for the active palette, or null on the live /demo. */
export function usePaletteColors(n: number): string[] | null {
  const palette = useContext(ChartPaletteContext);
  if (!palette || !RAMPS[palette]) return null;
  return pick(RAMPS[palette], n);
}

/** Single accent-ish chart color for a given length-1 need. */
export function useChartColor(original: string): string {
  return useChartRamp([original])[0];
}

/** "#rrggbb" → "rgba(r,g,b,a)" (for glows / soft fills built from ramp hex). */
export function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
