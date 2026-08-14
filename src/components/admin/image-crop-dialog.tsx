"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cropImageToBlob, IMAGE_SHAPE, type ImageShape } from "@/lib/crop-image";

export function ImageCropDialog({
  src,
  shape,
  open,
  onOpenChange,
  onConfirm,
}: {
  src: string | null;
  shape: ImageShape;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File) => void;
}) {
  const t = useTranslations("common");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_area: Area, croppedPixels: Area) => {
    setPixels(croppedPixels);
  }, []);

  async function handleApply() {
    if (!src || !pixels) return;
    setBusy(true);
    try {
      const blob = await cropImageToBlob(src, pixels, shape);
      onConfirm(new File([blob], "photo.jpg", { type: "image/jpeg" }));
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setPixels(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-xl overflow-hidden p-5 sm:p-6" showClose={!busy}>
        <DialogHeader>
          <DialogTitle>{t("cropTitle")}</DialogTitle>
          <DialogDescription>{t("cropHint")}</DialogDescription>
        </DialogHeader>

        <div className="relative h-[min(52vh,380px)] w-full overflow-hidden rounded-xl bg-black">
          {src ? (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={IMAGE_SHAPE[shape].aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
              showGrid
            />
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="crop-zoom" className="text-xs font-medium text-muted-foreground">
            {t("cropZoom")}
          </label>
          <input
            id="crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button type="button" variant="glow" loading={busy} disabled={!pixels} onClick={handleApply}>
            {t("cropApply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
