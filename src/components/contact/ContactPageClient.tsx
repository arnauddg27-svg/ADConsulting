"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import { SITE_CONFIG } from "@/lib/constants";

const faqs = [
  {
    q: "What size builder do you work with?",
    a: "Mostly small to midsize builders, especially teams closing fewer than 200 homes a year that need stronger operating infrastructure without enterprise-consulting overhead.",
  },
  {
    q: "How long does a typical engagement take?",
    a: "Most engagements run 4 to 8 weeks. ERP and process work often takes 2 to 3 months, and larger cleanup or implementation work can run longer depending on data quality, system condition, and how many teams are involved.",
  },
  {
    q: "Do you replace our current systems?",
    a: "Only when the current stack is clearly the issue. Most engagements start by improving how the existing tools are configured, cleaned up, and used.",
  },
  {
    q: "What happens in the free consultation?",
    a: "We spend 30 minutes on the operation itself: where reporting slows down, where decisions lose clarity, and which system or process layer is creating the drag.",
  },
];

type SubmissionState = "idle" | "submitting" | "submitted" | "error";

export default function ContactPageClient() {
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status === "submitting") {
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.append("_subject", "New consultation request from website");
    formData.append("_template", "table");
    formData.append("_captcha", "false");

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${SITE_CONFIG.email}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error("Submission service returned an unexpected response.");
      }

      form.reset();
      setStatus("submitted");
    } catch {
      setStatus("error");
      setErrorMessage(
        "The form couldn’t be sent right now. Please try again, or email arnauddg27@gmail.com directly."
      );
    }
  };

  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <span className="eyebrow">Start the Conversation</span>
              <h1 className="mt-6 max-w-4xl font-heading text-5xl leading-[0.9] tracking-[0.05em] text-slate-50 sm:text-6xl">
                Tell me where the operation is getting stuck.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                If reporting is late, margin is unclear, the ERP is underused,
                or the team is fighting broken workflows, let’s talk through
                it.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="panel p-6 md:p-8">
              {status === "submitted" ? (
                <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-8 text-center">
                  <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
                  <h2 className="mt-5 font-heading text-3xl tracking-[0.04em] text-slate-50">
                    Message received.
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-200">
                    Thanks. I’ll reply within 24 hours with the best next step
                    and what I’d want to review first.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-6"
                    onClick={() => setStatus("idle")}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input
                    type="text"
                    name="_honey"
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="field-label" htmlFor="contact-name">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        className="field"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="contact-email">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        className="field"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="field-label" htmlFor="contact-company">
                        Company
                      </label>
                      <input
                        id="contact-company"
                        name="company"
                        type="text"
                        className="field"
                        placeholder="Your company"
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="contact-phone">
                        Phone
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        className="field"
                        placeholder="(407) 555-0123"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="contact-volume">
                      Homes closed per year
                    </label>
                    <select id="contact-volume" name="homes_per_year" className="field" defaultValue="">
                      <option value="" disabled>
                        Select range
                      </option>
                      <option value="1-25">1 – 25 homes</option>
                      <option value="25-50">25 – 50 homes</option>
                      <option value="50-100">50 – 100 homes</option>
                      <option value="100-200">100 – 200 homes</option>
                      <option value="200+">200+ homes</option>
                    </select>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="contact-message">
                      How can I help?
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={6}
                      className="field resize-none"
                      placeholder="Tell me what needs to work better, what the team needs to see more clearly, and what outcome you want from the engagement."
                    />
                  </div>

                  {status === "error" && (
                    <div className="rounded-[1.25rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="min-w-[15rem] justify-center">
                    {status === "submitting" ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>

            <div className="space-y-5">
              <Card padding="lg">
                <h2 className="font-heading text-3xl tracking-[0.04em] text-slate-50">
                  Contact details
                </h2>
                <div className="mt-6 space-y-4 text-sm text-slate-200">
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 text-accent-300" />
                    <a href={`tel:${SITE_CONFIG.phone}`} className="hover:text-accent-100">
                      {SITE_CONFIG.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 text-accent-300" />
                    <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-accent-100">
                      {SITE_CONFIG.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 text-accent-300" />
                    <span>{SITE_CONFIG.location}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="mt-0.5 text-accent-300" />
                    <span>Response within 24 hours</span>
                  </div>
                </div>
              </Card>

              <Card
                padding="lg"
                className="bg-[linear-gradient(135deg,rgba(209,133,63,0.18),rgba(255,255,255,0.05)_60%,rgba(255,255,255,0.03))]"
              >
                <h3 className="font-heading text-3xl tracking-[0.04em] text-slate-50">
                  Free 30-minute consultation
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-200 md:text-base">
                  The first call is meant to create clarity. We’ll sort through
                  the reporting, system, or process issue and identify the most
                  useful place to start.
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
            title="Questions builders usually ask before the first call."
            subtitle="If you are not sure whether the issue sits in process, reporting, or systems, that is normal. The first conversation is meant to separate those layers."
          />

          <div className="grid gap-5 md:grid-cols-2">
            {faqs.map((faq) => (
              <Card key={faq.q} padding="lg">
                <h3 className="font-heading text-3xl leading-[0.95] tracking-[0.04em] text-slate-50">
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
