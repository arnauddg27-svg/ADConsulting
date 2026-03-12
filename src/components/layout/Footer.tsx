import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import Container from "@/components/ui/Container";

const practiceAreas = [
  "Financial planning",
  "Internal systems",
  "Process improvement",
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#070b14]">
      <Container className="py-16 md:py-20">
        <div className="panel overflow-hidden px-6 py-8 md:px-8 md:py-10">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.9fr]">
            <div>
              <div className="flex items-center gap-3">
                <img src="/images/logo.png" alt="A.D. Homes & Consulting" className="h-12 w-12 rounded-xl bg-white/90 p-0.5 object-contain" />
                <div>
                  <div className="font-heading text-[1.2rem] tracking-[0.18em] text-slate-50">
                    {SITE_CONFIG.name.toUpperCase()}
                  </div>
                  <div className="text-[0.7rem] uppercase tracking-[0.24em] text-slate-400">
                    Operations Consulting for Builders
                  </div>
                </div>
              </div>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                Helping Central Florida builders and development firms improve
                planning, systems, and execution.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {practiceAreas.map((area) => (
                  <span key={area} className="badge-dash">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Sitemap
              </h3>
              <ul className="mt-5 space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-200 transition-colors hover:text-accent-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Contact
              </h3>
              <ul className="mt-5 space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <Phone size={17} className="mt-0.5 text-accent-300" />
                  <a href={`tel:${SITE_CONFIG.phone}`} className="hover:text-accent-200">
                    {SITE_CONFIG.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={17} className="mt-0.5 text-accent-300" />
                  <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-accent-200">
                    {SITE_CONFIG.email}
                  </a>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <MapPin size={17} className="mt-0.5 text-accent-300" />
                  {SITE_CONFIG.location}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/[0.08] pt-6 text-xs uppercase tracking-[0.18em] text-slate-500">
            © {new Date().getFullYear()} {SITE_CONFIG.businessName}.
          </div>
        </div>
      </Container>
    </footer>
  );
}
