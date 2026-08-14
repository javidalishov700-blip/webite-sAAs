import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteBackdrop } from "@/components/landing/site-backdrop";
import { SmoothScroll } from "@/components/landing/smooth-scroll";

export function MarketingChrome({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <div className="relative isolate min-h-screen overflow-x-clip">
        <SiteBackdrop />
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </SmoothScroll>
  );
}
