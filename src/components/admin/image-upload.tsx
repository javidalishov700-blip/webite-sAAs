"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useUploadImage } from "@/hooks/use-upload";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  shape?: "square" | "wide";
  className?: string;
}

export function ImageUpload({ value, onChange, shape = "square", className }: ImageUploadProps) {
  const t = useTranslations("common");
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const upload = useUploadImage();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      const result = await upload.mutateAsync(file);
      onChange(result.url);
    } catch {
      toast.error("Upload failed. Please try another image.");
      setPreview(value ?? null);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 transition-colors hover:border-primary/50",
          shape === "square" ? "aspect-square" : "aspect-video",
        )}
      >
        {preview ? (
          <Image src={preview} alt="" fill unoptimized className="object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-muted-foreground">
            <ImagePlus className="size-6" />
            <span className="text-xs font-medium">{t("upload")}</span>
          </div>
        )}

        {upload.isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Loader2 className="size-5 animate-spin text-white" />
          </div>
        )}

        {preview && !upload.isPending && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur">
              <Upload className="size-3.5" />
              {t("change")}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                onChange(null);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-destructive/80 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur"
            >
              <Trash2 className="size-3.5" />
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
