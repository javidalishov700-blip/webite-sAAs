import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingChrome } from "@/components/landing/marketing-chrome";
import { ServicePackages } from "@/components/landing/service-packages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.services" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <MarketingChrome>
      <div className="pt-16">
        <ServicePackages />
      </div>
    </MarketingChrome>
  );
}
