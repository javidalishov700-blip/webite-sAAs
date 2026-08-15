import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStaticLiveDemoCatalog, PUBLIC_SHOWCASE_SLUG } from "@/lib/data/public-showcase";
import { loadPublicCatalog } from "@/lib/data/load-public-catalog";
import { CatalogView } from "@/components/catalog/catalog-view";
import { CatalogScanTracker } from "@/components/catalog/catalog-scan-tracker";
import type { CompanyPublicView } from "@/lib/data/types";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ qr?: string; scanned?: string; preview?: string }>;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isLiveDemo(slug: string): boolean {
  return slug.toLowerCase() === PUBLIC_SHOWCASE_SLUG;
}

async function catalogForSlug(
  slug: string,
  preview = false,
  qrId?: string | null,
): Promise<CompanyPublicView | null> {
  if (isLiveDemo(slug)) return getStaticLiveDemoCatalog();
  if (preview) {
    const { getCurrentUser } = await import("@/lib/auth/guard");
    const user = await getCurrentUser();
    if (user) {
      return loadPublicCatalog(slug, {
        ownerPreview: true,
        viewer: { companyId: user.companyId, isPlatformAdmin: user.isPlatformAdmin },
        qrId,
      });
    }
  }
  return loadPublicCatalog(slug, { qrId });
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const company = await catalogForSlug(slug, query.preview === "1", query.qr ?? null);
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
  const preview = query.preview === "1";
  const company = await catalogForSlug(slug, preview, query.qr ?? null);
  if (!company) notFound();

  return (
    <div className="relative min-h-[100svh] bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-background" />
      {!preview ? (
        <CatalogScanTracker
          slug={company.slug}
          locale={locale}
          qrId={query.qr ?? null}
          alreadyRecorded={query.scanned === "1"}
        />
      ) : null}
      <CatalogView company={company} locale={locale} preview={preview} />
    </div>
  );
}
