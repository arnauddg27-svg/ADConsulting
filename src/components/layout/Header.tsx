import Link from "next/link";
import { Menu } from "lucide-react";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <Container>
        <div className="mt-4 flex items-center justify-between rounded-[28px] border border-white/[0.08] bg-black/35 px-4 py-3 backdrop-blur-xl transition-all duration-300 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-accent-500/20 to-emerald-500/10 text-lg font-bold tracking-wider text-accent-300">
              AD
            </div>
            <div className="hidden min-w-0 sm:block">
              <span className="block font-heading text-[1.05rem] tracking-[0.18em] text-slate-50">
                {SITE_CONFIG.name.toUpperCase()}
              </span>
              <span className="block text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">
                Custom Data Platforms for Residential Homebuilders
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <nav className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-300 transition-all hover:bg-white/[0.06] hover:text-slate-50"
                >
                  {link.label}
                </Link>
              ))}
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
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-[1.25rem] bg-white/[0.04] px-4 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-200 transition-all hover:bg-white/[0.08]"
                  >
                    {link.label}
                  </Link>
                ))}
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
