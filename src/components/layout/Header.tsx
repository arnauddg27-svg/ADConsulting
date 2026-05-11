"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import Container from "@/components/ui/Container";
import TrackedCalendlyLink from "@/components/analytics/TrackedCalendlyLink";

function isActive(current: string, href: string) {
  const normalized = href.replace(/\/$/, "");
  const currentNorm = current.replace(/\/$/, "");
  if (normalized === "") return currentNorm === "";
  return currentNorm === normalized || currentNorm.startsWith(normalized + "/");
}

export default function Header() {
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // /demo is a full product showcase with its own top bar (Sunshine Homes
  // ShellBar). Hide the site header entirely there so the two chromes
  // don't stack. Fullpage mode also benefits (dashboard is never partly
  // covered by the fixed site header).
  const hideOnRoute =
    pathname === "/demo" || pathname.startsWith("/demo/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  if (hideOnRoute) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 transition-all duration-500">
      <Container>
        <div
          className={[
            "flex items-center justify-between rounded-[28px] border px-4 py-3 backdrop-blur-xl transition-all duration-500 md:px-6",
            scrolled
              ? "mt-3 border-white/[0.12] bg-black/75 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.05)]"
              : "mt-4 border-white/[0.1] bg-black/45 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]",
          ].join(" ")}
        >
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-gradient-to-br from-accent-500/25 to-emerald-500/5 text-lg font-bold tracking-wider text-accent-200">
              AD
              <span
                aria-hidden
                className="absolute inset-0 rounded-xl opacity-60 blur-md bg-accent-500/30"
              />
            </div>
            <div className="min-w-0">
              <span className="block whitespace-nowrap font-heading text-[0.78rem] tracking-[0.1em] text-slate-50 sm:text-[1.05rem] sm:tracking-[0.18em]">
                {SITE_CONFIG.name.toUpperCase()}
              </span>
              <span className="hidden text-[0.62rem] uppercase tracking-[0.24em] text-slate-400 sm:block">
                Custom Data Platforms for Residential Builders & Developers
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <nav className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={[
                      "relative rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-all",
                      active
                        ? "bg-accent-500/15 text-accent-100 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]"
                        : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-50",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <TrackedCalendlyLink
              source="header_cta"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-accent-500 bg-accent-500 px-4 py-2.5 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_40px_-20px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-[0_24px_50px_-16px_rgba(16,185,129,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
            >
              Book a Discovery Call
            </TrackedCalendlyLink>
          </div>

          <div className="relative md:hidden">
            <button
              type="button"
              className="relative z-[70] rounded-full border border-white/[0.12] bg-white/[0.06] p-2 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/50"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {menuOpen && (
              <div className="fixed inset-0 z-[60] md:hidden" aria-hidden="true" onClick={() => setMenuOpen(false)}>
                <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md" />
              </div>
            )}

            {menuOpen && (
              <div className="fixed left-5 right-5 top-24 z-[80] max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[28px] border border-white/[0.12] bg-[#080d17] p-5 shadow-[0_28px_90px_-28px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.06)] sm:left-auto sm:right-6 sm:w-[22rem]">
                <div className="mb-5 border-b border-white/[0.08] pb-5">
                  <div className="font-heading text-xl tracking-[0.12em] text-slate-50">
                    AD ERP SYSTEMS
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Custom data platforms for residential builders and developers.
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
                          "rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-all",
                          active
                            ? "border border-accent-400/25 bg-accent-500/15 text-accent-100"
                            : "border border-white/[0.06] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]",
                        ].join(" ")}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
                <TrackedCalendlyLink
                  source="mobile_menu_cta"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent-500 bg-accent-500 px-5 py-3.5 text-center text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_40px_-20px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-[0_24px_50px_-16px_rgba(16,185,129,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
                >
                  Book a Discovery Call
                </TrackedCalendlyLink>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
