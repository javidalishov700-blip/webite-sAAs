import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarketingChrome } from "@/components/landing/marketing-chrome";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.careers" });
  return { title: t("title") };
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages.careers" });

  return (
    <MarketingChrome>
      <article className="mx-auto max-w-3xl px-5 pt-32 pb-20 sm:px-6">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">{t("eyebrow")}</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("lead")}</p>
        <Button variant="glow" className="mt-8" asChild>
          <Link href="/contact">{t("cta")}</Link>
        </Button>
      </article>
    </MarketingChrome>
  );
}
