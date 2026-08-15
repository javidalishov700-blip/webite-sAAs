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

export type CatalogViewer = {
  companyId: string;
  isPlatformAdmin: boolean;
};

/** Hydrates the catalog tree for a company slug. */
export async function getPublicCatalogBySlug(
  slug: string,
  opts?: { ownerPreview?: boolean; viewer?: CatalogViewer | null; qrId?: string | null },
): Promise<CompanyPublicView | null> {
  if (isLiveDemoSlug(slug)) {
    await ensureLiveDemoCatalog();
  }

  const company = await getCompanyBySlug(slug);
  const canDraft =
    Boolean(opts?.ownerPreview) &&
    Boolean(company) &&
    Boolean(opts?.viewer) &&
    (opts!.viewer!.isPlatformAdmin || opts!.viewer!.companyId === company!.id);

  let viaQr = false;
  if (company && opts?.qrId) {
    const { getQrCodeByIdPublic } = await import("@/lib/data/repositories/qr");
    const qr = await getQrCodeByIdPublic(opts.qrId);
    viaQr = Boolean(qr && qr.companyId === company.id && qr.isActive);
  }

  if (!company || (company.bannedAt && !opts?.viewer?.isPlatformAdmin) || (!company.isPublished && !canDraft && !viaQr)) {
    return isLiveDemoSlug(slug) ? getStaticLiveDemoCatalog() : null;
  }

  const onlyVisible = !canDraft;
  const categories = await Promise.all(
    (await listCategoriesByCompany(company.id, { onlyVisible })).map(async (category) => ({
      ...category,
      items: await listItemsByCategory(category.id, { onlyVisible }),
    })),
  );

  if (isLiveDemoSlug(slug) && categories.every((category) => category.items.length === 0)) {
    return getStaticLiveDemoCatalog();
  }

  return { ...company, categories };
}
