import "server-only";
import { putS3Object } from "@/lib/s3";

export interface UploadResult {
  url: string;
  bytes: number;
}

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // 6MB

function extensionFor(mime: string): string {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export async function uploadImage(file: Blob & { name?: string; type?: string }): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large. Please choose an image under 6MB.");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
  const key = `uploads/${crypto.randomUUID()}.${extensionFor(mime)}`;
  await putS3Object({ key, body: bytes, contentType: mime });
  return { url: `/api/media/${key}`, bytes: bytes.byteLength };
}

export function publicUploadError(error: unknown): string {
  const message = error instanceof Error ? error.message : "upload_failed";
  if (/too large/i.test(message)) return message;
  if (/Missing AWS_/i.test(message)) return "Image storage is not configured.";
  if (/AccessDenied|InvalidAccessKey|SignatureDoesNotMatch|Forbidden/i.test(message)) {
    return "Image storage credentials were rejected.";
  }
  return "Could not upload the image. Try a JPG or PNG under 6MB.";
}
