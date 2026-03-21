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
        headline="Start with a discovery call, not a software demo."
        description="We will talk through your current systems, where the spreadsheets take over, and whether the right next step is a quick fix or a deeper systems mapping engagement."
        primaryCTA={{ label: "Book a Discovery Call", href: "/contact/" }}
      />
    </>
  );
}
