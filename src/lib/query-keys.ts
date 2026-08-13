export const queryKeys = {
  categories: ["categories"] as const,
  items: ["items"] as const,
  qrCodes: ["qr-codes"] as const,
  analytics: ["analytics"] as const,
  company: ["company"] as const,
  catalog: (slug: string) => ["catalog", slug] as const,
};
