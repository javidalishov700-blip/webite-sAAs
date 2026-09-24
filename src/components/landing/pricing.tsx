"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/landing/tilt-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/reveal";
import { whatsappHref } from "@/lib/site";
import { cn } from "@/lib/utils";

const PLAN_KEYS = ["free", "pro", "enterprise"] as const;
const OTHER_PRICES: Record<"free" | "enterprise", number | null> = {
  free: 0,
  enterprise: null,
};
const PRO_PRICE = { monthly: 5.99, yearly: 60 } as const;
type Billing = keyof typeof PRO_PRICE;

export function Pricing() {
  const t = useTranslations("landing.pricing");
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section id="pricing" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">{t("eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
        <p className="mt-3 text-sm font-medium text-foreground">{t("contactNote")}</p>
      </Reveal>

      <Reveal className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/30 p-1">
          {(["monthly", "yearly"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setBilling(option)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                billing === option
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(option === "monthly" ? "billingMonthly" : "billingYearly")}
              {option === "yearly" && (
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                  {t("yearlyBadge")}
                </span>
              )}
            </button>
          ))}
        </div>
      </Reveal>

      <RevealGroup className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLAN_KEYS.map((plan) => {
          const isPopular = plan === "pro";
          const price = plan === "pro" ? PRO_PRICE[billing] : OTHER_PRICES[plan];
          const ctaIsWhatsApp = plan !== "free";
          const whatsappMessage =
            plan === "enterprise"
              ? t("enterpriseWhatsapp")
              : billing === "monthly"
                ? t("proWhatsappMonthly")
                : t("proWhatsappYearly");
          return (
            <RevealItem key={plan} className="h-full">
              <TiltCard maxTilt={isPopular ? 9 : 12} className={cn("h-full", isPopular && "lg:-translate-y-3")}>
                <Card
                  className={cn(
                    "relative flex h-full flex-col p-7",
                    isPopular && "glow-border border-primary/40 shadow-[0_0_60px_-15px_var(--primary)]",
                  )}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 px-3 py-1">
                      <Sparkles className="size-3" />
                      {t("mostPopular")}
                    </Badge>
                  )}
                  <h3 className="font-display text-lg font-semibold">{t(`plans.${plan}.name`)}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t(`plans.${plan}.description`)}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    {price === null ? (
                      <span className="font-display text-4xl font-bold">{t("custom")}</span>
                    ) : (
                      <>
                        <span className="font-display text-4xl font-bold">${price}</span>
                        <span className="text-sm text-muted-foreground">
                          {plan === "pro" && billing === "yearly" ? t("perYear") : t("perMonth")}
                        </span>
                      </>
                    )}
                  </div>
                  {plan === "pro" && billing === "yearly" && (
                    <p className="mt-1 text-xs font-medium text-success">{t("yearlyBadge")}</p>
                  )}

                  <Button variant={isPopular ? "glow" : "outline"} className="mt-6 w-full" asChild>
                    {ctaIsWhatsApp ? (
                      <a href={whatsappHref(whatsappMessage)} target="_blank" rel="noreferrer">
                        <MessageCircle className="size-4" />
                        {t(`plans.${plan}.cta`)}
                      </a>
                    ) : (
                      <Link href="/signup">{t(`plans.${plan}.cta`)}</Link>
                    )}
                  </Button>

                  <ul className="mt-7 space-y-3 text-sm">
                    {t.raw(`plans.${plan}.features`).map((feature: string) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        <span className="text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </TiltCard>
            </RevealItem>
          );
        })}
      </RevealGroup>

      {/* The people who bounce off this section are the ones with no time. */}
      <Reveal className="mt-10 text-center text-sm">
        <span className="text-muted-foreground">{t("serviceHint")} </span>
        <Link href="/services" className="font-medium text-accent underline-offset-4 hover:underline">
          {t("serviceLink")} →
        </Link>
      </Reveal>
    </section>
  );
}
