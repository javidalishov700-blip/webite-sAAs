import { z } from "zod";

export const attributeSchema = z.object({
  key: z.string().min(1).max(40),
  value: z.string().max(400),
  type: z.enum(["TEXT", "NUMBER", "BOOLEAN", "LIST"]),
  unit: z.string().max(20).optional().nullable(),
});
export type AttributeInput = z.infer<typeof attributeSchema>;

export const itemSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  currency: z.string().min(3).max(3),
  images: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  stockCount: z.coerce.number().int().min(0).optional().nullable(),
  attributes: z.array(attributeSchema).default([]),
});
export type ItemInput = z.infer<typeof itemSchema>;

export const reorderItemsSchema = z.object({
  categoryId: z.string().min(1),
  orderedIds: z.array(z.string()).min(1),
});
