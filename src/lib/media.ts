import "server-only";
import { putS3Object } from "@/lib/s3";

export interface UploadResult {
  url: string;
  bytes: number;
}

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // 6MB

function extensionFor(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

export async function uploadImage(file: File): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large. Please choose an image under 6MB.");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/png";
  const key = `uploads/${crypto.randomUUID()}.${extensionFor(mime)}`;
  await putS3Object({ key, body: bytes, contentType: mime });
  return { url: `/api/media/${key}`, bytes: bytes.byteLength };
}
