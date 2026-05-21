"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Mail, MapPin } from "lucide-react";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import Container from "@/components/ui/Container";
import { liquidActionClass } from "@/lib/buttonStyles";
import { isDemoRoute, isLightMarketingRoute } from "@/lib/marketingRoutes";

const footerFocus = [
  "Schedule risk",
  "Budget movement",
  "Margin exposure",
  "Owner follow-up",
];

export default function Footer() {
  const pathname = usePathname() ?? "/";
  const isLightMarketing = isLightMarketingRoute(pathname);
  const hideOnRoute = isDemoRoute(pathname);

  if (hideOnRoute) return null;

  const footerClass = isLightMarketing
    ? "relative overflow-hidden border-t border-[#d9e0e4]/60 text-[#17212c]"
    : "relative overflow-hidden border-t border-white/[0.06] bg-[#060a12] text-slate-50";

  const gridImage = isLightMarketing
    ? "linear-gradient(90deg, rgba(53,95,122,0.065) 1px, transparent 1px), linear-gradient(rgba(53,95,122,0.052) 1px, transparent 1px)"
    : "linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)";

  const panelClass = isLightMarketing
    ? "grid min-w-0 gap-8 rounded-[1.5rem] border border-[#d9e0e4] bg-white/90 p-5 shadow-[0_24px_90px_-72px_rgba(23,33,44,0.42)] backdrop-blur md:grid-cols-[1.1fr_0.7fr_1fr] md:p-7"
    : "grid min-w-0 gap-8 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_34px_110px_-70px_rgba(0,0,0,0.9)] backdrop-blur-xl md:grid-cols-[1.1fr_0.7fr_1fr] md:p-7";

  const mutedText = isLightMarketing ? "text-[#58636b]" : "text-slate-400";
  const softText = isLightMarketing ? "text-[#69737b]" : "text-slate-500";
  const linkText = isLightMarketing
    ? "text-[#4f5d64] hover:text-[#17212c]"
    : "text-slate-400 hover:text-white";
  const headingText = isLightMarketing ? "text-[#17212c]" : "text-white";
  const footerMetaText = isLightMarketing ? "text-[#74808a]" : "text-slate-500";
  const hoverMetaText = isLightMarketing ? "hover:text-[#17212c]" : "hover:text-white";
  const chipClass = isLightMarketing
    ? "flex items-center gap-2 rounded-full border border-[#d9e0e4] bg-[#f7f9fa] px-3 py-2 text-sm font-bold text-[#2f5368]"
    : "flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-bold text-slate-300";
  const dividerClass = isLightMarketing ? "border-[#d9e0e4]" : "border-white/[0.08]";
  const footerCtaClass = isLightMarketing
    ? liquidActionClass({
        tone: "primary",
        size: "sm",
        className: "mt-6",
      })
    : "mt-6 inline-flex items-center gap-2 rounded-full bg-accent-400 px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-950 shadow-[0_16px_40px_-28px_rgba(52,211,153,0.7)] transition-all hover:-translate-y-0.5 hover:bg-accent-300";

  return (
    <footer className={footerClass}>
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute -left-24 top-0 h-[26rem] w-[26rem] rounded-full blur-3xl",
          isLightMarketing ? "bg-[#6f8fa7]/10" : "bg-accent-500/[0.08]",
        ].join(" ")}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.38]"
        style={{
          backgroundImage: gridImage,
          backgroundPosition: "center",
          backgroundSize: "64px 64px",
        }}
      />

      <Container className="relative py-10 md:py-14">
        <div className={panelClass}>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={[
                  "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold tracking-wider shadow-[0_14px_32px_-22px_rgba(23,33,44,0.86)]",
                  isLightMarketing
                    ? "border border-[#c9d3da] bg-[#17212c] text-white"
                    : "border border-white/[0.1] bg-white/[0.05] text-accent-200",
                ].join(" ")}
              >
                AD
              </div>
              <div className="min-w-0">
                <div className={`truncate font-heading text-[1.1rem] tracking-[0.18em] ${headingText}`}>
                  {SITE_CONFIG.name.toUpperCase()}
                </div>
                <div className={`max-w-full text-[0.64rem] uppercase tracking-[0.18em] ${softText}`}>
                  {SITE_CONFIG.tagline}
                </div>
              </div>
            </div>

            <p className={`mt-6 max-w-xl text-sm leading-7 md:text-[0.95rem] ${mutedText}`}>
              {SITE_CONFIG.description}
            </p>

            <Link
              href="/book/?source=footer_cta"
              className={footerCtaClass}
            >
              <span>Book a Discovery Call</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="min-w-0">
            <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
              Explore
            </h3>
            <ul className="mt-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`group inline-flex items-center gap-1.5 py-2 text-sm font-bold transition-colors ${linkText}`}
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

          <div className="min-w-0">
            <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
              Review focus
            </h3>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-1">
              {footerFocus.map((item) => (
                <div key={item} className={chipClass}>
                  <CheckCircle2 size={15} className="text-[#35647f]" />
                  {item}
                </div>
              ))}
            </div>
            <ul
              className={`mt-6 space-y-3 border-t pt-5 text-sm font-semibold ${dividerClass} ${mutedText}`}
            >
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 text-[#35647f]" />
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className={`inline-block py-1.5 transition-colors ${hoverMetaText}`}
                >
                  {SITE_CONFIG.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-[#35647f]" />
                <span>
                  {SITE_CONFIG.businessAddress || SITE_CONFIG.location}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div
          className={`relative flex flex-col items-start justify-between gap-3 pt-6 text-[0.66rem] uppercase tracking-[0.16em] md:flex-row md:items-center ${footerMetaText}`}
        >
          <div>© {new Date().getFullYear()} {SITE_CONFIG.businessName}.</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/about/" className={`inline-block py-1.5 transition-colors ${hoverMetaText}`}>
              About Us
            </Link>
            <Link href="/founder/" className={`inline-block py-1.5 transition-colors ${hoverMetaText}`}>
              Founder
            </Link>
            <Link href="/privacy/" className={`inline-block py-1.5 transition-colors ${hoverMetaText}`}>
              Privacy Policy
            </Link>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#35647f] shadow-[0_0_10px_rgba(53,95,122,0.34)]" />
              Accepting new engagements
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
