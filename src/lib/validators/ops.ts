import { z } from "zod";

export const opsWorkspacePatchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("ban"),
    reason: z.string().trim().max(300).optional(),
  }),
  z.object({
    action: z.literal("unban"),
  }),
  z.object({
    action: z.literal("setPlan"),
    plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
  }),
]);
