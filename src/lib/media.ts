import "server-only";
import { putS3Object } from "@/lib/s3";
import { prisma } from "@/lib/prisma";

export interface UploadResult {
  url: string;
  bytes: number;
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function extensionFor(mime: string): string {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

async function storeInDatabase(bytes: Buffer, mime: string): Promise<UploadResult> {
  const row = await prisma.mediaFile.create({
    data: { contentType: mime, data: new Uint8Array(bytes) },
  });
  return { url: `/api/media/db/${row.id}`, bytes: bytes.byteLength };
}

export async function uploadImage(file: Blob & { name?: string; type?: string }): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large. Please choose an image under 8MB.");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";

  try {
    const key = `uploads/${crypto.randomUUID()}.${extensionFor(mime)}`;
    await putS3Object({ key, body: bytes, contentType: mime });
    return { url: `/api/media/${key}`, bytes: bytes.byteLength };
  } catch (error) {
    console.error("[uploads] object storage failed, saving in database:", error);
    return storeInDatabase(bytes, mime);
  }
}

export function publicUploadError(error: unknown): string {
  const message = error instanceof Error ? error.message : "upload_failed";
  if (/too large/i.test(message)) return message;
  return "Could not save the photo. Try again.";
}
