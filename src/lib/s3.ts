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
let bucketReady = false;

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
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
  return client;
}

export async function ensureS3Bucket(): Promise<string> {
  const bucket = getS3Bucket();
  if (bucketReady) return bucket;
  try {
    await getS3Client().send(new CreateBucketCommand({ Bucket: bucket }));
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    const message = error instanceof Error ? error.message : String(error);
    if (!/BucketAlreadyOwnedByYou|BucketAlreadyExists|Conflict|409/i.test(`${name} ${message}`)) {
      throw error;
    }
  }
  bucketReady = true;
  return bucket;
}

export async function putS3Object(input: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<void> {
  const bucket = await ensureS3Bucket();
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
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
