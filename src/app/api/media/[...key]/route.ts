import { NextRequest, NextResponse } from "next/server";
import { getS3Object } from "@/lib/s3";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ key: string[] }>;
}

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: Params) {
  const { key: parts } = await params;
  const key = parts.join("/");
  if (!key || key.includes("..")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (parts[0] === "db" && parts[1]) {
    const row = await prisma.mediaFile.findUnique({ where: { id: parts[1] } });
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return new NextResponse(Buffer.from(row.data), {
      headers: {
        "Content-Type": row.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  try {
    const object = await getS3Object(key);
    const body = object.Body;
    if (!body) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const bytes = await body.transformToByteArray();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": object.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
