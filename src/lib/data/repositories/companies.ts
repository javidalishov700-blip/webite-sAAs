import "server-only";
import { prisma } from "@/lib/prisma";
import { mapCompany } from "@/lib/data/map";
import type { Company, Industry } from "@/lib/data/types";

export async function getCompanyById(id: string): Promise<Company | undefined> {
  const row = await prisma.company.findUnique({ where: { id } });
  return row ? mapCompany(row) : undefined;
}

export async function getCompanyBySlug(slug: string): Promise<Company | undefined> {
  const row = await prisma.company.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" } },
  });
  return row ? mapCompany(row) : undefined;
}

export async function isSlugTaken(slug: string): Promise<boolean> {
  const count = await prisma.company.count({
    where: { slug: { equals: slug, mode: "insensitive" } },
  });
  return count > 0;
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

export async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "company";
  let candidate = base;
  let suffix = 1;
  while (await isSlugTaken(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

export async function createCompany(input: {
  name: string;
  industry: Industry;
  currency?: string;
  logoUrl?: string | null;
  accentColor?: string;
}): Promise<Company> {
  const row = await prisma.company.create({
    data: {
      slug: await generateUniqueSlug(input.name),
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
    },
  });
  return mapCompany(row);
}

export async function updateCompany(
  id: string,
  patch: Partial<Omit<Company, "id" | "createdAt">>,
): Promise<Company | undefined> {
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) return undefined;
  const { updatedAt: _ignored, ...rest } = patch;
  const row = await prisma.company.update({
    where: { id },
    data: rest,
  });
  return mapCompany(row);
}

export async function deleteCompany(id: string): Promise<boolean> {
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) return false;

  const members = await prisma.membership.findMany({ where: { companyId: id } });
  await prisma.company.delete({ where: { id } });

  for (const member of members) {
    const remaining = await prisma.membership.count({ where: { userId: member.userId } });
    if (remaining === 0) {
      await prisma.user.delete({ where: { id: member.userId } }).catch(() => undefined);
    }
  }
  return true;
}
