import { z } from "zod";

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
  industry: z.enum(["RESTAURANT", "RETAIL", "ELECTRONICS", "SERVICES", "OTHER"]),
});
export type SignupInput = z.infer<typeof signupSchema>;
