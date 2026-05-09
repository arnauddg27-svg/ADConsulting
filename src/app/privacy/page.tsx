import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy | AD ERP SYSTEMS",
  description:
    "Privacy Policy for AD ERP SYSTEMS, including how website, contact, analytics, advertising, and booking data may be collected and managed.",
};

const updatedDate = "May 9, 2026";

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="mx-auto max-w-4xl">
            <span className="eyebrow">Privacy Policy</span>
            <h1 className="mt-6 font-heading text-5xl leading-[0.94] tracking-[-0.01em] text-slate-50 sm:text-6xl">
              How website and contact data is handled
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              This policy explains how {SITE_CONFIG.businessName} collects,
              uses, and manages information submitted through this website,
              booking flows, analytics tools, and advertising campaigns.
            </p>
            <p className="mt-4 text-sm text-slate-500">Last updated: {updatedDate}</p>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <div className="mx-auto max-w-4xl space-y-10 text-slate-300">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 md:p-8">
              <h2 className="font-heading text-2xl text-slate-50">Business Identity</h2>
              <div className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
                <p>
                  <strong className="text-slate-100">Business:</strong>{" "}
                  {SITE_CONFIG.legalName}
                </p>
                <p>
                  <strong className="text-slate-100">Website:</strong>{" "}
                  consulting.aderpsystems.com
                </p>
                <p>
                  <strong className="text-slate-100">Email:</strong>{" "}
                  <a href={`mailto:${SITE_CONFIG.email}`} className="text-accent-200">
                    {SITE_CONFIG.email}
                  </a>
                </p>
                <p>
                  <strong className="text-slate-100">Business address:</strong>{" "}
                  {SITE_CONFIG.businessAddress}
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-slate-50">Information We Collect</h2>
              <p className="mt-4 leading-7 text-slate-400">
                We may collect information you submit through website forms,
                Calendly booking flows, email, or discovery-call requests. This
                can include your name, company, business email, phone number,
                website, country, company type, current systems, and details
                about your reporting or data-platform needs.
              </p>
              <p className="mt-4 leading-7 text-slate-400">
                We may also collect limited website usage data through analytics
                and advertising tools, including page views, traffic source,
                device/browser information, approximate location, and interactions
                with booking or contact links.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-slate-50">How We Use Information</h2>
              <p className="mt-4 leading-7 text-slate-400">
                Information is used to respond to inquiries, qualify whether the
                service is a fit, schedule discovery calls, prepare for sales
                conversations, improve website performance, measure advertising
                effectiveness, and operate the business.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-slate-50">Third-Party Services</h2>
              <p className="mt-4 leading-7 text-slate-400">
                The website may use third-party services such as Calendly,
                Google Analytics, Google Ads, hosting providers, email providers,
                and CRM or workflow tools. These providers may process information
                according to their own privacy and security practices.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-slate-50">Data Sharing</h2>
              <p className="mt-4 leading-7 text-slate-400">
                We do not sell personal information. Information may be shared
                with service providers that help operate the website, booking,
                analytics, advertising, CRM, email, or hosting systems, or when
                required to comply with legal obligations.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-slate-50">Data Retention and Security</h2>
              <p className="mt-4 leading-7 text-slate-400">
                We retain information for as long as reasonably needed for the
                purposes described above, unless a longer retention period is
                required by law or business recordkeeping needs. We use reasonable
                administrative and technical measures to protect information, but
                no website or internet transmission can be guaranteed completely
                secure.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-slate-50">Your Choices</h2>
              <p className="mt-4 leading-7 text-slate-400">
                You may contact us to request that we update or delete information
                you submitted, subject to legal, security, and business
                recordkeeping requirements. You can also control cookies and
                tracking through your browser settings.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-slate-50">Contact</h2>
              <p className="mt-4 leading-7 text-slate-400">
                Questions about this policy can be sent to{" "}
                <a href={`mailto:${SITE_CONFIG.email}`} className="text-accent-200">
                  {SITE_CONFIG.email}
                </a>
                .
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                For more information about the business and services, visit the{" "}
                <Link href="/about/" className="text-accent-200">
                  About Us
                </Link>{" "}
                page.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
