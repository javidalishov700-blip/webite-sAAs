import "server-only";
import { prisma } from "@/lib/prisma";
import { mapScan } from "@/lib/data/map";
import type { AppLocale, ScanEvent } from "@/lib/data/types";

export async function recordScan(input: {
  companyId: string;
  qrCodeId?: string | null;
  locale: AppLocale;
  device?: string | null;
}): Promise<ScanEvent> {
  const scan = await prisma.$transaction(async (tx) => {
    const created = await tx.scanEvent.create({
      data: {
        companyId: input.companyId,
        qrCodeId: input.qrCodeId ?? null,
        locale: input.locale,
        device: input.device ?? null,
      },
    });
    if (input.qrCodeId) {
      await tx.qrCode.update({
        where: { id: input.qrCodeId },
        data: { scans: { increment: 1 } },
      });
    }
    return created;
  });
  return mapScan(scan);
}
