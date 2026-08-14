import { z } from "zod";
import { INDUSTRY_VALUES } from "@/lib/industries";

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
});
export type SignupInput = z.infer<typeof signupSchema>;
