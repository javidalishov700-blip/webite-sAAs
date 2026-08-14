import { z } from "zod";
import { INDUSTRY_VALUES } from "@/lib/industries";

export const companySettingsSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional().nullable(),
  currency: z.string().min(3).max(3),
  defaultLocale: z.enum(["en", "ru", "tr", "az"]),
  supportedLocales: z.array(z.enum(["en", "ru", "tr", "az"])).min(1),
  accentColor: z.string().min(3),
  address: z.string().max(160).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  website: z.string().max(160).optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  industry: z.enum(INDUSTRY_VALUES).optional(),
});
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;

export const onboardingSchema = z.object({
  companyName: z.string().min(2).max(80),
  industry: z.enum(INDUSTRY_VALUES),
  logoUrl: z.string().optional().nullable(),
  accentColor: z.string().min(3).optional(),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;
