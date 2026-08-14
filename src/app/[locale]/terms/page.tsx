import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingChrome } from "@/components/landing/marketing-chrome";
import { LegalArticle } from "@/components/landing/legal-article";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.terms" });
  return { title: t("title") };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages.terms" });
  const sections = t.raw("sections") as { heading: string; body: string[] }[];

  return (
    <MarketingChrome>
      <LegalArticle
        eyebrow={t("eyebrow")}
        title={t("title")}
        updated={t("updated")}
        intro={t("intro")}
        sections={sections}
      />
    </MarketingChrome>
  );
}
