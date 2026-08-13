"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * Defaults to `defaultValue` during SSR / initial render to avoid hydration
 * mismatches, then syncs to the real value after mount.
 */
export function useMediaQuery(query: string, defaultValue = false) {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/** True when the user has requested reduced motion at the OS/browser level. */
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True on devices with a precise pointer that supports hover (i.e. not touch). */
export function useFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/** True when the viewport is below the `sm` breakpoint — used to gate heavy effects on phones. */
export function useIsSmallViewport() {
  return useMediaQuery("(max-width: 639px)");
}
