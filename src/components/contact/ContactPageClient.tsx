"use client";

import { ArrowRight, CalendarCheck, Clock, Mail, MapPin, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import { SITE_CONFIG } from "@/lib/constants";

const bookingUrl = "https://calendly.com/adurand-aderpsystems/30min";

const faqs = [
  {
    q: "What size builder do you usually work with?",
    a: "The core fit is residential builders doing roughly 20-500+ homes per year across North America. The strongest fit is usually the point where ERP data, spreadsheets, and reporting no longer stay aligned without heavy manual work.",
  },
  {
    q: "How long do projects usually take?",
    a: "Timeline depends on scope and source-system complexity. Many projects deliver a first working reporting release in a few weeks, then expand in phases.",
  },
  {
    q: "Do you replace our current systems?",
    a: "No. The model is to extract from the systems you already use, whether that is Buildertrend, Hyphen, Sage, JME, Google Sheets, CSV exports, or a mix. The platform sits on top of the operation so the data becomes usable without forcing a full rip-and-replace.",
  },
  {
    q: "What happens on the first call?",
    a: "The discovery call reviews your current systems, reporting gaps, and priority decisions. You leave with a clear recommendation for scope and next steps.",
  },
];

export default function ContactPageClient() {
  return (
    <>
      <section className="page-hero pb-12 sm:pb-16 md:pb-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <span className="eyebrow">Start the Conversation</span>
              <h1 className="mt-6 max-w-4xl font-heading text-4xl leading-[0.95] tracking-[0.02em] text-slate-50 sm:text-5xl md:text-6xl">
                Book a call to review your systems and reporting needs.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                The first call is focused on fit and clarity: what data you
                have, where reporting breaks down, and what a practical first
                phase could look like.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <Card
              padding="lg"
              className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(209,133,63,0.2),rgba(255,255,255,0.055)_58%,rgba(52,211,153,0.1))]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-400/20 blur-[90px]"
              />
              <div className="relative">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-300/25 bg-accent-500/15 text-accent-200">
                  <CalendarCheck size={22} />
                </div>
                <h2 className="font-heading text-4xl leading-[0.95] tracking-[0.02em] text-slate-50 sm:text-5xl">
                  Book a 30-minute discovery call.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
                  We will review your current systems, reporting workflow, and
                  decision priorities to confirm fit. After the call, we send a
                  short questionnaire if more detail is needed to prepare a
                  practical quote.
                </p>

                <div className="mt-7">
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-b-2 border-zinc-950/40 bg-gradient-to-t from-accent-600 to-accent-400 px-5 py-4 text-center text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-white shadow-lg shadow-accent-500/30 ring-1 ring-inset ring-white/25 transition-[filter,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-accent-500/40 active:translate-y-0 active:brightness-95 sm:w-auto sm:px-6"
                  >
                    Pick a time
                    <ArrowRight size={16} />
                  </a>
                </div>

                <div className="mt-7 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-4">
                    <div className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-accent-300">
                      Step 1
                    </div>
                    <div className="mt-2 leading-6">Review systems and pain points.</div>
                  </div>
                  <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-4">
                    <div className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-accent-300">
                      Step 2
                    </div>
                    <div className="mt-2 leading-6">Send questionnaire after fit is clear.</div>
                  </div>
                  <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-4">
                    <div className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-accent-300">
                      Step 3
                    </div>
                    <div className="mt-2 leading-6">Prepare scope and quote.</div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-5">
              <Card padding="lg">
                <h2 className="font-heading text-3xl tracking-[0.04em] text-slate-50">
                  Contact details
                </h2>
                <div className="mt-6 space-y-4 text-sm text-slate-200">
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 shrink-0 text-accent-300" />
                    <a href={SITE_CONFIG.phoneHref} className="hover:text-accent-100">
                      {SITE_CONFIG.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 shrink-0 text-accent-300" />
                    <a
                      href={`mailto:${SITE_CONFIG.email}`}
                      className="break-all hover:text-accent-100"
                    >
                      {SITE_CONFIG.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-accent-300" />
                    <span>{SITE_CONFIG.location}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="mt-0.5 shrink-0 text-accent-300" />
                    <span>Response within 24 hours</span>
                  </div>
                </div>
              </Card>

              <Card
                padding="lg"
                className="bg-[linear-gradient(135deg,rgba(52,211,153,0.12),rgba(255,255,255,0.04)_60%,rgba(34,211,238,0.08))]"
              >
                <h3 className="font-heading text-2xl tracking-[0.04em] text-slate-50">
                  Post-call questionnaire
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-200">
                  After the initial call, we send a short worksheet covering your
                  systems, reporting gaps, data access, and priority dashboards.
                  It gives us the detail needed to prepare a practical scope and
                  quote.
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <SectionHeading
            label="FAQ"
            title="Questions teams usually ask before the first call."
            subtitle="If you are not sure whether the bottleneck is extraction, reporting design, data quality, or workflow alignment, that is exactly what the first conversation clarifies."
          />

          <div className="grid gap-5 md:grid-cols-2">
            {faqs.map((faq) => (
              <Card key={faq.q} padding="lg">
                <h3 className="font-heading text-2xl leading-[0.98] tracking-[0.04em] text-slate-50 sm:text-3xl">
                  {faq.q}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
                  {faq.a}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
