"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  ListChecks,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { SITE_CONFIG } from "@/lib/constants";

type TrackingWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  lintrk?: (event: "track", options: { conversion_id?: string }) => void;
};

type FormState = {
  country: string;
  companyType: string;
  volume: string;
  systems: string[];
  companyName: string;
  companyWebsite: string;
  businessEmail: string;
};

const initialForm: FormState = {
  country: "",
  companyType: "",
  volume: "",
  systems: [],
  companyName: "",
  companyWebsite: "",
  businessEmail: "",
};

const systemOptions = [
  { value: "erp", label: "ERP" },
  { value: "spreadsheets", label: "Spreadsheets" },
  { value: "finance", label: "Finance system" },
  { value: "api_exports", label: "APIs or exports" },
  { value: "operating_tools", label: "Operating tools" },
  { value: "not_sure", label: "Not sure yet" },
];

const linkedInBookCallConversionId =
  process.env.NEXT_PUBLIC_LINKEDIN_BOOK_CALL_CONVERSION_ID;

function getTrafficSource() {
  if (typeof window === "undefined") {
    return "booking_gate";
  }

  return new URLSearchParams(window.location.search).get("source") || "booking_gate";
}

function trackEvent(event: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  const trackingWindow = window as TrackingWindow;
  trackingWindow.dataLayer = trackingWindow.dataLayer || [];
  trackingWindow.dataLayer.push({ event, ...payload });
  trackingWindow.gtag?.("event", event, payload);
}

export default function BookingQualifier() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [systemsTouched, setSystemsTouched] = useState(false);

  const hasIdentity =
    form.companyName.trim().length > 1 &&
    (form.companyWebsite.trim().length > 3 ||
      form.businessEmail.trim().length > 5);

  const isQualified = useMemo(() => {
    const supportedCountry = form.country === "us" || form.country === "canada";
    const supportedCompany = [
      "residential_builder",
      "residential_developer",
      "land_developer",
    ].includes(form.companyType);
    const hasOperatingScale = form.volume !== "" && form.volume !== "not_applicable";
    const hasSystemContext = form.systems.length > 0;

    return (
      supportedCountry &&
      supportedCompany &&
      hasOperatingScale &&
      hasSystemContext &&
      hasIdentity
    );
  }, [form, hasIdentity]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleSystem = (value: string) => {
    setSystemsTouched(true);
    setForm((current) => {
      const exists = current.systems.includes(value);
      return {
        ...current,
        systems: exists
          ? current.systems.filter((system) => system !== value)
          : [...current.systems, value],
      };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setSystemsTouched(true);

    trackEvent("lead_qualification_submit", {
      event_category: "booking",
      event_label: getTrafficSource(),
      qualified: isQualified,
      country: form.country,
      company_type: form.companyType,
      volume_band: form.volume,
      systems_count: form.systems.length,
    });
  };

  const handleCalendarClick = () => {
    const trackingWindow = window as TrackingWindow;

    trackEvent("book_call_click", {
      event_category: "booking",
      event_label: getTrafficSource(),
      qualified: true,
      destination: SITE_CONFIG.calendlyUrl,
    });

    trackingWindow.fbq?.("track", "Lead", {
      content_name: "Qualified discovery call",
      content_category: "booking",
    });

    if (linkedInBookCallConversionId) {
      trackingWindow.lintrk?.("track", {
        conversion_id: linkedInBookCallConversionId,
      });
    }
  };

  return (
    <section className="page-hero">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <span className="eyebrow">Discovery Call</span>
            <h1 className="mt-6 max-w-3xl font-heading text-5xl leading-[0.92] tracking-[-0.015em] text-[#17212c] sm:text-6xl">
              Confirm fit before choosing a time.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#58636b] md:text-lg">
              AD ERP SYSTEMS works with residential builders and
              developers in the U.S. and Canada that need reporting built from
              real operating data.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                "Residential builder or developer",
                "U.S. or Canada",
                "ERP, spreadsheet, finance, API, export, or operating data",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-[#d9e0e4] bg-white/[0.72] px-4 py-3 text-sm font-semibold text-[#476173]"
                >
                  <CheckCircle2 size={18} className="shrink-0 text-[#4f8d76]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5 md:p-7">
            <form className="grid gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="field-label">Country</span>
                  <select
                    className="field"
                    required
                    value={form.country}
                    onChange={(event) => updateField("country", event.target.value)}
                  >
                    <option value="">Select one</option>
                    <option value="us">United States</option>
                    <option value="canada">Canada</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label>
                  <span className="field-label">Company Type</span>
                  <select
                    className="field"
                    required
                    value={form.companyType}
                    onChange={(event) =>
                      updateField("companyType", event.target.value)
                    }
                  >
                    <option value="">Select one</option>
                    <option value="residential_builder">Residential builder</option>
                    <option value="residential_developer">
                      Residential real estate developer
                    </option>
                    <option value="land_developer">Residential land developer</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <label>
                <span className="field-label">Approx. Homes or Units Per Year</span>
                <select
                  className="field"
                  required
                  value={form.volume}
                  onChange={(event) => updateField("volume", event.target.value)}
                >
                  <option value="">Select one</option>
                  <option value="under_20">Under 20</option>
                  <option value="20_99">20-99</option>
                  <option value="100_499">100-499</option>
                  <option value="500_plus">500+</option>
                  <option value="not_sure">Not sure</option>
                  <option value="not_applicable">Not applicable</option>
                </select>
              </label>

              <fieldset>
                <legend className="field-label">Current Systems</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {systemOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-[#d9e0e4] bg-white/[0.72] px-4 py-3 text-sm font-semibold text-[#476173] transition-colors hover:border-[#6f9fb4] hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-accent-500"
                        checked={form.systems.includes(option.value)}
                        onChange={() => toggleSystem(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {systemsTouched && form.systems.length === 0 ? (
                  <p className="mt-2 text-sm text-red-400">
                    Select at least one source system or Not sure yet.
                  </p>
                ) : null}
              </fieldset>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="field-label">Company Name</span>
                  <input
                    className="field"
                    required
                    value={form.companyName}
                    onChange={(event) =>
                      updateField("companyName", event.target.value)
                    }
                    placeholder="Company name"
                  />
                </label>

                <label>
                  <span className="field-label">Company Website</span>
                  <input
                    className="field"
                    value={form.companyWebsite}
                    onChange={(event) =>
                      updateField("companyWebsite", event.target.value)
                    }
                    placeholder="company.com"
                  />
                </label>
              </div>

              <label>
                <span className="field-label">Business Email</span>
                <input
                  className="field"
                  type="email"
                  value={form.businessEmail}
                  onChange={(event) =>
                    updateField("businessEmail", event.target.value)
                  }
                  placeholder="name@company.com"
                />
              </label>

              {submitted && !hasIdentity ? (
                <p className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
                  Add a company name plus either a company website or business
                  email before continuing.
                </p>
              ) : null}

              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#17212c] bg-[#17212c] px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_44px_-28px_rgba(23,33,44,0.68)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#243344]"
              >
                Check Fit
                <ListChecks size={16} />
              </button>
            </form>

            {submitted ? (
              <div
                className={`mt-6 rounded-2xl border p-5 ${
                  isQualified
                    ? "border-accent-400/30 bg-accent-500/[0.08]"
                    : "border-red-400/25 bg-red-500/[0.08]"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isQualified ? (
                    <Database
                      size={22}
                      className="mt-0.5 shrink-0 text-accent-300"
                    />
                  ) : (
                    <AlertTriangle
                      size={22}
                      className="mt-0.5 shrink-0 text-red-300"
                    />
                  )}
                  <div>
                    <h2 className="font-heading text-3xl tracking-[-0.015em] text-[#17212c]">
                      {isQualified ? "This looks like a fit." : "Do not book yet."}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#58636b]">
                      {isQualified
                        ? "Choose a time for a 30-minute discovery call."
                        : "This calendar is for residential builders and developers in the U.S. or Canada with operating data to centralize. If that describes your company, adjust the answers above."}
                    </p>
                    {isQualified ? (
                      <a
                        href={SITE_CONFIG.calendlyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleCalendarClick}
                        className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#17212c] bg-[#17212c] px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_44px_-28px_rgba(23,33,44,0.68)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#243344]"
                      >
                        Continue to Calendar
                        <ArrowRight size={16} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
