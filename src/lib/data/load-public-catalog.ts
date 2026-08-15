import "server-only";
import { getStaticLiveDemoCatalog, PUBLIC_SHOWCASE_SLUG } from "@/lib/data/public-showcase";
import type { CompanyPublicView } from "@/lib/data/types";

function isLiveDemoSlug(slug: string): boolean {
  return slug.toLowerCase() === PUBLIC_SHOWCASE_SLUG;
}

/**
 * Loads a public catalog. Prisma is imported lazily so a missing query engine
 * or dead DATABASE_URL cannot crash the module graph. Live Kitchen always has
 * a static fallback.
 */
export async function loadPublicCatalog(
  slug: string,
  opts?: {
    ownerPreview?: boolean;
    viewer?: { companyId: string; isPlatformAdmin: boolean } | null;
    qrId?: string | null;
  },
): Promise<CompanyPublicView | null> {
  try {
    const { getPublicCatalogBySlug } = await import("@/lib/data/repositories/catalog");
    const company = await getPublicCatalogBySlug(slug, opts);
    if (company) return company;
  } catch (error) {
    console.error("[catalog] database unavailable:", error);
  }
  if (isLiveDemoSlug(slug)) return getStaticLiveDemoCatalog();
  return null;
}
