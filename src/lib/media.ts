import "server-only";

/**
 * Mock cloud media service. No object storage is provisioned in this
 * environment, so uploads are converted to data URLs and persisted inline
 * with the rest of the mock database. The signature mirrors what a real
 * S3/Cloudinary/Vercel Blob integration would look like — swap the body of
 * `uploadImage` for a real SDK call and every caller keeps working.
 */
export interface UploadResult {
  url: string;
  bytes: number;
}

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // 6MB

export async function uploadImage(file: File): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large. Please choose an image under 6MB.");
  }
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mime = file.type || "image/png";
  return { url: `data:${mime};base64,${base64}`, bytes: bytes.byteLength };
}
