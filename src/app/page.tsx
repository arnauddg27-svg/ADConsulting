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
        headline="Your data is already there. Let’s make it work."
        description="Book a 30-minute discovery call. We’ll dig into your current systems and tell you exactly what a custom operating system would look like for your operation."
        primaryCTA={{ label: "Book a Discovery Call", href: "/contact/" }}
      />
    </>
  );
}
