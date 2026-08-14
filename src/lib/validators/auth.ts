import { z } from "zod";
import { INDUSTRY_VALUES } from "@/lib/industries";

const localeSchema = z.enum(["en", "ru", "tr", "az"]).optional();

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(2, "Please enter your full name").max(80),
  email: z.string().email(),
  password: z.string().min(6, "Use at least 6 characters"),
  companyName: z.string().min(2).max(80),
  industry: z.enum(INDUSTRY_VALUES),
  acceptedTerms: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms to create an account",
  }),
  locale: localeSchema,
});
export type SignupInput = z.infer<typeof signupSchema>;

export const emailLocaleSchema = z.object({
  email: z.string().email(),
  locale: localeSchema,
});
export type EmailLocaleInput = z.infer<typeof emailLocaleSchema>;

export const verifyTokenSchema = z.object({
  token: z.string().min(16).max(128),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16).max(128),
  password: z.string().min(6, "Use at least 6 characters"),
});
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "Use at least 6 characters"),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
