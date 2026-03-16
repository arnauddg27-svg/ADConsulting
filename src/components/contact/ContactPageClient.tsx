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
    a: "Builders producing 25 to 300 homes per year. Small builders ($30K\u2013$70K implementations) get a standardized operating system. Mid-size builders ($70K\u2013$150K) get a full multi-department data ecosystem.",
  },
  {
    q: "How long does implementation take?",
    a: "Most implementations run 8 to 16 weeks depending on the complexity of your operation, the number of departments involved, and data quality. After launch, a $3K/month retainer keeps the system maintained and evolving.",
  },
  {
    q: "Do you replace our current systems?",
    a: "No. We extract data from the tools you already use and build a layer on top. Your teams keep working in their systems. We make the data actually work.",
  },
  {
    q: "What happens on the first call?",
    a: "A 30-minute discovery call where we dig into your pain points, current systems, and where the biggest operational drag lives. If it\u2019s a quick fix, we\u2019ll tell you how to do it for free. If it needs a full build, you\u2019ll get a precise roadmap.",
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
                Tell me where the data is breaking down.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                If your VP of Construction and your CFO would pull up two
                different margin numbers, if your team is exporting data just
                to do their actual jobs — let&apos;s talk through it.
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
                      <option value="under-25">Under 25 homes</option>
                      <option value="25-100">25 – 100 homes</option>
                      <option value="100-200">100 – 200 homes</option>
                      <option value="200-300">200 – 300 homes</option>
                      <option value="300+">300+ homes</option>
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
                      placeholder="Where is your team spending the most time manually exporting data? What systems are you using today? What would you want to see in a single operating view?"
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
                  Free 30-minute discovery call
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-200 md:text-base">
                  We&apos;ll dig into your current systems, where data is
                  breaking down, and whether a full operating system build
                  makes sense — or if there&apos;s a simpler fix.
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
            title="Questions builders usually ask before the discovery call."
            subtitle="If you're not sure whether you need a full data ecosystem or just a cleanup, that's exactly what the first call is for."
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
