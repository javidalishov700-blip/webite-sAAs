"use client";

import { useEffect } from "react";

/**
 * Records a QR scan only when the visitor arrived with `?qr=` and was not
 * already counted by `/api/qr/:id/go` (`scanned=1`). Direct catalog visits
 * are not scans.
 */
export function CatalogScanTracker({
  slug,
  locale,
  qrId,
  alreadyRecorded,
}: {
  slug: string;
  locale: string;
  qrId?: string | null;
  alreadyRecorded?: boolean;
}) {
  useEffect(() => {
    if (alreadyRecorded || !qrId) return;
    const key = `qru-scan:${slug}:${qrId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // private mode — still attempt the record
    }

    fetch("/api/scans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, locale, qrCodeId: qrId }),
      keepalive: true,
    }).catch(() => {
      try {
        sessionStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    });
  }, [slug, locale, qrId, alreadyRecorded]);

  return null;
}
