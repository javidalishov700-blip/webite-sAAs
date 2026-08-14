import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { heartbeat, onlineCount } from "@/lib/data/presence";

const bodySchema = z.object({
  visitorId: z.string().min(8).max(80),
  scope: z
    .string()
    .min(1)
    .max(80)
    .regex(/^(site|catalog:[a-z0-9-]+)$/i)
    .default("site"),
});

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") ?? "site";
  if (!/^(site|catalog:[a-z0-9-]+)$/i.test(scope)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  try {
    const count = await onlineCount(scope);
    return NextResponse.json({ count });
  } catch (error) {
    console.error("[presence]", error);
    return NextResponse.json({ count: 0 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const count = await heartbeat(parsed.data.visitorId, parsed.data.scope);
    return NextResponse.json({ count });
  } catch (error) {
    console.error("[presence]", error);
    return NextResponse.json({ count: 0 });
  }
}
