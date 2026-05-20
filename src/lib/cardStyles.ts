import { clsx, type ClassValue } from "clsx";

/**
 * Shared "refined glass" card surfaces for the light blueprint theme.
 *
 * The look adapts a liquid-glass treatment to a light background:
 * - a layered white -> cool-tint diagonal gradient fill
 * - a crisp inner top highlight (the glass edge catching light)
 * - backdrop blur + saturation so the blueprint grid reads faintly through
 * - a layered shadow (tight contact + soft deep) for real depth
 *
 * NOTE: the project's `cn` is plain clsx (no tailwind-merge), so these
 * helpers OWN the surface utilities (rounded / border / bg / shadow /
 * backdrop). Call sites should pass only layout + spacing classes via
 * `className` and must not re-declare a conflicting radius/border/bg/shadow.
 */

const PANEL_BASE =
  "relative min-w-0 rounded-[1.5rem] border border-[#d4dee4] " +
  "bg-gradient-to-br from-white/95 via-white/88 to-[#eef4f7]/80 " +
  "backdrop-blur-xl backdrop-saturate-[140%] " +
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.92),0_2px_4px_-2px_rgba(23,33,44,0.06),0_30px_70px_-44px_rgba(23,33,44,0.42)]";

const TILE_BASE =
  "relative rounded-xl border border-[#dbe3e8] " +
  "bg-gradient-to-br from-white/92 to-[#f1f6f8]/82 " +
  "backdrop-blur-md " +
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_12px_26px_-20px_rgba(23,33,44,0.4)]";

const TILE_INTERACTIVE =
  "transition-[transform,box-shadow,border-color] duration-300 " +
  "hover:-translate-y-0.5 hover:border-[#c6d3da] " +
  "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.96),0_20px_40px_-22px_rgba(23,33,44,0.46)]";

/** Primary glass surface for large content cards (BlueprintPanel et al.). */
export function glassPanelClass(...className: ClassValue[]) {
  return clsx(PANEL_BASE, className);
}

/** Lighter glass surface for small inline tiles / list items. */
export function glassTileClass({
  interactive = false,
  className,
}: { interactive?: boolean; className?: ClassValue } = {}) {
  return clsx(TILE_BASE, interactive && TILE_INTERACTIVE, className);
}
