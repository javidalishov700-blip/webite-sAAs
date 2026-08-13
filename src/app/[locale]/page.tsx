import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { UseCases } from "@/components/landing/use-cases";
import { LiveDemo } from "@/components/landing/live-demo";
import { Pricing } from "@/components/landing/pricing";
import { CtaBand } from "@/components/landing/cta-band";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteBackdrop } from "@/components/landing/site-backdrop";
import { SmoothScroll } from "@/components/landing/smooth-scroll";

export default function HomePage() {
  return (
    <SmoothScroll>
      <div className="relative isolate min-h-screen overflow-x-clip">
        <SiteBackdrop />
        <SiteHeader />
        <Hero />
        <Features />
        <UseCases />
        <LiveDemo />
        <Pricing />
        <CtaBand />
        <SiteFooter />
      </div>
    </SmoothScroll>
  );
}
