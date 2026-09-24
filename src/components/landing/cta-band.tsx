"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

export function CtaBand() {
  const t = useTranslations("landing.cta");

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-10 sm:px-6">
      <Reveal
        y={24}
        className="glow-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-accent/10 px-6 py-16 text-center sm:px-16"
      >
        <div className="pointer-events-none absolute inset-0 grid-mask opacity-60" />
        <div className="animate-aurora pointer-events-none absolute top-1/2 left-1/2 -z-0 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-2/20 blur-[100px]" />
        <h2 className="relative font-serif text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">{t("title")}</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">{t("subtitle")}</p>
        <Button variant="glow" size="lg" className="relative mt-8" asChild>
          <Link href="/signup">
            {t("button")}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </Reveal>
    </section>
  );
}
