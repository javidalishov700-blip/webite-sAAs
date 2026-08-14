import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { publicUploadError, uploadImage } from "@/lib/media";

export const runtime = "nodejs";

function isImageBlob(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value !== "string" &&
    typeof (value as File).arrayBuffer === "function" &&
    typeof (value as File).size === "number" &&
    (value as File).size > 0
  );
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireSession();
  if (!user) return response!;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file") ?? null;
  if (!isImageBlob(file)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }
  const mime = "type" in file ? String(file.type || "") : "";
  if (mime && !mime.startsWith("image/") && mime !== "application/octet-stream") {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  try {
    const result = await uploadImage(file);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[uploads]", error);
    return NextResponse.json({ error: publicUploadError(error) }, { status: 400 });
  }
}
