"use client";

import { useEffect, useRef } from "react";

/**
 * Page-wide ambient layer:
 *   - Fixed mouse spotlight that follows the cursor across the entire viewport
 *     (uses clientX/Y so it works regardless of scroll position).
 *   - Side aurora blobs anchored to the viewport so the gloss continues as
 *     the user scrolls past the hero.
 *
 * Mount once at the root layout. All layers are pointer-events-none and
 * `fixed` so they don't shift the document or block interaction.
 */
export default function PageAmbient() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      el.style.setProperty("--mx", `${e.clientX}px`);
      el.style.setProperty("--my", `${e.clientY}px`);
      el.style.opacity = "1";
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      {/* Side aurora blobs — fixed to viewport so they continue as you scroll
         past the hero. Lower opacity than the hero's local blobs so they read
         as ambient gloss rather than the main effect. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute left-[-8%] top-[20%] h-[520px] w-[640px] rounded-full bg-accent-500/[0.07] blur-[120px]"
          style={{ animation: "var(--animate-aurora)" }}
        />
        <div
          className="absolute right-[-6%] top-[55%] h-[460px] w-[540px] rounded-full bg-cyan-400/[0.06] blur-[110px]"
          style={{
            animation: "var(--animate-aurora)",
            animationDelay: "-8s",
          }}
        />
        <div
          className="absolute left-[40%] bottom-[10%] h-[420px] w-[600px] rounded-full bg-indigo-500/[0.05] blur-[120px]"
          style={{ animation: "var(--animate-gradient-shift)" }}
        />
      </div>

      {/* Cursor-following spotlight — fixed to viewport, uses clientX/Y so it
         tracks the mouse anywhere on the page regardless of scroll. */}
      <div
        ref={spotlightRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(620px circle at var(--mx, -999px) var(--my, -999px), rgba(52, 211, 153, 0.16), transparent 70%)",
        }}
      />
    </>
  );
}
