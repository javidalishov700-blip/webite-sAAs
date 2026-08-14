import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { heartbeat, onlineCount } from "@/lib/data/presence";

const bodySchema = z.object({
  visitorId: z.string().min(8).max(80),
});

export async function GET() {
  return NextResponse.json({ count: Math.max(1, onlineCount()) });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const count = heartbeat(parsed.data.visitorId);
  return NextResponse.json({ count: Math.max(1, count) });
}
