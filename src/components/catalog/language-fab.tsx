"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useLocaleSwitcher } from "@/hooks/use-locale-switcher";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/data/types";

function LanguageFabInner({ accentColor, locales: available }: { accentColor: string; locales?: readonly AppLocale[] }) {
  const t = useTranslations("catalog");
  const { locale, locales, localeMeta, setLocale } = useLocaleSwitcher(available);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ boxShadow: `0 10px 30px -8px ${accentColor}99` }}
        className="fixed right-4 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white active:scale-95"
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: accentColor }}
          aria-hidden
        />
        <span className="relative flex items-center gap-2">
          <Languages className="size-4" />
          {localeMeta[locale].flag}
        </span>
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("chooseLanguage")}</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-1.5 px-5 pb-8">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  l === locale ? "border-primary bg-primary/10" : "border-border/70 hover:bg-muted/40",
                )}
              >
                <span className="text-xl">{localeMeta[l].flag}</span>
                <span className="font-medium">{localeMeta[l].nativeLabel}</span>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function LanguageFab(props: { accentColor: string; locales?: readonly AppLocale[] }) {
  return (
    <Suspense fallback={null}>
      <LanguageFabInner {...props} />
    </Suspense>
  );
}
