import { z } from "zod";
import { ABUSE_REASONS } from "@/lib/abuse-reasons";

export const abuseReportSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/i),
  reason: z.enum(ABUSE_REASONS),
  details: z.string().trim().max(500).optional(),
  locale: z.enum(["en", "ru", "tr", "az"]).optional(),
});
export type AbuseReportInput = z.infer<typeof abuseReportSchema>;
