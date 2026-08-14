import type { Area } from "react-easy-crop";

export type ImageShape = "square" | "photo" | "wide";

export const IMAGE_SHAPE = {
  square: { aspect: 1, width: 800, height: 800 },
  photo: { aspect: 4 / 3, width: 1200, height: 900 },
  wide: { aspect: 16 / 9, width: 1280, height: 720 },
} as const satisfies Record<ImageShape, { aspect: number; width: number; height: number }>;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Could not load image")));
    image.src = src;
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        const bytes = atob(dataUrl.split(",")[1] ?? "");
        const buffer = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i += 1) buffer[i] = bytes.charCodeAt(i);
        resolve(new Blob([buffer], { type: "image/jpeg" }));
      } catch {
        reject(new Error("Could not crop image"));
      }
    }, "image/jpeg", 0.88);
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
  return canvasToJpegBlob(canvas);
}
