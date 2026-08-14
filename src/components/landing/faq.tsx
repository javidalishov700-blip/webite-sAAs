"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/landing/reveal";

const KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export function Faq() {
  const t = useTranslations("pages.faq");

  return (
    <section id="faq" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">{t("eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </Reveal>
      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {KEYS.map((key) => (
          <details
            key={key}
            className="glass-card group rounded-2xl px-5 py-4 open:glow-border"
          >
            <summary className="cursor-pointer list-none font-display text-base font-semibold marker:content-none">
              {t(`items.${key}.q`)}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`items.${key}.a`)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
