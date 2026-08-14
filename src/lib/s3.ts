import {
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

let client: S3Client | null = null;

export function getS3Bucket(): string {
  return process.env.AWS_S3_BUCKET || "qr-universe";
}

export function getS3Client(): S3Client {
  if (client) return client;
  client = new S3Client({
    region: process.env.AWS_REGION || "us-east-2",
    endpoint: required("AWS_ENDPOINT_URL_S3"),
    credentials: {
      accessKeyId: required("AWS_ACCESS_KEY_ID"),
      secretAccessKey: required("AWS_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: true,
    // Neon/S3-compatible stores reject the extra checksum headers AWS SDK v3 sends by default.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

async function ensureBucketExists(): Promise<string> {
  const bucket = getS3Bucket();
  try {
    await getS3Client().send(new CreateBucketCommand({ Bucket: bucket }));
  } catch (error) {
    const text = `${error instanceof Error ? error.name : ""} ${error instanceof Error ? error.message : String(error)}`;
    if (!/BucketAlreadyOwnedByYou|BucketAlreadyExists|Conflict|409|AccessDenied|Forbidden|403/i.test(text)) {
      throw error;
    }
  }
  return bucket;
}

export async function putS3Object(input: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<void> {
  const bucket = getS3Bucket();
  const payload = {
    Bucket: bucket,
    Key: input.key,
    Body: input.body,
    ContentType: input.contentType,
    ContentLength: input.body.byteLength,
    CacheControl: "public, max-age=31536000, immutable",
  };

  try {
    await getS3Client().send(new PutObjectCommand(payload));
  } catch (error) {
    const text = `${error instanceof Error ? error.name : ""} ${error instanceof Error ? error.message : String(error)}`;
    if (!/NoSuchBucket|NotFound|404/i.test(text)) throw error;
    await ensureBucketExists();
    await getS3Client().send(new PutObjectCommand(payload));
  }
}

export async function getS3Object(key: string) {
  const bucket = getS3Bucket();
  return getS3Client().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}
