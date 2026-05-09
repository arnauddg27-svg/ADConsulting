import Hero from "@/components/sections/Hero";
import ServicesOverview from "@/components/sections/ServicesOverview";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import CTABanner from "@/components/sections/CTABanner";

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesOverview />
      <WhyChooseUs />
      <CTABanner
        headline="Start with a 30-minute discovery call."
        description="We will walk through your current systems, identify where data breaks down, and outline the path to a centralized platform your team can run on."
        primaryCTA={{ label: "Book a Discovery Call", href: "/book/?source=home_cta" }}
      />
    </>
  );
}
