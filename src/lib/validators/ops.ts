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
  z.object({
    action: z.literal("publish"),
  }),
  z.object({
    action: z.literal("unpublish"),
  }),
  z.object({
    action: z.literal("verifyEmail"),
  }),
  z.object({
    action: z.literal("setQrActive"),
    qrId: z.string().min(1),
    isActive: z.boolean(),
  }),
  z.object({
    action: z.literal("setAllQrs"),
    isActive: z.boolean(),
  }),
]);
