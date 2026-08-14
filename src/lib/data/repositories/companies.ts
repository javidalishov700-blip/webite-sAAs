import { db, generateId, nowIso } from "@/lib/data/store";
import type { Company, Industry } from "@/lib/data/types";

export function getCompanyById(id: string): Company | undefined {
  return db.state.companies.find((c) => c.id === id);
}

export function getCompanyBySlug(slug: string): Company | undefined {
  return db.state.companies.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

export function isSlugTaken(slug: string): boolean {
  return db.state.companies.some((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function generateUniqueSlug(name: string): string {
  const base = slugify(name) || "company";
  let candidate = base;
  let suffix = 1;
  while (isSlugTaken(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

export function createCompany(input: {
  name: string;
  industry: Industry;
  currency?: string;
  logoUrl?: string | null;
  accentColor?: string;
}): Company {
  const timestamp = nowIso();
  const company: Company = {
    id: generateId("cmp"),
    slug: generateUniqueSlug(input.name),
    name: input.name,
    description: null,
    logoUrl: input.logoUrl ?? null,
    coverUrl: null,
    industry: input.industry,
    plan: "FREE",
    currency: input.currency ?? "USD",
    defaultLocale: "en",
    supportedLocales: ["en"],
    accentColor: input.accentColor ?? "#7C5CFF",
    address: null,
    phone: null,
    website: null,
    isPublished: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  db.state.companies.push(company);
  db.persist();
  return company;
}

export function updateCompany(id: string, patch: Partial<Omit<Company, "id" | "createdAt">>): Company | undefined {
  const company = getCompanyById(id);
  if (!company) return undefined;
  Object.assign(company, patch, { updatedAt: nowIso() });
  db.persist();
  return company;
}

export function deleteCompany(id: string): boolean {
  if (!getCompanyById(id)) return false;
  const itemIds = new Set(db.state.items.filter((i) => i.companyId === id).map((i) => i.id));
  db.state.attributes = db.state.attributes.filter((a) => !itemIds.has(a.itemId));
  db.state.items = db.state.items.filter((i) => i.companyId !== id);
  db.state.categories = db.state.categories.filter((c) => c.companyId !== id);
  db.state.qrCodes = db.state.qrCodes.filter((q) => q.companyId !== id);
  db.state.scanEvents = db.state.scanEvents.filter((s) => s.companyId !== id);
  const memberUserIds = db.state.memberships.filter((m) => m.companyId === id).map((m) => m.userId);
  db.state.memberships = db.state.memberships.filter((m) => m.companyId !== id);
  for (const userId of memberUserIds) {
    if (!db.state.memberships.some((m) => m.userId === userId)) {
      db.state.users = db.state.users.filter((u) => u.id !== userId);
    }
  }
  db.state.companies = db.state.companies.filter((c) => c.id !== id);
  db.persist();
  return true;
}
