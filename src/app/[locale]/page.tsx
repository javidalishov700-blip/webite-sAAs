import { MarketingChrome } from "@/components/landing/marketing-chrome";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { UseCases } from "@/components/landing/use-cases";
import { LiveDemo } from "@/components/landing/live-demo";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { CtaBand } from "@/components/landing/cta-band";

export default function HomePage() {
  return (
    <MarketingChrome>
      <Hero />
      <Features />
      <UseCases />
      <LiveDemo />
      <Pricing />
      <Faq />
      <CtaBand />
    </MarketingChrome>
  );
}
