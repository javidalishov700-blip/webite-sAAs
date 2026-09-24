import { useTranslations } from "next-intl";
import { Check, MessageCircle, Printer, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/reveal";
import { whatsappHref } from "@/lib/site";
import { MANAGED_PLANS, SERVICE_CURRENCY, SETUP_PACKAGES } from "@/lib/services";
import { cn } from "@/lib/utils";

type Step = { title: string; body: string };

export function ServicePackages() {
  const t = useTranslations("pages.services");

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-20 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </Reveal>

      <Reveal className="mt-14 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{t("setupTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("setupSubtitle")}</p>
      </Reveal>

      <RevealGroup className="mt-8 grid gap-5 lg:grid-cols-3" stagger={0.07}>
        {SETUP_PACKAGES.map((plan) => {
          const features = t.raw(`packages.${plan.key}.features`) as string[];
          const isSelfServe = plan.price === 0;
          return (
            <RevealItem key={plan.key}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border p-6",
                  "featured" in plan && plan.featured
                    ? "glow-ring border-primary/40 bg-primary/5"
                    : "border-border/70 bg-card/60",
                )}
              >
                {"featured" in plan && plan.featured ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-[11px] font-semibold text-white">
                    {t("popular")}
                  </span>
                ) : null}

                <p className="font-display text-lg font-semibold">{t(`packages.${plan.key}.name`)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t(`packages.${plan.key}.tagline`)}</p>

                <div className="mt-5 flex items-baseline gap-2">
                  {isSelfServe ? (
                    <span className="font-display text-3xl font-bold">{t("free")}</span>
                  ) : (
                    <>
                      <span className="font-display text-4xl font-bold">{plan.price}</span>
                      <span className="font-display text-lg font-semibold text-muted-foreground">
                        {SERVICE_CURRENCY}
                      </span>
                      <span className="text-xs text-muted-foreground">{t("oneOff")}</span>
                    </>
                  )}
                </div>

                <ul className="mt-6 space-y-2.5 text-sm">
                  {features.map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 pt-1">
                  {isSelfServe ? (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/signup">{t(`packages.${plan.key}.cta`)}</Link>
                    </Button>
                  ) : (
                    <Button
                      variant={"featured" in plan && plan.featured ? "glow" : "outline"}
                      className="w-full"
                      asChild
                    >
                      <a
                        href={whatsappHref(t(`whatsapp.${plan.key}`))}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="size-4" />
                        {t(`packages.${plan.key}.cta`)}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </RevealItem>
          );
        })}
      </RevealGroup>

      <Reveal className="mt-16 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{t("monthlyTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("monthlySubtitle")}</p>
      </Reveal>

      <RevealGroup className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2" stagger={0.07}>
        {MANAGED_PLANS.map((plan) => (
          <RevealItem key={plan.key}>
            <div
              className={cn(
                "flex h-full flex-col rounded-3xl border p-6",
                "featured" in plan && plan.featured
                  ? "border-accent/40 bg-accent/5"
                  : "border-border/70 bg-card/60",
              )}
            >
              <p className="font-display text-lg font-semibold">{t(`plans.${plan.key}.name`)}</p>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-bold">{plan.price}</span>
                <span className="font-display text-base font-semibold text-muted-foreground">
                  {SERVICE_CURRENCY}
                </span>
                <span className="text-sm text-muted-foreground">{t("perMonth")}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(`plans.${plan.key}.body`)}</p>
              {"featured" in plan && plan.featured ? (
                <Button variant="outline" className="mt-5" asChild>
                  <a href={whatsappHref(t("whatsapp.managed"))} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" />
                    {t("ctaButton")}
                  </a>
                </Button>
              ) : null}
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal className="mx-auto mt-16 max-w-3xl rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
        <div className="flex gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
            <Printer className="size-5" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold">{t("whyTitle")}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("whyBody")}</p>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-16 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{t("stepsTitle")}</h2>
      </Reveal>

      <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
        {(t.raw("steps") as Step[]).map((step, i) => (
          <RevealItem key={step.title}>
            <div className="h-full rounded-2xl border border-border/70 bg-card/60 p-5">
              <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent font-display text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="mt-3 font-display text-base font-semibold">{step.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal className="mt-14 rounded-3xl border border-primary/20 bg-primary/5 p-7 text-center">
        <Sparkles className="mx-auto size-5 text-accent" />
        <p className="mt-3 font-display text-xl font-semibold">{t("ctaTitle")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("ctaBody")}</p>
        <Button variant="glow" className="mt-6" asChild>
          <a href={whatsappHref(t("whatsapp.general"))} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" />
            {t("ctaButton")}
          </a>
        </Button>
      </Reveal>

      <Reveal className="mt-8 text-center text-xs text-muted-foreground">{t("note")}</Reveal>
    </section>
  );
}
