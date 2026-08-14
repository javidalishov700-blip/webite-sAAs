import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, MessageCircle } from "lucide-react";
import { MarketingChrome } from "@/components/landing/marketing-chrome";
import { Button } from "@/components/ui/button";
import { SITE, telHref } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.contact" });
  return { title: t("title") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages.contact" });

  return (
    <MarketingChrome>
      <article className="mx-auto max-w-3xl px-5 pt-32 pb-20 sm:px-6">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">{t("eyebrow")}</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("lead")}</p>

        <div className="glass-card glow-border mt-10 space-y-6 rounded-3xl p-8">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("phoneLabel")}</p>
            <a href={telHref()} className="mt-2 block font-display text-3xl font-bold text-gradient">
              {SITE.phoneDisplay}
            </a>
            <p className="mt-2 text-sm text-muted-foreground">{t("hours")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="glow" size="lg" asChild>
              <a href={telHref()}>
                <Phone className="size-4" />
                {t("call")}
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href={SITE.whatsapp} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </article>
    </MarketingChrome>
  );
}
