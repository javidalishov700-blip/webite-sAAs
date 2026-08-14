import type { Plan } from "@/lib/data/types";

export type OpsProtectedReason = "live_demo" | "platform_admin";

export type OpsWorkspace = {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  isPublished: boolean;
  bannedAt: string | null;
  bannedReason: string | null;
  createdAt: string;
  itemCount: number;
  reportCount: number;
  owners: { name: string; email: string }[];
  protected: boolean;
  protectedReason: OpsProtectedReason | null;
};

export type OpsReport = {
  id: string;
  createdAt: string;
  reason: string;
  details: string | null;
  locale: string | null;
  companyId: string;
  companyName: string;
  companySlug: string;
};
