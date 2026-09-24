"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const ALL_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"] as const;
// Nine open questions on a home page is a wall; the rest live on /faq.
const KEYS = ALL_KEYS.slice(0, 5);

export function Faq() {
  const t = useTranslations("pages.faq");
  const [open, setOpen] = useState<(typeof ALL_KEYS)[number] | null>("q1");

  return (
    <section id="faq" className="relative mx-auto max-w-6xl scroll-mt-28 px-5 py-24 sm:px-6">
      <Reveal className="max-w-2xl">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
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
      <Reveal className="mt-8 text-center text-sm">
        <Link href="/faq" className="font-medium text-accent underline-offset-4 hover:underline">
          {t("seeAll")} →
        </Link>
      </Reveal>
    </section>
  );
}
