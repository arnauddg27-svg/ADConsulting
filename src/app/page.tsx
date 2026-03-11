import Hero from "@/components/sections/Hero";
import SocialProof from "@/components/sections/SocialProof";
import ServicesOverview from "@/components/sections/ServicesOverview";
import DashboardPreview from "@/components/sections/DashboardPreview";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import CTABanner from "@/components/sections/CTABanner";

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesOverview />
      <SocialProof />
      <WhyChooseUs />
      <DashboardPreview />
      <CTABanner
        headline="Start with the bottleneck that is hurting the business."
        description="We’ll look at whether the real issue sits in reporting, margin analysis, ERP setup, or day-to-day process execution and identify the right place to start."
        primaryCTA={{ label: "Start the Conversation", href: "/contact/" }}
        secondaryCTA={{ label: "Review Services", href: "/services/" }}
      />
    </>
  );
}
