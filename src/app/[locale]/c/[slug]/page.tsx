import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicCatalogBySlug } from "@/lib/data/repositories/catalog";
import { CatalogView } from "@/components/catalog/catalog-view";
import { CatalogScanTracker } from "@/components/catalog/catalog-scan-tracker";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ qr?: string; scanned?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getPublicCatalogBySlug(slug);
  if (!company) return { title: "Catalog not found" };
  return {
    title: company.name,
    description: company.description ?? `Browse the ${company.name} digital catalog, powered by QR-Universe.`,
    openGraph: {
      title: company.name,
      description: company.description ?? undefined,
      images: company.coverUrl ? [company.coverUrl] : undefined,
    },
    appleWebApp: {
      capable: true,
      title: company.name,
      statusBarStyle: "black-translucent",
    },
  };
}

export default async function PublicCatalogPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params;
  const query = await searchParams;
  const company = await getPublicCatalogBySlug(slug);
  if (!company) notFound();

  return (
    <div className="relative min-h-[100svh] bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-background" />
      <CatalogScanTracker
        slug={company.slug}
        locale={locale}
        qrId={query.qr ?? null}
        alreadyRecorded={query.scanned === "1"}
      />
      <CatalogView company={company} locale={locale} />
    </div>
  );
}
