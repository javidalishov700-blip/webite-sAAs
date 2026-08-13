import { NextRequest, NextResponse } from "next/server";
import { getPublicCatalogBySlug } from "@/lib/data/repositories/catalog";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params;
  const company = getPublicCatalogBySlug(slug);
  if (!company) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ company });
}
