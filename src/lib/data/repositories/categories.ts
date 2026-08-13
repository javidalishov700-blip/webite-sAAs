import { db, generateId, nowIso } from "@/lib/data/store";
import type { Category } from "@/lib/data/types";

export function listCategoriesByCompany(companyId: string, opts?: { onlyVisible?: boolean }): Category[] {
  return db.state.categories
    .filter((c) => c.companyId === companyId && (!opts?.onlyVisible || c.isVisible))
    .sort((a, b) => a.position - b.position);
}

export function getCategoryById(id: string): Category | undefined {
  return db.state.categories.find((c) => c.id === id);
}

export function createCategory(input: { companyId: string; name: string; icon?: string | null }): Category {
  const timestamp = nowIso();
  const siblings = listCategoriesByCompany(input.companyId);
  const category: Category = {
    id: generateId("cat"),
    companyId: input.companyId,
    name: input.name,
    icon: input.icon ?? null,
    position: siblings.length,
    isVisible: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  db.state.categories.push(category);
  db.persist();
  return category;
}

export function updateCategory(
  id: string,
  companyId: string,
  patch: Partial<Pick<Category, "name" | "icon" | "isVisible">>,
): Category | undefined {
  const category = db.state.categories.find((c) => c.id === id && c.companyId === companyId);
  if (!category) return undefined;
  Object.assign(category, patch, { updatedAt: nowIso() });
  db.persist();
  return category;
}

export function deleteCategory(id: string, companyId: string): boolean {
  const idx = db.state.categories.findIndex((c) => c.id === id && c.companyId === companyId);
  if (idx === -1) return false;
  db.state.categories.splice(idx, 1);
  // Cascade delete items + their attributes, mirroring the Prisma `onDelete: Cascade`.
  const itemIdsToRemove = db.state.items.filter((i) => i.categoryId === id).map((i) => i.id);
  db.state.items = db.state.items.filter((i) => i.categoryId !== id);
  db.state.attributes = db.state.attributes.filter((a) => !itemIdsToRemove.includes(a.itemId));
  // Re-sequence remaining positions to avoid gaps.
  listCategoriesByCompany(companyId).forEach((c, index) => {
    c.position = index;
  });
  db.persist();
  return true;
}

export function reorderCategories(companyId: string, orderedIds: string[]): Category[] {
  orderedIds.forEach((id, index) => {
    const category = db.state.categories.find((c) => c.id === id && c.companyId === companyId);
    if (category) category.position = index;
  });
  db.persist();
  return listCategoriesByCompany(companyId);
}
