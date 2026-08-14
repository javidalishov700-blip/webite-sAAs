"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export function Faq() {
  const t = useTranslations("pages.faq");
  const [open, setOpen] = useState<(typeof KEYS)[number] | null>("q1");

  return (
    <section id="faq" className="relative mx-auto max-w-6xl scroll-mt-28 px-5 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">{t("eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </Reveal>
      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {KEYS.map((key) => {
          const isOpen = open === key;
          return (
            <div key={key} className={cn("glass-card rounded-2xl px-5 py-4", isOpen && "glow-border")}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : key)}
                className="flex w-full items-center justify-between gap-4 text-left font-display text-base font-semibold"
              >
                <span>{t(`items.${key}.q`)}</span>
                <ChevronDown
                  className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}
                />
              </button>
              {isOpen ? (
                <p className="mt-2 pr-8 text-sm leading-relaxed text-muted-foreground">{t(`items.${key}.a`)}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
