import { NextRequest, NextResponse } from "next/server";
import { getCompanyBySlug } from "@/lib/data/repositories/companies";
import { listCategoriesByCompany } from "@/lib/data/repositories/categories";
import { listItemsByCategory } from "@/lib/data/repositories/items";
import type { CompanyPublicView } from "@/lib/data/types";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company || !company.isPublished) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const categories = listCategoriesByCompany(company.id, { onlyVisible: true }).map((category) => ({
    ...category,
    items: listItemsByCategory(category.id, { onlyVisible: true }),
  }));

  const payload: CompanyPublicView = { ...company, categories };
  return NextResponse.json({ company: payload });
}
