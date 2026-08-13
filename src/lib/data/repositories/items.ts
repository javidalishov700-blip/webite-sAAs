import { db, generateId, nowIso } from "@/lib/data/store";
import type { AttributeType, Item, ItemAttribute, ItemWithAttributes } from "@/lib/data/types";

function withAttributes(item: Item): ItemWithAttributes {
  return {
    ...item,
    attributes: db.state.attributes
      .filter((a) => a.itemId === item.id)
      .sort((a, b) => a.position - b.position),
  };
}

export function listItemsByCompany(companyId: string): ItemWithAttributes[] {
  return db.state.items
    .filter((i) => i.companyId === companyId)
    .sort((a, b) => a.position - b.position)
    .map(withAttributes);
}

export function listItemsByCategory(categoryId: string, opts?: { onlyVisible?: boolean }): ItemWithAttributes[] {
  return db.state.items
    .filter((i) => i.categoryId === categoryId && (!opts?.onlyVisible || i.isVisible))
    .sort((a, b) => a.position - b.position)
    .map(withAttributes);
}

export function getItemById(id: string): ItemWithAttributes | undefined {
  const item = db.state.items.find((i) => i.id === id);
  return item ? withAttributes(item) : undefined;
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

export function createItem(input: CreateItemInput): ItemWithAttributes {
  const timestamp = nowIso();
  const siblings = db.state.items.filter((i) => i.categoryId === input.categoryId);
  const item: Item = {
    id: generateId("itm"),
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
    position: siblings.length,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  db.state.items.push(item);

  (input.attributes ?? []).forEach((attr, index) => {
    db.state.attributes.push({
      id: generateId("atr"),
      itemId: item.id,
      key: attr.key,
      value: attr.value,
      type: attr.type,
      unit: attr.unit ?? null,
      position: index,
    });
  });

  db.persist();
  return withAttributes(item);
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

export function updateItem(id: string, companyId: string, patch: UpdateItemInput): ItemWithAttributes | undefined {
  const item = db.state.items.find((i) => i.id === id && i.companyId === companyId);
  if (!item) return undefined;

  const { attributes, ...rest } = patch;
  Object.assign(item, rest, { updatedAt: nowIso() });

  if (attributes) {
    db.state.attributes = db.state.attributes.filter((a) => a.itemId !== id);
    attributes.forEach((attr, index) => {
      db.state.attributes.push({
        id: generateId("atr"),
        itemId: id,
        key: attr.key,
        value: attr.value,
        type: attr.type,
        unit: attr.unit ?? null,
        position: index,
      });
    });
  }

  db.persist();
  return withAttributes(item);
}

export function deleteItem(id: string, companyId: string): boolean {
  const idx = db.state.items.findIndex((i) => i.id === id && i.companyId === companyId);
  if (idx === -1) return false;
  db.state.items.splice(idx, 1);
  db.state.attributes = db.state.attributes.filter((a) => a.itemId !== id);
  db.persist();
  return true;
}

export function reorderItems(categoryId: string, orderedIds: string[]): ItemWithAttributes[] {
  orderedIds.forEach((id, index) => {
    const item = db.state.items.find((i) => i.id === id && i.categoryId === categoryId);
    if (item) item.position = index;
  });
  db.persist();
  return listItemsByCategory(categoryId);
}

export function setItemVisibility(id: string, companyId: string, isVisible: boolean): ItemWithAttributes | undefined {
  return updateItem(id, companyId, { isVisible });
}

export type { ItemAttribute };
