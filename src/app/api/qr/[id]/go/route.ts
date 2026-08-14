import { NextRequest, NextResponse } from "next/server";
import { getQrCodeByIdPublic } from "@/lib/data/repositories/qr";
import { getCompanyById } from "@/lib/data/repositories/companies";
import { recordScan } from "@/lib/data/repositories/scans";
import { catalogPath } from "@/lib/catalog-url";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * Public QR landing: record a scan against the specific code, then send the
 * visitor to the live catalog. Encoded into every Studio / onboarding QR so
 * analytics stay accurate even when JavaScript is unavailable.
 */
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const qr = await getQrCodeByIdPublic(id);
  if (!qr) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const company = await getCompanyById(qr.companyId);
  if (!company || !company.isPublished || company.bannedAt || !qr.isActive) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const device = /mobile|android|iphone/i.test(request.headers.get("user-agent") ?? "") ? "mobile" : "desktop";
  await recordScan({
    companyId: company.id,
    qrCodeId: qr.id,
    locale: company.defaultLocale,
    device,
  });

  const destination = new URL(catalogPath(company.slug, company.defaultLocale), request.url);
  destination.searchParams.set("scanned", "1");
  destination.searchParams.set("qr", qr.id);
  return NextResponse.redirect(destination);
}
