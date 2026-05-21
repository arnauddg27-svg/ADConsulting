"use client";

import { cn } from "@/lib/utils";

type TColorProp = string | string[];

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: TColorProp;
  className?: string;
  children: React.ReactNode;
}

/**
 * Animated shine / glow border.
 *
 * A conic-gradient (sharp + blurred halo) spins behind the card; the card
 * covers the center, leaving the gradient visible only as the border ring,
 * so lit arcs sweep continuously around the edge. Robust and clearly visible
 * cross-browser (no mask-composite), and respects prefers-reduced-motion.
 */
export function ShineBorder({
  borderRadius = 8,
  borderWidth = 2,
  duration = 8,
  color = "#000000",
  className,
  children,
}: ShineBorderProps) {
  const stops = Array.isArray(color) ? color.join(", ") : color;
  const conic = `conic-gradient(from 0deg, #2f5368, ${stops}, #2f5368, ${stops}, #2f5368)`;

  return (
    <div
      className={cn("relative isolate", className)}
      style={{ borderRadius, padding: borderWidth }}
    >
      {/* spinning gradient ring (clipped to the outer rounded rect) */}
      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <div
          className="absolute left-[-50%] top-[-50%] h-[200%] w-[200%] motion-safe:animate-spin"
          style={{ animationDuration: `${duration}s`, background: conic }}
        />
        <div
          className="absolute left-[-50%] top-[-50%] h-[200%] w-[200%] opacity-70 blur-[12px] motion-safe:animate-spin"
          style={{ animationDuration: `${duration}s`, background: conic }}
        />
      </div>

      {/* the card sits on top, covering the center so only the ring shows */}
      <div
        className="relative z-10 overflow-hidden"
        style={{ borderRadius: Math.max(borderRadius - borderWidth, 0) }}
      >
        {children}
      </div>
    </div>
  );
}
