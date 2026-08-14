export const queryKeys = {
  categories: ["categories"] as const,
  items: ["items"] as const,
  qrCodes: ["qr-codes"] as const,
  analytics: ["analytics"] as const,
  company: ["company"] as const,
  catalog: (slug: string) => ["catalog", slug] as const,
  opsWorkspaces: (q: string) => ["ops-workspaces", q] as const,
  opsReports: ["ops-reports"] as const,
  opsInspect: (id: string) => ["ops-inspect", id] as const,
  opsMail: ["ops-mail"] as const,
};
