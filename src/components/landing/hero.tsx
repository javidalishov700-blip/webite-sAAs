"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight, ChevronDown, PlayCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Hero3D } from "@/components/landing/hero-3d";
import { ActiveUsersBadge } from "@/components/landing/active-users";
import { api } from "@/lib/api-client";
import { formatCompactNumber } from "@/lib/utils";

interface PublicStats {
  scans: number;
  catalogs: number;
  languages: number;
  online: number;
}

export function Hero() {
  const t = useTranslations("landing.hero");
  const locale = useLocale();
  const { data: stats } = useQuery({
    queryKey: ["public-stats"],
    queryFn: () => api.get<PublicStats>("/api/stats"),
    refetchInterval: 20_000,
    staleTime: 10_000,
  });

  const statItems = [
    { value: stats ? formatCompactNumber(stats.scans, locale) : "—", label: t("statScansLabel") },
    { value: stats ? formatCompactNumber(stats.catalogs, locale) : "—", label: t("statBusinessesLabel") },
    { value: stats ? String(stats.languages) : "4", label: t("statCountriesLabel") },
  ] as const;

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16 sm:pt-32">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-start"
        >
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {t("eyebrow")}
          </div>

          <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {t("titleLine1")}
            <br />
            <span className="text-gradient animate-gradient-x bg-[length:200%_auto]">{t("titleHighlight")}</span>
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
              <a href="#how-it-works">
                <PlayCircle className="size-4.5" />
                {t("ctaSecondary")}
              </a>
            </Button>
          </div>

          <div className="mt-10 grid w-full grid-cols-3 gap-4 border-t border-border/70 pt-6">
            {statItems.map((item) => (
              <div key={item.label}>
                <p className="font-display text-xl font-bold sm:text-2xl">{item.value}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
          className="relative order-first h-[280px] sm:h-[380px] lg:order-last lg:h-[560px]"
        >
          <Hero3D />
          <ActiveUsersBadge className="glass animate-float absolute top-6 right-2 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium sm:right-6" />
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-6 hidden flex-col items-center gap-1 text-xs text-muted-foreground sm:flex">
        <span>{t("scrollHint")}</span>
        <ChevronDown className="size-4 animate-bounce" />
      </div>
    </section>
  );
}
