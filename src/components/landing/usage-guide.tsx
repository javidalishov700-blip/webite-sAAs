import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/reveal";
import { whatsappHref } from "@/lib/site";
import { TutorialPlayer } from "@/components/landing/tutorial-player";

type Step = { title: string; body: string };

export function UsageGuide() {
  const t = useTranslations("pages.guide");
  const steps = t.raw("steps") as Step[];

  return (
    <section className="relative mx-auto max-w-4xl px-5 py-20 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">{t("eyebrow")}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </Reveal>

      <Reveal className="mt-12">
        <TutorialPlayer />
        <p className="mt-3 text-center text-xs text-muted-foreground">{t("videoNote")}</p>
      </Reveal>

      <RevealGroup className="mt-12 space-y-4" stagger={0.06}>
        {steps.map((step, i) => (
          <RevealItem key={step.title}>
            <div className="flex gap-4 rounded-2xl border border-border/70 bg-card/60 p-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent font-display text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-display text-base font-semibold">{step.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
        <p className="font-display text-lg font-semibold">{t("helpTitle")}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("helpBody")}</p>
        <div className="mt-5 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button variant="glow" asChild>
            <Link href="/signup">{t("startCta")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={whatsappHref(t("whatsappMessage"))} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" />
              {t("helpCta")}
            </a>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
