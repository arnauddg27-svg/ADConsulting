import Hero from "@/components/sections/Hero";
import StatsBand from "@/components/sections/StatsBand";
import SocialProof from "@/components/sections/SocialProof";
import ServicesOverview from "@/components/sections/ServicesOverview";
import DashboardPreview from "@/components/sections/DashboardPreview";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import CTABanner from "@/components/sections/CTABanner";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBand />
      <ServicesOverview />
      <SocialProof />
      <WhyChooseUs />
      <DashboardPreview />
      <CTABanner
        headline="Start with a 30-minute discovery call."
        description="Thirty minutes on what you're running today, where the reporting breaks, and what a usable platform actually looks like for your team."
        primaryCTA={{ label: "Book a Discovery Call", href: "/contact/" }}
      />
    </>
  );
}
