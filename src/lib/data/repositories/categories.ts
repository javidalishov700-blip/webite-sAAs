import "server-only";
import { prisma } from "@/lib/prisma";
import { mapCategory } from "@/lib/data/map";
import type { Category } from "@/lib/data/types";

export async function listCategoriesByCompany(
  companyId: string,
  opts?: { onlyVisible?: boolean },
): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    where: {
      companyId,
      ...(opts?.onlyVisible ? { isVisible: true } : {}),
    },
    orderBy: { position: "asc" },
  });
  return rows.map(mapCategory);
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const row = await prisma.category.findUnique({ where: { id } });
  return row ? mapCategory(row) : undefined;
}

export async function createCategory(input: {
  companyId: string;
  name: string;
  icon?: string | null;
}): Promise<Category> {
  const siblings = await prisma.category.count({ where: { companyId: input.companyId } });
  const row = await prisma.category.create({
    data: {
      companyId: input.companyId,
      name: input.name,
      icon: input.icon ?? null,
      position: siblings,
      isVisible: true,
    },
  });
  return mapCategory(row);
}

export async function updateCategory(
  id: string,
  companyId: string,
  patch: Partial<Pick<Category, "name" | "icon" | "isVisible">>,
): Promise<Category | undefined> {
  const existing = await prisma.category.findFirst({ where: { id, companyId } });
  if (!existing) return undefined;
  const row = await prisma.category.update({
    where: { id },
    data: patch,
  });
  return mapCategory(row);
}

export async function deleteCategory(id: string, companyId: string): Promise<boolean> {
  const existing = await prisma.category.findFirst({ where: { id, companyId } });
  if (!existing) return false;
  await prisma.category.delete({ where: { id } });
  const remaining = await prisma.category.findMany({
    where: { companyId },
    orderBy: { position: "asc" },
  });
  await prisma.$transaction(
    remaining.map((category, index) =>
      prisma.category.update({ where: { id: category.id }, data: { position: index } }),
    ),
  );
  return true;
}

export async function reorderCategories(companyId: string, orderedIds: string[]): Promise<Category[]> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.updateMany({
        where: { id, companyId },
        data: { position: index },
      }),
    ),
  );
  return listCategoriesByCompany(companyId);
}
