import "server-only";
import { prisma } from "@/lib/prisma";
import { mapItem } from "@/lib/data/map";
import type { AttributeType, ItemAttribute, ItemWithAttributes } from "@/lib/data/types";

export async function listItemsByCompany(companyId: string): Promise<ItemWithAttributes[]> {
  const rows = await prisma.item.findMany({
    where: { companyId },
    include: { attributes: { orderBy: { position: "asc" } } },
    orderBy: { position: "asc" },
  });
  return rows.map(mapItem);
}

export async function listItemsByCategory(
  categoryId: string,
  opts?: { onlyVisible?: boolean },
): Promise<ItemWithAttributes[]> {
  const rows = await prisma.item.findMany({
    where: {
      categoryId,
      ...(opts?.onlyVisible ? { isVisible: true } : {}),
    },
    include: { attributes: { orderBy: { position: "asc" } } },
    orderBy: { position: "asc" },
  });
  return rows.map(mapItem);
}

export async function getItemById(id: string): Promise<ItemWithAttributes | undefined> {
  const row = await prisma.item.findUnique({
    where: { id },
    include: { attributes: { orderBy: { position: "asc" } } },
  });
  return row ? mapItem(row) : undefined;
}

export interface ItemAttributeInput {
  key: string;
  value: string;
  type: AttributeType;
  unit?: string | null;
}

export interface CreateItemInput {
  companyId: string;
  categoryId: string;
  title: string;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  images?: string[];
  isVisible?: boolean;
  isFeatured?: boolean;
  stockCount?: number | null;
  attributes?: ItemAttributeInput[];
}

export async function createItem(input: CreateItemInput): Promise<ItemWithAttributes> {
  const siblings = await prisma.item.count({ where: { categoryId: input.categoryId } });
  const row = await prisma.item.create({
    data: {
      companyId: input.companyId,
      categoryId: input.categoryId,
      title: input.title,
      description: input.description ?? null,
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      currency: input.currency,
      images: input.images ?? [],
      isVisible: input.isVisible ?? true,
      isFeatured: input.isFeatured ?? false,
      stockCount: input.stockCount ?? null,
      position: siblings,
      attributes: {
        create: (input.attributes ?? []).map((attr, index) => ({
          key: attr.key,
          value: attr.value,
          type: attr.type,
          unit: attr.unit ?? null,
          position: index,
        })),
      },
    },
    include: { attributes: { orderBy: { position: "asc" } } },
  });
  return mapItem(row);
}

export interface UpdateItemInput {
  title?: string;
  description?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  currency?: string;
  images?: string[];
  isVisible?: boolean;
  isFeatured?: boolean;
  stockCount?: number | null;
  categoryId?: string;
  attributes?: ItemAttributeInput[];
}

export async function updateItem(
  id: string,
  companyId: string,
  patch: UpdateItemInput,
): Promise<ItemWithAttributes | undefined> {
  const existing = await prisma.item.findFirst({ where: { id, companyId } });
  if (!existing) return undefined;

  const { attributes, ...rest } = patch;
  const row = await prisma.$transaction(async (tx) => {
    if (attributes) {
      await tx.itemAttribute.deleteMany({ where: { itemId: id } });
      if (attributes.length) {
        await tx.itemAttribute.createMany({
          data: attributes.map((attr, index) => ({
            itemId: id,
            key: attr.key,
            value: attr.value,
            type: attr.type,
            unit: attr.unit ?? null,
            position: index,
          })),
        });
      }
    }
    return tx.item.update({
      where: { id },
      data: rest,
      include: { attributes: { orderBy: { position: "asc" } } },
    });
  });
  return mapItem(row);
}

export async function duplicateItem(id: string, companyId: string): Promise<ItemWithAttributes | undefined> {
  const item = await getItemById(id);
  if (!item || item.companyId !== companyId) return undefined;
  return createItem({
    companyId,
    categoryId: item.categoryId,
    title: `${item.title} (copy)`,
    description: item.description,
    price: item.price,
    compareAtPrice: item.compareAtPrice,
    currency: item.currency,
    images: [...item.images],
    isVisible: item.isVisible,
    isFeatured: false,
    stockCount: item.stockCount,
    attributes: item.attributes.map((a) => ({ key: a.key, value: a.value, type: a.type, unit: a.unit })),
  });
}

export async function deleteItem(id: string, companyId: string): Promise<boolean> {
  const result = await prisma.item.deleteMany({ where: { id, companyId } });
  return result.count > 0;
}

export async function reorderItems(categoryId: string, orderedIds: string[]): Promise<ItemWithAttributes[]> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.item.updateMany({
        where: { id, categoryId },
        data: { position: index },
      }),
    ),
  );
  return listItemsByCategory(categoryId);
}

export async function setItemVisibility(
  id: string,
  companyId: string,
  isVisible: boolean,
): Promise<ItemWithAttributes | undefined> {
  return updateItem(id, companyId, { isVisible });
}

export type { ItemAttribute };
