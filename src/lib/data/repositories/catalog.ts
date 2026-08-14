import { getCompanyBySlug } from "@/lib/data/repositories/companies";
import { listCategoriesByCompany } from "@/lib/data/repositories/categories";
import { listItemsByCategory } from "@/lib/data/repositories/items";
import { ensureLiveDemoCatalog } from "@/lib/data/ensure-live-demo";
import type { CompanyPublicView } from "@/lib/data/types";

/** Hydrates the full public-facing catalog tree (visible categories + visible items) for a company slug. */
export async function getPublicCatalogBySlug(slug: string): Promise<CompanyPublicView | null> {
  await ensureLiveDemoCatalog();
  const company = await getCompanyBySlug(slug);
  if (!company || !company.isPublished) return null;

  const categories = await Promise.all(
    (await listCategoriesByCompany(company.id, { onlyVisible: true })).map(async (category) => ({
      ...category,
      items: await listItemsByCategory(category.id, { onlyVisible: true }),
    })),
  );

  return { ...company, categories };
}
