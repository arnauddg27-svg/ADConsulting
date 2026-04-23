import Link from "next/link";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import Container from "@/components/ui/Container";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#060a12]">
      {/* subtle accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 mx-auto h-[420px] max-w-5xl rounded-full bg-accent-500/[0.06] blur-[120px]"
      />

      <Container className="relative py-16 md:py-20">
        <div className="premium-panel overflow-hidden px-7 py-9 md:px-10 md:py-12">
          <div className="relative grid gap-10 md:grid-cols-[1.25fr_0.75fr_0.9fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-gradient-to-br from-accent-500/25 to-emerald-500/5 text-lg font-bold tracking-wider text-accent-200">
                  AD
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-xl opacity-50 blur-md bg-accent-500/30"
                  />
                </div>
                <div>
                  <div className="font-heading text-[1.2rem] tracking-[0.18em] text-slate-50">
                    {SITE_CONFIG.name.toUpperCase()}
                  </div>
                  <div className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
                    Custom Data Platforms for Residential Homebuilders
                  </div>
                </div>
              </div>

              <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 md:text-[0.95rem]">
                We build custom data platforms for residential homebuilders by
                centralizing ERP, spreadsheet, finance, API, and export data in
                a structured warehouse and turning it into reporting systems,
                dashboards, and operational tools.
              </p>

              <Link
                href="/contact/"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent-400/30 bg-accent-500/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accent-200 transition-all hover:border-accent-400/60 hover:bg-accent-500/15"
              >
                Book a Discovery Call
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div>
              <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Sitemap
              </h3>
              <ul className="mt-5 space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-slate-200 transition-colors hover:text-accent-200"
                    >
                      {link.label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Contact
              </h3>
              <ul className="mt-5 space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <Phone size={16} className="mt-0.5 text-accent-300" />
                  <a
                    href={SITE_CONFIG.phoneHref}
                    className="transition-colors hover:text-accent-200"
                  >
                    {SITE_CONFIG.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={16} className="mt-0.5 text-accent-300" />
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="transition-colors hover:text-accent-200"
                  >
                    {SITE_CONFIG.email}
                  </a>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <MapPin size={16} className="mt-0.5 text-accent-300" />
                  {SITE_CONFIG.location}
                </li>
              </ul>
            </div>
          </div>

          <div className="relative mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/[0.08] pt-6 text-[0.68rem] uppercase tracking-[0.18em] text-slate-500 md:flex-row md:items-center">
            <div>© {new Date().getFullYear()} {SITE_CONFIG.businessName}.</div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
              Accepting new engagements
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
