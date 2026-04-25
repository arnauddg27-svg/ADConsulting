"use client";

import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

/**
 * Aceternity / 21st.dev aurora background, brand-adapted.
 *
 * Two exports:
 *   - <AuroraBackground/> — full hero-style wrapper (centers children, full
 *     viewport bg).
 *   - <AuroraGloss/>      — just the animated gradient layer as a positioned
 *     `absolute inset-0` overlay. Drop into any `relative` parent to add a
 *     subtle "light gloss" sheen behind content.
 *
 * Brand palette: emerald / cyan / teal (replaces the original blue / indigo
 * / violet) so it harmonizes with the rest of the site's accent.
 */

const auroraLayer = `
  [--surface-gradient:repeating-linear-gradient(100deg,#0b1120_0%,#0b1120_7%,transparent_10%,transparent_12%,#0b1120_16%)]
  [--aurora:repeating-linear-gradient(100deg,#10b981_10%,#22d3ee_15%,#34d399_20%,#a7f3d0_25%,#0ea5e9_30%)]
  [background-image:var(--surface-gradient),var(--aurora)]
  [background-size:300%,_200%]
  [background-position:50%_50%,50%_50%]
  filter blur-[10px]
  after:content-[""] after:absolute after:inset-0
  after:[background-image:var(--surface-gradient),var(--aurora)]
  after:[background-size:200%,_100%]
  after:[animation:aurora-shift_60s_linear_infinite]
  after:[background-attachment:fixed]
  after:mix-blend-difference
  pointer-events-none
  absolute -inset-[10px] will-change-transform
`;

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center bg-zinc-900 text-slate-50 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              auroraLayer,
              "opacity-50",
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
            )}
          />
        </div>
        {children}
      </div>
    </main>
  );
};

interface AuroraGlossProps {
  /** Tailwind classes for opacity / position / blend overrides. */
  className?: string;
  /** Apply a radial mask so the gloss fades out toward the edges. Default true. */
  radialMask?: boolean;
}

/**
 * Drop-in absolute layer for adding a subtle aurora sheen to any container.
 * Parent must be `relative`. Defaults are tuned for "light gloss" — opacity
 * is intentionally low so the sheen stays subtle.
 */
export const AuroraGloss = ({
  className,
  radialMask = true,
}: AuroraGlossProps) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className={cn(
          auroraLayer,
          "opacity-25",
          radialMask &&
            `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`,
          className
        )}
      />
    </div>
  );
};

export default AuroraBackground;
