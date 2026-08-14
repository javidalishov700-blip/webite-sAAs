import type {
  AttributeType,
  Category,
  Company,
  Industry,
  Item,
  ItemAttribute,
  ItemWithAttributes,
  Membership,
  Plan,
  QrCode,
  QrDotStyle,
  Role,
  ScanEvent,
  AppLocale,
  User,
} from "@/lib/data/types";

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function money(value: { toString(): string } | number | null | undefined): number | null {
  if (value == null) return null;
  return typeof value === "number" ? value : Number(value);
}

export function mapUser(row: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    avatarUrl: row.avatarUrl,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function mapMembership(row: {
  id: string;
  role: Role;
  userId: string;
  companyId: string;
  createdAt: Date;
}): Membership {
  return {
    id: row.id,
    role: row.role,
    userId: row.userId,
    companyId: row.companyId,
    createdAt: iso(row.createdAt),
  };
}

export function mapCompany(row: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  industry: Industry;
  plan: Plan;
  currency: string;
  defaultLocale: AppLocale;
  supportedLocales: AppLocale[];
  accentColor: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Company {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    logoUrl: row.logoUrl,
    coverUrl: row.coverUrl,
    industry: row.industry,
    plan: row.plan,
    currency: row.currency,
    defaultLocale: row.defaultLocale,
    supportedLocales: row.supportedLocales,
    accentColor: row.accentColor,
    address: row.address,
    phone: row.phone,
    website: row.website,
    isPublished: row.isPublished,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function mapCategory(row: {
  id: string;
  companyId: string;
  name: string;
  icon: string | null;
  position: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Category {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    icon: row.icon,
    position: row.position,
    isVisible: row.isVisible,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function mapAttribute(row: {
  id: string;
  itemId: string;
  key: string;
  value: string;
  type: AttributeType;
  unit: string | null;
  position: number;
}): ItemAttribute {
  return {
    id: row.id,
    itemId: row.itemId,
    key: row.key,
    value: row.value,
    type: row.type,
    unit: row.unit,
    position: row.position,
  };
}

export function mapItem(row: {
  id: string;
  companyId: string;
  categoryId: string;
  title: string;
  description: string | null;
  price: { toString(): string } | number;
  compareAtPrice: { toString(): string } | number | null;
  currency: string;
  images: string[];
  isVisible: boolean;
  isFeatured: boolean;
  stockCount: number | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  attributes?: Parameters<typeof mapAttribute>[0][];
}): ItemWithAttributes {
  const item: Item = {
    id: row.id,
    companyId: row.companyId,
    categoryId: row.categoryId,
    title: row.title,
    description: row.description,
    price: money(row.price) ?? 0,
    compareAtPrice: money(row.compareAtPrice),
    currency: row.currency,
    images: row.images,
    isVisible: row.isVisible,
    isFeatured: row.isFeatured,
    stockCount: row.stockCount,
    position: row.position,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
  return {
    ...item,
    attributes: (row.attributes ?? []).map(mapAttribute).sort((a, b) => a.position - b.position),
  };
}

export function mapQr(row: {
  id: string;
  companyId: string;
  name: string;
  targetUrl: string;
  dotsColor: string;
  backgroundColor: string;
  dotsStyle: QrDotStyle;
  cornerStyle: QrDotStyle;
  logoUrl: string | null;
  scans: number;
  createdAt: Date;
  updatedAt: Date;
}): QrCode {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    targetUrl: row.targetUrl,
    dotsColor: row.dotsColor,
    backgroundColor: row.backgroundColor,
    dotsStyle: row.dotsStyle,
    cornerStyle: row.cornerStyle,
    logoUrl: row.logoUrl,
    scans: row.scans,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function mapScan(row: {
  id: string;
  companyId: string;
  qrCodeId: string | null;
  createdAt: Date;
  locale: AppLocale;
  device: string | null;
}): ScanEvent {
  return {
    id: row.id,
    companyId: row.companyId,
    qrCodeId: row.qrCodeId,
    createdAt: iso(row.createdAt),
    locale: row.locale,
    device: row.device,
  };
}
