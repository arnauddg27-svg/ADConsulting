"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import Container from "@/components/ui/Container";
import TrackedCalendlyLink from "@/components/analytics/TrackedCalendlyLink";
import { liquidActionClass } from "@/lib/buttonStyles";
import { isDemoRoute, isLightMarketingRoute, normalizePathname } from "@/lib/marketingRoutes";

function isActive(current: string, href: string) {
  const normalized = href.replace(/\/$/, "");
  const currentNorm = current.replace(/\/$/, "");
  if (normalized === "") return currentNorm === "";
  return currentNorm === normalized || currentNorm.startsWith(normalized + "/");
}

export default function Header() {
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const frameRef = useRef<number | null>(null);
  const scrolledRef = useRef(false);
  const isHome = normalizePathname(pathname) === "/";
  const isLightMarketing = isLightMarketingRoute(pathname);
  const useRoomierMarketingNav = isLightMarketing && !isHome;
  const tagline = SITE_CONFIG.tagline;

  // /demo is a full sample workspace with its own top bar (Sunshine Homes
  // ShellBar). Hide the site header entirely there so the two chromes
  // don't stack. Fullpage mode also benefits (dashboard is never partly
  // covered by the fixed site header).
  const hideOnRoute = isDemoRoute(pathname);

  useEffect(() => {
    if (hideOnRoute) return undefined;

    const applyScrollState = () => {
      const nextScrolled = window.scrollY > 12;
      if (scrolledRef.current !== nextScrolled) {
        scrolledRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }
      frameRef.current = null;
    };

    const onScroll = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(applyScrollState);
      }
    };

    applyScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [hideOnRoute]);

  if (hideOnRoute) return null;

  const shellClass = isLightMarketing
    ? scrolled
      ? "mt-3 border-[#d9e0e4] bg-white/92 shadow-[0_18px_48px_-32px_rgba(23,33,44,0.3)]"
      : "mt-4 border-[#d9e0e4] bg-white/80 shadow-[0_12px_40px_-28px_rgba(23,33,44,0.22)]"
    : scrolled
      ? "mt-3 border-white/[0.1] bg-black/55 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.05)]"
      : "mt-4 border-white/[0.08] bg-black/30 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]";

  const markClass = isLightMarketing
    ? "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#c9d3da] bg-[#17212c] text-lg font-bold tracking-wider text-white shadow-[0_14px_32px_-22px_rgba(23,33,44,0.86)]"
    : "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-gradient-to-br from-accent-500/25 to-emerald-500/5 text-lg font-bold tracking-wider text-accent-200";

  const navShellClass = isLightMarketing
    ? "flex items-center gap-1 rounded-full border border-[#d9e0e4] bg-[#f7f9fa]/88 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
    : "flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

  const mobileSummaryClass = isLightMarketing
    ? "inline-flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-[#d9e0e4] bg-white text-[#17212c] shadow-[0_10px_28px_-22px_rgba(23,33,44,0.45)] [&::-webkit-details-marker]:hidden"
    : "inline-flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-slate-200 [&::-webkit-details-marker]:hidden";

  const mobilePanelClass = isLightMarketing
    ? "absolute right-0 top-14 z-50 w-[min(92vw,22rem)] overflow-hidden rounded-[1.5rem] border border-[#d9e0e4] bg-white p-6 shadow-[0_24px_70px_-44px_rgba(23,33,44,0.5)]"
    : "absolute right-0 top-14 z-50 w-[min(92vw,22rem)] panel overflow-hidden p-6";

  const lightCtaClass =
    liquidActionClass({
      tone: "primary",
      size: "sm",
      className: "text-center",
    });
  const desktopNavClass = useRoomierMarketingNav
    ? "hidden items-center gap-3 xl:flex"
    : "hidden items-center gap-3 md:flex";
  const mobileMenuClass = useRoomierMarketingNav ? "relative xl:hidden" : "relative md:hidden";

  return (
    <header className="fixed inset-x-0 top-0 z-50 transition-all duration-500">
      <Container>
        <div
          className={[
            "flex min-w-0 items-center justify-between gap-3 rounded-[28px] border px-4 py-3 backdrop-blur-xl transition-all duration-500 md:px-6",
            shellClass,
          ].join(" ")}
        >
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className={markClass}>
              AD
              {!isLightMarketing ? (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-xl bg-accent-500/30 opacity-60 blur-md"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <span
                className={[
                  "block max-w-[10.5rem] truncate font-heading text-[0.9rem] tracking-[0.12em] sm:max-w-none sm:text-[1.05rem] sm:tracking-[0.18em]",
                  isLightMarketing ? "text-[#17212c]" : "text-slate-50",
                ].join(" ")}
              >
                {SITE_CONFIG.name.toUpperCase()}
              </span>
              <span
                className={[
                  "hidden text-[0.62rem] uppercase tracking-[0.24em] sm:block",
                  isLightMarketing ? "text-[#69737b]" : "text-slate-400",
                ].join(" ")}
              >
                {tagline}
              </span>
            </div>
          </Link>

          <div className={desktopNavClass}>
            <nav className={navShellClass}>
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={[
                      "relative rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-all",
                      active
                        ? isLightMarketing
                          ? "bg-[#e8eef2] text-[#243f52] shadow-[inset_0_0_0_1px_rgba(53,95,122,0.13)]"
                          : "bg-accent-500/15 text-accent-100 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]"
                        : isLightMarketing
                          ? "text-[#58636b] hover:bg-white hover:text-[#17212c]"
                          : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-50",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            {isLightMarketing ? (
              <TrackedCalendlyLink source="header_cta" className={lightCtaClass}>
                <span>Book a Discovery Call</span>
              </TrackedCalendlyLink>
            ) : (
              <TrackedCalendlyLink
                source="header_cta"
                className={liquidActionClass({ tone: "primary", size: "sm" })}
              >
                <span>Book a Discovery Call</span>
              </TrackedCalendlyLink>
            )}
          </div>

          <details key={pathname} className={mobileMenuClass}>
            <summary
              className={mobileSummaryClass}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </summary>
            <div className={mobilePanelClass}>
              <div
                className={[
                  "mb-6 border-b pb-5",
                    isLightMarketing ? "border-[#dfe5e8]" : "border-white/[0.08]",
                ].join(" ")}
              >
                <div
                  className={[
                    "font-heading text-2xl tracking-[0.12em]",
                    isLightMarketing ? "text-[#17212c]" : "text-slate-50",
                  ].join(" ")}
                >
                  {SITE_CONFIG.name}
                </div>
                <p
                  className={[
                    "mt-2 text-sm leading-6",
                    isLightMarketing ? "text-[#58636b]" : "text-slate-300",
                  ].join(" ")}
                >
                  Builder operating reports for schedule, budget, margin, and accountability.
                </p>
              </div>
              <nav className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => {
                  const active = isActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={[
                        "rounded-[1.25rem] px-4 py-4 text-sm font-semibold uppercase tracking-[0.16em] transition-all",
                        active
                          ? isLightMarketing
                            ? "bg-[#e8eef2] text-[#243f52]"
                            : "bg-accent-500/15 text-accent-100"
                          : isLightMarketing
                            ? "bg-[#f7f9fa] text-[#4f5d64] hover:bg-[#eef2f4] hover:text-[#17212c]"
                            : "bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]",
                      ].join(" ")}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              {isLightMarketing ? (
                <TrackedCalendlyLink
                  source="mobile_menu_cta"
                  className={`${lightCtaClass} mt-6 w-full`}
                >
                  <span>Book a Discovery Call</span>
                </TrackedCalendlyLink>
              ) : (
                <TrackedCalendlyLink
                  source="mobile_menu_cta"
                  className={liquidActionClass({ tone: "primary", size: "md", className: "mt-6 w-full justify-center" })}
                >
                  <span>Book a Discovery Call</span>
                </TrackedCalendlyLink>
              )}
            </div>
          </details>
        </div>
      </Container>
    </header>
  );
}
