import { NextRequest, NextResponse } from "next/server";
import { getQrCodeByIdPublic } from "@/lib/data/repositories/qr";
import { getCompanyById } from "@/lib/data/repositories/companies";
import { recordScan } from "@/lib/data/repositories/scans";
import { catalogPath, qrClosedPath } from "@/lib/catalog-url";
import { DEFAULT_LOCALE } from "@/lib/constants";

interface Params {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sendTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

/**
 * Public QR landing: record a scan against the specific code, then send the
 * visitor to the live catalog. Encoded into every Studio / onboarding QR so
 * analytics stay accurate even when JavaScript is unavailable.
 *
 * Never returns raw JSON — phone cameras would show `{ error: "not_found" }`.
 */
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const qr = await getQrCodeByIdPublic(decodeURIComponent(id));
  if (!qr) {
    return sendTo(request, qrClosedPath(DEFAULT_LOCALE, "missing"));
  }

  const company = await getCompanyById(qr.companyId);
  if (!company || company.bannedAt) {
    return sendTo(request, qrClosedPath(company?.defaultLocale ?? DEFAULT_LOCALE, company?.bannedAt ? "banned" : "missing"));
  }
  // The Settings "Catalog is public" toggle has to actually stop the main
  // traffic path — a printed QR sticker doesn't stop working just because
  // scans never hit the catalog page's own (separate) publish check.
  if (!company.isPublished) {
    return sendTo(request, qrClosedPath(company.defaultLocale, "unpublished"));
  }
  if (!qr.isActive) {
    return sendTo(request, qrClosedPath(company.defaultLocale, "paused"));
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
