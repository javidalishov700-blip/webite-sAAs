"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { useUploadImage } from "@/hooks/use-upload";
import { ImageCropDialog } from "@/components/admin/image-crop-dialog";
import type { ImageShape } from "@/lib/crop-image";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  shape?: ImageShape;
  className?: string;
}

export function ImageUpload({ value, onChange, shape = "square", className }: ImageUploadProps) {
  const t = useTranslations("common");
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const upload = useUploadImage();

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("cropInvalid"));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleCropped(file: File) {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      const result = await upload.mutateAsync(file);
      onChange(result.url);
      URL.revokeObjectURL(objectUrl);
      setPreview(result.url);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("cropFailed"));
      setPreview(value ?? null);
      URL.revokeObjectURL(objectUrl);
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
          shape === "square" && "aspect-square",
          shape === "photo" && "aspect-[4/3]",
          shape === "wide" && "aspect-video",
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

      <ImageCropDialog
        src={cropSrc}
        shape={shape}
        open={Boolean(cropSrc)}
        onOpenChange={(open) => {
          if (!open && cropSrc) {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }
        }}
        onConfirm={handleCropped}
      />
    </div>
  );
}
