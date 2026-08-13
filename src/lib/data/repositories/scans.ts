import { db, generateId, nowIso } from "@/lib/data/store";
import type { AppLocale, ScanEvent } from "@/lib/data/types";

export function recordScan(input: {
  companyId: string;
  qrCodeId?: string | null;
  locale: AppLocale;
  device?: string | null;
}): ScanEvent {
  const scan: ScanEvent = {
    id: generateId("scn"),
    companyId: input.companyId,
    qrCodeId: input.qrCodeId ?? null,
    createdAt: nowIso(),
    locale: input.locale,
    device: input.device ?? null,
  };
  db.state.scanEvents.push(scan);
  if (input.qrCodeId) {
    const qr = db.state.qrCodes.find((q) => q.id === input.qrCodeId);
    if (qr) qr.scans += 1;
  }
  db.persist();
  return scan;
}
