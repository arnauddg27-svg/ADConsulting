"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isDemoRoute, isLightMarketingRoute } from "@/lib/marketingRoutes";

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
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const pathname = usePathname() ?? "/";
  const disableAmbient = isDemoRoute(pathname);
  const isLightMarketing = isLightMarketingRoute(pathname);

  useEffect(() => {
    if (disableAmbient) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    const el = spotlightRef.current;
    if (!el) return;

    const flushPointer = () => {
      const pointer = pointerRef.current;
      if (!pointer) {
        frameRef.current = null;
        return;
      }

      el.style.setProperty("--mx", `${pointer.x}px`);
      el.style.setProperty("--my", `${pointer.y}px`);
      el.style.opacity = "1";
      frameRef.current = null;
    };

    let cleanupPointerListeners: (() => void) | undefined;
    const startPointerTracking = () => {
      const onMove = (e: MouseEvent) => {
        pointerRef.current = { x: e.clientX, y: e.clientY };
        if (frameRef.current === null) {
          frameRef.current = window.requestAnimationFrame(flushPointer);
        }
      };
      const onLeave = () => {
        el.style.opacity = "0";
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);
      cleanupPointerListeners = () => {
        window.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseleave", onLeave);
      };
    };

    const win = window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const hasIdle = typeof win.requestIdleCallback === "function";
    const idleHandle = hasIdle
      ? win.requestIdleCallback!(startPointerTracking, { timeout: 1400 })
      : undefined;
    const fallbackHandle = hasIdle
      ? undefined
      : window.setTimeout(startPointerTracking, 900);

    return () => {
      if (idleHandle !== undefined) win.cancelIdleCallback?.(idleHandle);
      if (fallbackHandle !== undefined) window.clearTimeout(fallbackHandle);
      cleanupPointerListeners?.();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [disableAmbient]);

  if (disableAmbient) return null;

  const spotlightColor = isLightMarketing
    ? "rgba(54, 88, 118, 0.08)"
    : "rgba(52, 211, 153, 0.16)";

  return (
    <>
      {/* Side aurora blobs — fixed to viewport so they continue as you scroll
         past the hero. Lower opacity than the hero's local blobs so they read
         as ambient gloss rather than the main effect. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {isLightMarketing ? (
          <>
            <div
              className="absolute left-[-12%] top-[10%] h-[520px] w-[680px] rounded-full bg-[#6f8fa7]/[0.05] blur-[130px]"
            />
            <div
              className="absolute right-[-10%] top-[38%] h-[500px] w-[620px] rounded-full bg-[#d6e2ea]/[0.12] blur-[135px]"
            />
            <div
              className="absolute left-[42%] bottom-[2%] h-[420px] w-[600px] rounded-full bg-[#17212c]/[0.025] blur-[130px]"
            />
          </>
        ) : (
          <>
            <div
              className="absolute left-[-8%] top-[20%] h-[520px] w-[640px] rounded-full bg-accent-500/[0.07] blur-[120px]"
            />
            <div
              className="absolute right-[-6%] top-[55%] h-[460px] w-[540px] rounded-full bg-cyan-400/[0.06] blur-[110px]"
            />
            <div
              className="absolute left-[40%] bottom-[10%] h-[420px] w-[600px] rounded-full bg-indigo-500/[0.05] blur-[120px]"
            />
          </>
        )}
      </div>

      {/* Cursor-following spotlight — fixed to viewport, uses clientX/Y so it
         tracks the mouse anywhere on the page regardless of scroll. */}
      <div
        ref={spotlightRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-0 transition-opacity duration-300"
        style={{
          background:
            `radial-gradient(620px circle at var(--mx, -999px) var(--my, -999px), ${spotlightColor}, transparent 70%)`,
        }}
      />
    </>
  );
}
