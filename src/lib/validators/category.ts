import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  icon: z.string().optional().nullable(),
  isVisible: z.boolean().optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const reorderCategoriesSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});
