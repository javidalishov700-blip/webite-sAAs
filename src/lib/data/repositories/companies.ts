import { db, generateId, nowIso } from "@/lib/data/store";
import type { Company, Industry } from "@/lib/data/types";
import { INDUSTRY_META } from "@/lib/constants";

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

  // Seed a friendly starter category for the chosen industry so the new
  // tenant's dashboard never looks empty during onboarding.
  const sampleCategory = INDUSTRY_META[input.industry]?.sampleCategories[0];
  if (sampleCategory) {
    db.state.categories.push({
      id: generateId("cat"),
      companyId: company.id,
      name: sampleCategory,
      icon: INDUSTRY_META[input.industry].icon,
      position: 0,
      isVisible: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

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
