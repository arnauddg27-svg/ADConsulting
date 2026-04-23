"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Max rotation in degrees. */
  maxTilt?: number;
  /** Scale on hover. */
  scale?: number;
}

/**
 * 3D tilt wrapper that tracks cursor inside the element.
 * Lightweight — no rAF, just transform on mousemove with smooth transition.
 */
export default function TiltCard({
  children,
  className = "",
  style,
  maxTilt = 6,
  scale = 1.01,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = -py * maxTilt;
    const ry = px * maxTilt;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
    el.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(py + 0.5) * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
