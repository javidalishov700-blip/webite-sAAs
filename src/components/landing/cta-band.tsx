"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  const t = useTranslations("landing.cta");

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glow-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-accent/10 px-6 py-16 text-center sm:px-16"
      >
        <div className="pointer-events-none absolute inset-0 grid-mask opacity-60" />
        <h2 className="relative font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">{t("subtitle")}</p>
        <Button variant="glow" size="lg" className="relative mt-8" asChild>
          <Link href="/signup">
            {t("button")}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
