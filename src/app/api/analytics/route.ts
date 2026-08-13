import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { getAnalyticsSummary } from "@/lib/data/repositories/analytics";

export async function GET() {
  const { user, response } = await requireSession();
  if (!user) return response!;
  return NextResponse.json({ summary: getAnalyticsSummary(user.companyId) });
}
