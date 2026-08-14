import { NextRequest, NextResponse } from "next/server";
import { getS3Object } from "@/lib/s3";

interface Params {
  params: Promise<{ key: string[] }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { key: parts } = await params;
  const key = parts.join("/");
  if (!key || key.includes("..")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
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
