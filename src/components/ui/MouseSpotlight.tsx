"use client";

import { useEffect, useRef } from "react";

interface MouseSpotlightProps {
  /** Color of the spotlight (rgba). */
  color?: string;
  /** Radius of the glow in px. */
  size?: number;
  /** Container must be position: relative. */
  className?: string;
}

/**
 * Soft radial glow that follows the cursor inside its parent.
 * Place inside a `position: relative` container.
 */
export default function MouseSpotlight({
  color = "rgba(52, 211, 153, 0.22)",
  size = 520,
  className = "",
}: MouseSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      el.style.opacity = "1";
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ${className}`}
      style={{
        background: `radial-gradient(${size}px circle at var(--mx, -999px) var(--my, -999px), ${color}, transparent 70%)`,
      }}
    />
  );
}
