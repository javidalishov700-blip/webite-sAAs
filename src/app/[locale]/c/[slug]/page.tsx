import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStaticLiveDemoCatalog, PUBLIC_SHOWCASE_SLUG } from "@/lib/data/public-showcase";
import { loadPublicCatalog } from "@/lib/data/load-public-catalog";
import { CatalogView } from "@/components/catalog/catalog-view";
import { CatalogScanTracker } from "@/components/catalog/catalog-scan-tracker";
import { appBaseUrl } from "@/lib/site";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/constants";
import { localizedPath } from "@/lib/catalog-url";
import type { CompanyPublicView } from "@/lib/data/types";

const SCHEMA_TYPE_BY_INDUSTRY: Partial<Record<CompanyPublicView["industry"], string>> = {
  RESTAURANT: "Restaurant",
  GROCERY: "GroceryStore",
  RETAIL: "Store",
  ELECTRONICS: "ElectronicsStore",
  HARDWARE: "HardwareStore",
  HOME: "HomeGoodsStore",
};

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
  const { locale, slug } = await params;
  const query = await searchParams;
  const company = await catalogForSlug(slug, query.preview === "1", query.qr ?? null);
  if (!company) return { title: "Catalog not found" };

  const description = company.description ?? `Browse the ${company.name} digital catalog, powered by QR-Universe.`;
  const image = company.coverUrl ?? company.logoUrl ?? undefined;
  const origin = appBaseUrl();
  const catalogLocales = company.supportedLocales.length ? company.supportedLocales : LOCALES;

  return {
    title: company.name,
    description,
    // Each locale is real, distinct content (not a duplicate) — self-canonical
    // plus hreflang alternates is the correct pattern here, not one shared canonical.
    alternates: {
      canonical: `${origin}${localizedPath(locale, `/c/${slug}`)}`,
      languages: {
        ...Object.fromEntries(catalogLocales.map((l) => [l, `${origin}${localizedPath(l, `/c/${slug}`)}`])),
        "x-default": `${origin}${localizedPath(DEFAULT_LOCALE, `/c/${slug}`)}`,
      },
    },
    openGraph: {
      title: company.name,
      description,
      type: "website",
      locale,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: company.name,
      description,
      images: image ? [image] : undefined,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE_BY_INDUSTRY[company.industry] ?? "LocalBusiness",
    name: company.name,
    description: company.description ?? undefined,
    image: company.coverUrl ?? company.logoUrl ?? undefined,
    address: company.address ? { "@type": "PostalAddress", streetAddress: company.address } : undefined,
    telephone: company.phone ?? undefined,
    url: `${appBaseUrl()}${localizedPath(locale, `/c/${company.slug}`)}`,
  };

  return (
    <div className="relative min-h-[100svh] bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-background" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
