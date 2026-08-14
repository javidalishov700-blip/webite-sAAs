import { NextRequest, NextResponse } from "next/server";
import { loadPublicCatalog } from "@/lib/data/load-public-catalog";

interface Params {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params;
  const company = await loadPublicCatalog(slug);
  if (!company) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ company });
}
