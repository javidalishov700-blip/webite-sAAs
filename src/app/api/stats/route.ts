import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onlineCount } from "@/lib/data/presence";

export const dynamic = "force-dynamic";

export async function GET() {
  const [scans, catalogs, online] = await Promise.all([
    prisma.scanEvent.count(),
    prisma.company.count({ where: { isPublished: true } }),
    onlineCount("site"),
  ]);

  return NextResponse.json({
    scans,
    catalogs,
    languages: 4,
    online,
  });
}
