import { MarketingChrome } from "@/components/landing/marketing-chrome";
import { Hero } from "@/components/landing/hero";
import { GuideTeaser } from "@/components/landing/guide-teaser";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { CtaBand } from "@/components/landing/cta-band";

export default function HomePage() {
  return (
    <MarketingChrome smooth>
      <Hero />
      <GuideTeaser />
      <Pricing />
      <Faq />
      <CtaBand />
    </MarketingChrome>
  );
}
