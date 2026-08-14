/**
 * Domain types mirroring `prisma/schema.prisma` 1:1. These are the contracts
 * every repository, API route and UI component programs against, so that the
 * in-memory mock store can be swapped for a real `@prisma/client` later
 * without touching call sites.
 */

export type Role = "OWNER" | "ADMIN" | "EDITOR";

export type Industry =
  | "RESTAURANT"
  | "GROCERY"
  | "RETAIL"
  | "HOME"
  | "HARDWARE"
  | "EDUCATION"
  | "ELECTRONICS"
  | "TOBACCO"
  | "SERVICES"
  | "OTHER";

export type Plan = "FREE" | "PRO" | "ENTERPRISE";

export type AttributeType = "TEXT" | "NUMBER" | "BOOLEAN" | "LIST";

export type QrDotStyle =
  | "SQUARE"
  | "DOTS"
  | "ROUNDED"
  | "CLASSY"
  | "CLASSY_ROUNDED"
  | "EXTRA_ROUNDED";

export type AppLocale = "en" | "ru" | "tr" | "az";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  role: Role;
  userId: string;
  companyId: string;
  createdAt: string;
}

export interface Company {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  industry: Industry;
  plan: Plan;
  currency: string;
  defaultLocale: AppLocale;
  supportedLocales: AppLocale[];
  accentColor: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  companyId: string;
  name: string;
  icon?: string | null;
  position: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  companyId: string;
  categoryId: string;
  title: string;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  images: string[];
  isVisible: boolean;
  isFeatured: boolean;
  stockCount?: number | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItemAttribute {
  id: string;
  itemId: string;
  key: string;
  value: string;
  type: AttributeType;
  unit?: string | null;
  position: number;
}

export interface QrCode {
  id: string;
  companyId: string;
  name: string;
  targetUrl: string;
  dotsColor: string;
  backgroundColor: string;
  dotsStyle: QrDotStyle;
  cornerStyle: QrDotStyle;
  logoUrl?: string | null;
  scans: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScanEvent {
  id: string;
  companyId: string;
  qrCodeId?: string | null;
  createdAt: string;
  locale: AppLocale;
  device?: string | null;
}

// ---------------------------------------------------------------------------
// Composite / hydrated view models used by the UI layer
// ---------------------------------------------------------------------------

export interface ItemWithAttributes extends Item {
  attributes: ItemAttribute[];
}

export interface CategoryWithItems extends Category {
  items: ItemWithAttributes[];
}

export interface CompanyPublicView extends Company {
  categories: CategoryWithItems[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  companyId: string;
  companyName: string;
  companySlug: string;
  role: Role;
}

export interface AnalyticsSummary {
  totalScans: number;
  scansLast7Days: number;
  scansTrendPct: number;
  totalItems: number;
  visibleItems: number;
  totalCategories: number;
  scansOverTime: { date: string; scans: number }[];
  topItems: { itemId: string; title: string; scans: number }[];
  localeBreakdown: { locale: AppLocale; count: number }[];
}
