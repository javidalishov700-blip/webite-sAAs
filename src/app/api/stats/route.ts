import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onlineCount } from "@/lib/data/presence";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
  } catch (error) {
    console.error("[stats]", error);
    return NextResponse.json({ scans: 0, catalogs: 0, languages: 4, online: 0 });
  }
}
