import { z } from "zod";
import { INDUSTRY_VALUES } from "@/lib/industries";

const GOOGLE_HOST = /^(?:[a-z0-9-]+\.)*google\.(?:com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/;

/**
 * The catalog labels this link "Google", so it may only point at Google:
 * a Maps page, a review link from Business Profile, or Google's short links.
 */
export function isGoogleUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return GOOGLE_HOST.test(host) || host === "g.page" || host === "g.co" || host === "goo.gl" || host.endsWith(".goo.gl");
  } catch {
    return false;
  }
}

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
  googleReviewUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => value === "" || isGoogleUrl(value), "google_url")
    .optional()
    .nullable(),
  googleRating: z.number().min(1).max(5).optional().nullable(),
  googleReviewCount: z.number().int().min(0).max(10_000_000).optional().nullable(),
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
