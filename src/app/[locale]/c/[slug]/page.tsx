import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPublicCatalogBySlug } from "@/lib/data/repositories/catalog";
import { recordScan } from "@/lib/data/repositories/scans";
import { listQrCodesByCompany } from "@/lib/data/repositories/qr";
import { CatalogView } from "@/components/catalog/catalog-view";
import type { AppLocale } from "@/lib/data/types";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = getPublicCatalogBySlug(slug);
  if (!company) return { title: "Catalog not found" };
  return {
    title: company.name,
    description: company.description ?? `Browse the ${company.name} digital catalog, powered by QR-Universe.`,
    openGraph: {
      title: company.name,
      description: company.description ?? undefined,
      images: company.coverUrl ? [company.coverUrl] : undefined,
    },
  };
}

export default async function PublicCatalogPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const company = getPublicCatalogBySlug(slug);
  if (!company) notFound();

  const headerList = await headers();
  const isPrefetch = headerList.get("next-router-prefetch") === "1" || headerList.get("purpose") === "prefetch";
  if (!isPrefetch) {
    const userAgent = headerList.get("user-agent") ?? "";
    const device = /mobile|android|iphone/i.test(userAgent) ? "mobile" : "desktop";
    const [primaryQr] = listQrCodesByCompany(company.id);
    recordScan({ companyId: company.id, qrCodeId: primaryQr?.id, locale: locale as AppLocale, device });
  }

  return <CatalogView company={company} locale={locale} />;
}
