"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <Container>
          <div
            className={clsx(
              "mt-4 flex items-center justify-between rounded-[28px] border px-4 py-3 backdrop-blur-xl transition-all duration-300 md:px-6",
              scrolled
                ? "border-white/[0.14] bg-black/60 shadow-[0_30px_90px_-55px_rgba(0,0,0,1)]"
                : "border-white/[0.08] bg-black/35"
            )}
          >
            <Link href="/" className="flex items-center gap-3">
              <img src="/images/logo.png" alt="A.D. Homes & Consulting" className="h-11 w-11 rounded-xl bg-white/90 p-0.5 object-contain" />
              <div className="hidden min-w-0 sm:block">
                <span className="block font-heading text-[1.05rem] tracking-[0.18em] text-slate-50">
                  {SITE_CONFIG.name.toUpperCase()}
                </span>
                <span className="block text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">
                  Operations Consulting for Builders
                </span>
              </div>
            </Link>

            <div className="hidden items-center gap-3 md:flex">
              <nav className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1.5">
                {NAV_LINKS.map((link) => {
                  const active =
                    pathname === link.href ||
                    (link.href !== "/" && pathname?.startsWith(link.href));

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={clsx(
                        "rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-all",
                        active
                          ? "bg-accent-500 text-white"
                          : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-50"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <Button href="/contact/" size="sm">
                Schedule a Consultation
              </Button>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] p-2 text-slate-200 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </Container>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#050605]/80 backdrop-blur-sm md:hidden">
          <Container className="pt-28">
            <div className="panel overflow-hidden p-6">
              <div className="mb-6 border-b border-white/[0.08] pb-5">
                <div className="font-heading text-2xl tracking-[0.12em] text-slate-50">
                  Builder Consulting
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Finance, systems, and operations support for Central Florida
                  builders.
                </p>
              </div>
              <nav className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => {
                  const active =
                    pathname === link.href ||
                    (link.href !== "/" && pathname?.startsWith(link.href));

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={clsx(
                        "rounded-[1.25rem] px-4 py-4 text-sm font-semibold uppercase tracking-[0.16em] transition-all",
                        active
                          ? "bg-accent-500 text-white"
                          : "bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <Button href="/contact/" className="mt-6 w-full justify-center">
                Schedule a Consultation
              </Button>
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
