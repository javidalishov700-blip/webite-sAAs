import "server-only";
import { getCompanyBySlug } from "@/lib/data/repositories/companies";
import { listCategoriesByCompany } from "@/lib/data/repositories/categories";
import { listItemsByCategory } from "@/lib/data/repositories/items";
import { ensureLiveDemoCatalog } from "@/lib/data/ensure-live-demo";
import { getStaticLiveDemoCatalog, PUBLIC_SHOWCASE_SLUG } from "@/lib/data/public-showcase";
import type { CompanyPublicView } from "@/lib/data/types";

function isLiveDemoSlug(slug: string): boolean {
  return slug.toLowerCase() === PUBLIC_SHOWCASE_SLUG;
}

/** Hydrates the full public-facing catalog tree (visible categories + visible items) for a company slug. */
export async function getPublicCatalogBySlug(slug: string): Promise<CompanyPublicView | null> {
  if (isLiveDemoSlug(slug)) {
    await ensureLiveDemoCatalog();
  }

  const company = await getCompanyBySlug(slug);
  if (!company || !company.isPublished || company.bannedAt) {
    return isLiveDemoSlug(slug) ? getStaticLiveDemoCatalog() : null;
  }

  const categories = await Promise.all(
    (await listCategoriesByCompany(company.id, { onlyVisible: true })).map(async (category) => ({
      ...category,
      items: await listItemsByCategory(category.id, { onlyVisible: true }),
    })),
  );

  if (isLiveDemoSlug(slug) && categories.every((category) => category.items.length === 0)) {
    return getStaticLiveDemoCatalog();
  }

  return { ...company, categories };
}
