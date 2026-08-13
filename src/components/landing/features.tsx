"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { BarChart3, Building2, Languages, QrCode, SlidersHorizontal, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const FEATURES = [
  { key: "realtime", icon: Zap },
  { key: "multitenant", icon: Building2 },
  { key: "attributes", icon: SlidersHorizontal },
  { key: "qr", icon: QrCode },
  { key: "i18n", icon: Languages },
  { key: "analytics", icon: BarChart3 },
] as const;

export function Features() {
  const t = useTranslations("landing.features");

  return (
    <section id="features" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">{t("eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
          >
            <Card className="group h-full p-6 transition-transform duration-300 hover:-translate-y-1">
              <div className="glow-ring mb-4 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition-transform group-hover:scale-110">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{t(`items.${feature.key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`items.${feature.key}.description`)}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
