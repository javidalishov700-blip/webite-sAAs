import { createHash } from "crypto";
import type { NextRequest } from "next/server";

export function getRequestIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const raw =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "";
  return raw || null;
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export function getUserAgent(request: NextRequest): string | null {
  const ua = request.headers.get("user-agent")?.trim();
  if (!ua) return null;
  return ua.slice(0, 300);
}
