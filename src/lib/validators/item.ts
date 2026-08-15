import { z } from "zod";

/**
 * `z.coerce.number()` runs `Number(value)` under the hood, and `Number("")`
 * is `0` (not `NaN`) — so an empty numeric input would silently coerce to a
 * real `0` instead of "not provided". Stripping empty strings/null to
 * `undefined` first makes blank optional number fields behave as expected.
 */
const emptyToUndefined = (val: unknown) => (val === "" || val === null ? undefined : val);
const optionalNumber = (schema: z.ZodNumber) => z.preprocess(emptyToUndefined, schema.optional().nullable());
const requiredNumber = (schema: z.ZodNumber) => z.preprocess(emptyToUndefined, schema);

export const attributeSchema = z.object({
  key: z.string().trim().min(1, "Attribute name is required").max(60),
  value: z.string().max(400),
  type: z.enum(["TEXT", "NUMBER", "BOOLEAN", "LIST"]),
  unit: z.preprocess(emptyToUndefined, z.string().max(20).optional().nullable()),
});
export type AttributeInput = z.infer<typeof attributeSchema>;

/** Drop blank "Add attribute" rows (empty key) before validating the rest. */
function dropBlankAttributes(val: unknown) {
  if (!Array.isArray(val)) return val;
  return val.filter((row) => {
    if (!row || typeof row !== "object") return false;
    return String((row as { key?: unknown }).key ?? "").trim().length > 0;
  });
}

export const itemSchema = z.object({
  categoryId: z.string().min(1, "Pick a category"),
  title: z.string().min(1, "Title is required").max(100),
  description: z.preprocess(emptyToUndefined, z.string().max(2000).optional().nullable()),
  price: requiredNumber(z.coerce.number().min(0, "Price must be 0 or more")),
  compareAtPrice: optionalNumber(z.coerce.number().min(0)),
  currency: z.string().min(3).max(3),
  images: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  stockCount: optionalNumber(z.coerce.number().int().min(0)),
  attributes: z.preprocess(dropBlankAttributes, z.array(attributeSchema).default([])),
});
export type ItemInput = z.infer<typeof itemSchema>;
/** Pre-parse shape used by the form (defaulted fields are optional until submit-time validation fills them in). */
export type ItemFormValues = z.input<typeof itemSchema>;

/** Same as the item API, but category can be created from a typed name on save. */
export const productFormSchema = itemSchema.extend({
  categoryId: z.string().optional().default(""),
});
export type ProductFormValues = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;

export const reorderItemsSchema = z.object({
  categoryId: z.string().min(1),
  orderedIds: z.array(z.string()).min(1),
});
