"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

function isActive(current: string, href: string) {
  const normalized = href.replace(/\/$/, "");
  const currentNorm = current.replace(/\/$/, "");
  if (normalized === "") return currentNorm === "";
  return currentNorm === normalized || currentNorm.startsWith(normalized + "/");
}

export default function Header() {
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);

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

  if (hideOnRoute) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 transition-all duration-500">
      <Container>
        <div
          className={[
            "flex items-center justify-between rounded-[28px] border px-4 py-3 backdrop-blur-xl transition-all duration-500 md:px-6",
            scrolled
              ? "mt-3 border-white/[0.1] bg-black/55 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.05)]"
              : "mt-4 border-white/[0.08] bg-black/30 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]",
          ].join(" ")}
        >
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-gradient-to-br from-accent-500/25 to-emerald-500/5 text-lg font-bold tracking-wider text-accent-200">
              AD
              <span
                aria-hidden
                className="absolute inset-0 rounded-xl opacity-60 blur-md bg-accent-500/30"
              />
            </div>
            <div className="hidden min-w-0 sm:block">
              <span className="block font-heading text-[1.05rem] tracking-[0.18em] text-slate-50">
                {SITE_CONFIG.name.toUpperCase()}
              </span>
              <span className="block text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">
                Custom Data Platforms for Residential Homebuilders
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
            <Button href="/contact/" size="sm">
              Book a Discovery Call
            </Button>
          </div>

          <details className="relative md:hidden">
            <summary
              className="list-none rounded-full border border-white/[0.08] bg-white/[0.04] p-2 text-slate-200 [&::-webkit-details-marker]:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </summary>
            <div className="absolute right-0 top-14 z-50 w-[min(92vw,22rem)] panel overflow-hidden p-6">
              <div className="mb-6 border-b border-white/[0.08] pb-5">
                <div className="font-heading text-2xl tracking-[0.12em] text-slate-50">
                  A.D. Homes &amp; Consulting
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Custom data platforms for residential homebuilders.
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
                          ? "bg-accent-500/15 text-accent-100"
                          : "bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]",
                      ].join(" ")}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <Button href="/contact/" className="mt-6 w-full justify-center">
                Book a Discovery Call
              </Button>
            </div>
          </details>
        </div>
      </Container>
    </header>
  );
}
