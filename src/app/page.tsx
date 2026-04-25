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
        headline="Start with a 30-minute discovery call."
        description="We will walk through your current systems, identify where data breaks down, and outline the path to a centralized platform your team can run on."
        primaryCTA={{ label: "Book a Discovery Call", href: "/contact/" }}
      />
    </>
  );
}
