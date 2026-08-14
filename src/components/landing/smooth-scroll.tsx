"use client";

import { ReactLenis } from "lenis/react";

/**
 * Buttery inertia scrolling for the landing page only. Mounted directly in
 * `page.tsx` (not the shared `[locale]` layout) so it initializes on entering
 * `/` and is fully torn down — listeners removed, native scroll restored — on
 * navigating to any other route (admin, auth, catalog).
 *
 * `respectReducedMotion` (Lenis default: on) automatically disables the
 * smoothing for users who prefer reduced motion, and `anchors: true` makes
 * the header's `#features` / `#pricing` links glide instead of hard-jumping.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 0.85,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1,
        anchors: { offset: -88 },
        stopInertiaOnNavigate: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
