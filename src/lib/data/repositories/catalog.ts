import { getCompanyBySlug } from "@/lib/data/repositories/companies";
import { listCategoriesByCompany } from "@/lib/data/repositories/categories";
import { listItemsByCategory } from "@/lib/data/repositories/items";
import type { CompanyPublicView } from "@/lib/data/types";

/** Hydrates the full public-facing catalog tree (visible categories + visible items) for a company slug. */
export function getPublicCatalogBySlug(slug: string): CompanyPublicView | null {
  const company = getCompanyBySlug(slug);
  if (!company || !company.isPublished) return null;

  const categories = listCategoriesByCompany(company.id, { onlyVisible: true }).map((category) => ({
    ...category,
    items: listItemsByCategory(category.id, { onlyVisible: true }),
  }));

  return { ...company, categories };
}
