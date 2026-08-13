import { z } from "zod";

const dotStyleEnum = z.enum(["SQUARE", "DOTS", "ROUNDED", "CLASSY", "CLASSY_ROUNDED", "EXTRA_ROUNDED"]);

export const qrSchema = z.object({
  name: z.string().min(1).max(60),
  targetUrl: z.string().min(1),
  dotsColor: z.string().min(3),
  backgroundColor: z.string().min(3),
  dotsStyle: dotStyleEnum,
  cornerStyle: dotStyleEnum,
  logoUrl: z.string().optional().nullable(),
});
export type QrInput = z.infer<typeof qrSchema>;
