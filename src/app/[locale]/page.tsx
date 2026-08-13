import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { UseCases } from "@/components/landing/use-cases";
import { LiveDemo } from "@/components/landing/live-demo";
import { Pricing } from "@/components/landing/pricing";
import { CtaBand } from "@/components/landing/cta-band";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <SiteHeader />
      <Hero />
      <Features />
      <UseCases />
      <LiveDemo />
      <Pricing />
      <CtaBand />
      <SiteFooter />
    </div>
  );
}
