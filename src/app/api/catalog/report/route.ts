import { NextRequest, NextResponse } from "next/server";
import { abuseReportSchema } from "@/lib/validators/abuse";
import { getCompanyBySlug } from "@/lib/data/repositories/companies";
import { createAbuseReport, isAbuseReportRateLimited } from "@/lib/data/repositories/abuse";
import { getRequestIp, getUserAgent, hashIp } from "@/lib/request-meta";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = abuseReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const company = await getCompanyBySlug(parsed.data.slug);
  if (!company || !company.isPublished) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const ip = getRequestIp(request);
  const ipHash = ip ? hashIp(ip) : null;
  if (await isAbuseReportRateLimited(ipHash)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const details = parsed.data.details?.trim();
  await createAbuseReport({
    companyId: company.id,
    reason: parsed.data.reason,
    details: details || null,
    locale: parsed.data.locale,
    ipHash,
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ ok: true });
}
