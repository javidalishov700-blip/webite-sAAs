import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.hero" });
  const description = t("subtitle");
  return {
    description,
    // Full openGraph/twitter objects live here (not split with the root
    // layout) because a child segment's openGraph replaces the parent's
    // wholesale rather than merging key by key.
    openGraph: {
      title: "QR-Universe",
      description,
      siteName: "QR-Universe",
      type: "website",
      locale,
      images: ["/icon-512.png"],
    },
    twitter: {
      card: "summary",
      title: "QR-Universe",
      description,
      images: ["/icon-512.png"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <Providers locale={locale}>{children}</Providers>
    </NextIntlClientProvider>
  );
}
