import type { Metadata } from "next";
import Link from "next/link";

import {
  BlueprintHero,
  BlueprintPage,
  BlueprintPanel,
} from "@/components/marketing/Blueprint";
import Container from "@/components/ui/Container";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy | AD ERP SYSTEMS",
  description:
    "Privacy Policy for AD ERP SYSTEMS, including how website, contact, analytics, advertising, and booking data may be collected and managed.",
};

const updatedDate = "May 9, 2026";

const policySections = [
  {
    title: "Information We Collect",
    body: [
      "We may collect information you submit through website forms, Calendly booking flows, email, or discovery-call requests. This can include your name, company, business email, phone number, website, country, company type, current systems, and details about your reporting or data-platform needs.",
      "We may also collect limited website usage data through analytics and advertising tools, including page views, traffic source, device/browser information, approximate location, and interactions with booking or contact links.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "Information is used to respond to inquiries, qualify whether the service is a fit, schedule discovery calls, prepare for sales conversations, improve website performance, measure advertising effectiveness, and operate the business.",
    ],
  },
  {
    title: "Third-Party Services",
    body: [
      "The website may use third-party services such as Calendly, Google Analytics, Google Ads, hosting providers, email providers, and CRM or workflow tools. These providers may process information according to their own privacy and security practices.",
    ],
  },
  {
    title: "Data Sharing",
    body: [
      "We do not sell personal information. Information may be shared with service providers that help operate the website, booking, analytics, advertising, CRM, email, or hosting systems, or when required to comply with legal obligations.",
    ],
  },
  {
    title: "Data Retention and Security",
    body: [
      "We retain information for as long as reasonably needed for the purposes described above, unless a longer retention period is required by law or business recordkeeping needs.",
      "We use reasonable administrative and technical measures to protect information, but no website or internet transmission can be guaranteed completely secure.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You may contact us to request that we update or delete information you submitted, subject to legal, security, and business recordkeeping requirements. You can also control cookies and tracking through your browser settings.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <BlueprintPage>
      <BlueprintHero
        eyebrow="Privacy Policy"
        title="How website and contact data is handled."
        description={`${SITE_CONFIG.businessName} uses submitted and usage data to respond to inquiries, manage booking flows, and improve website performance.`}
      />

      <section className="pb-20 md:pb-28">
        <Container>
          <div className="mx-auto max-w-4xl space-y-6">
            <BlueprintPanel className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-heading text-3xl tracking-[-0.04em] text-[#17212c]">
                    Business identity
                  </h2>
                  <div className="mt-5 space-y-2 text-sm leading-6 text-[#58636b]">
                    <p>
                      <strong className="text-[#17212c]">Business:</strong>{" "}
                      {SITE_CONFIG.legalName}
                    </p>
                    <p>
                      <strong className="text-[#17212c]">Website:</strong>{" "}
                      consulting.aderpsystems.com
                    </p>
                    <p>
                      <strong className="text-[#17212c]">Email:</strong>{" "}
                      <a href={`mailto:${SITE_CONFIG.email}`} className="font-semibold text-[#35647f]">
                        {SITE_CONFIG.email}
                      </a>
                    </p>
                    <p>
                      <strong className="text-[#17212c]">Business address:</strong>{" "}
                      {SITE_CONFIG.businessAddress}
                    </p>
                  </div>
                </div>
                <p className="rounded-full border border-[#d5dde2] bg-[#f7f9fb] px-4 py-2 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[#6f8190]">
                  Last updated: {updatedDate}
                </p>
              </div>
            </BlueprintPanel>

            {policySections.map((section) => (
              <div key={section.title} className="border-t border-[#d5dde2] pt-7">
                <h2 className="font-heading text-2xl tracking-[-0.03em] text-[#17212c]">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-[#58636b]">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}

            <div className="border-t border-[#d5dde2] pt-7">
              <h2 className="font-heading text-2xl tracking-[-0.03em] text-[#17212c]">
                Contact
              </h2>
              <p className="mt-4 text-base leading-8 text-[#58636b]">
                Questions about this policy can be sent to{" "}
                <a href={`mailto:${SITE_CONFIG.email}`} className="font-semibold text-[#35647f]">
                  {SITE_CONFIG.email}
                </a>
                .
              </p>
              <p className="mt-4 text-sm leading-6 text-[#6f8190]">
                For more information about the business and services, visit the{" "}
                <Link href="/about/" className="font-semibold text-[#35647f]">
                  About Us
                </Link>{" "}
                page.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </BlueprintPage>
  );
}
