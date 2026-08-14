import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteBackdrop } from "@/components/landing/site-backdrop";
import { SmoothScroll } from "@/components/landing/smooth-scroll";

export function MarketingChrome({
  children,
  smooth = false,
}: {
  children: React.ReactNode;
  smooth?: boolean;
}) {
  const tree = (
    <div className="relative isolate min-h-screen overflow-x-clip">
      <SiteBackdrop />
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );

  return smooth ? <SmoothScroll>{tree}</SmoothScroll> : tree;
}
