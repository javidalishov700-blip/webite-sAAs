import type { Area } from "react-easy-crop";

export type ImageShape = "square" | "photo" | "wide";

export const IMAGE_SHAPE = {
  square: { aspect: 1, width: 800, height: 800 },
  photo: { aspect: 4 / 3, width: 1200, height: 900 },
  wide: { aspect: 16 / 9, width: 1280, height: 720 },
} as const satisfies Record<ImageShape, { aspect: number; width: number; height: number }>;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Could not load image")));
    image.src = src;
  });
}

export async function cropImageToBlob(imageSrc: string, pixelCrop: Area, shape: ImageShape): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const { width, height } = IMAGE_SHAPE[shape];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not crop image");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  if (!blob) throw new Error("Could not crop image");
  return blob;
}
