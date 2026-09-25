"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/landing/hero-visual";

export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section className="relative isolate flex items-start overflow-hidden pt-24 pb-16 sm:min-h-[100svh] sm:items-center sm:pt-32">
      <div aria-hidden className="hero-wash pointer-events-none absolute inset-0 -z-10 dark:hidden" />
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-start"
        >
          <p className="mb-5 text-sm font-medium text-muted-foreground">{t("eyebrow")}</p>

          <h1 className="font-serif text-[2.6rem] leading-[1.08] font-semibold tracking-[-0.01em] text-balance sm:text-6xl lg:text-[4.25rem]">
            {t("titleLine1")}
            <br />
            <span className="hero-accent italic">{t("titleHighlight")}</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">{t("subtitle")}</p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button variant="glow" size="lg" asChild>
              <Link href="/signup">
                {t("ctaPrimary")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <a href="#guide">
                <PlayCircle className="size-4.5" />
                {t("ctaSecondary")}
              </a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
          className="relative order-last h-[520px] sm:h-[560px] lg:h-[600px]"
        >
          <HeroVisual />
        </motion.div>
      </div>

    </section>
  );
}
