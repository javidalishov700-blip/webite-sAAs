import { MarketingChrome } from "@/components/landing/marketing-chrome";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LiveDemo } from "@/components/landing/live-demo";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { CtaBand } from "@/components/landing/cta-band";

export default function HomePage() {
  return (
    <MarketingChrome smooth>
      <Hero />
      <HowItWorks />
      <LiveDemo />
      <Pricing />
      <Faq />
      <CtaBand />
    </MarketingChrome>
  );
}
