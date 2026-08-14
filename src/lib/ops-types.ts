import type { Plan } from "@/lib/data/types";

export type OpsProtectedReason = "live_demo" | "platform_admin";

export type OpsQr = {
  id: string;
  name: string;
  isActive: boolean;
  scans: number;
  targetUrl?: string;
};

export type OpsOwner = {
  name: string;
  email: string;
  emailVerified: boolean;
};

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
  qrCount: number;
  owners: OpsOwner[];
  qrCodes: OpsQr[];
  emailVerified: boolean;
  protected: boolean;
  protectedReason: OpsProtectedReason | null;
};

export type OpsInspectItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  images: string[];
  isVisible: boolean;
  isFeatured: boolean;
  stockCount: number | null;
  attributes: { key: string; value: string; type: string; unit: string | null }[];
};

export type OpsInspectCategory = {
  id: string;
  name: string;
  icon: string | null;
  isVisible: boolean;
  items: OpsInspectItem[];
};

export type OpsInspect = {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  industry: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  accentColor: string;
  currency: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  isPublished: boolean;
  bannedAt: string | null;
  bannedReason: string | null;
  createdAt: string;
  owners: OpsOwner[];
  qrCodes: Required<OpsQr>[];
  categories: OpsInspectCategory[];
};

export type OpsMailStatus = {
  configured: boolean;
  from: string;
  usingOnboardingDomain: boolean;
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
