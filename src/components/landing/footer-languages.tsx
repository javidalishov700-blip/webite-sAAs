"use client";

import { Suspense } from "react";
import { useLocaleSwitcher } from "@/hooks/use-locale-switcher";
import { cn } from "@/lib/utils";

/**
 * Every language spelled out in its own name, so a visitor who does not read
 * the current one can still find theirs without guessing at an icon.
 */
function Languages() {
  const { locale, locales, localeMeta, setLocale } = useLocaleSwitcher();
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "rounded-full px-3 py-1 text-sm transition-colors",
            l === locale ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {localeMeta[l].nativeLabel}
        </button>
      ))}
    </div>
  );
}

export function FooterLanguages() {
  return (
    <Suspense fallback={null}>
      <Languages />
    </Suspense>
  );
}
