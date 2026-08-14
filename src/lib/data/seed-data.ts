import type {
  Category,
  Company,
  Item,
  ItemAttribute,
  Membership,
  QrCode,
  ScanEvent,
  User,
} from "@/lib/data/types";

export interface SeedDb {
  users: User[];
  memberships: Membership[];
  companies: Company[];
  categories: Category[];
  items: Item[];
  attributes: ItemAttribute[];
  qrCodes: QrCode[];
  scanEvents: ScanEvent[];
}

/** Fresh workspaces start empty. Operators create their own categories and items. */
export function buildSeedDb(): SeedDb {
  return {
    users: [],
    memberships: [],
    companies: [],
    categories: [],
    items: [],
    attributes: [],
    qrCodes: [],
    scanEvents: [],
  };
}

const DEMO_EMAILS = new Set(["demo@bellafoods.com", "demo@urbansole.com", "demo@nexustech.com"]);
const DEMO_SLUGS = new Set(["bella-foods", "urban-sole", "nexustech"]);

/** Removes leftover demo tenants from an on-disk snapshot. */
export function stripDemoTenants<T extends SeedDb>(data: T): T {
  const demoUserIds = new Set(data.users.filter((u) => DEMO_EMAILS.has(u.email.toLowerCase())).map((u) => u.id));
  const demoCompanyIds = new Set(
    data.companies
      .filter(
        (c) =>
          DEMO_SLUGS.has(c.slug) ||
          data.memberships.some((m) => m.companyId === c.id && demoUserIds.has(m.userId)),
      )
      .map((c) => c.id),
  );
  if (demoCompanyIds.size === 0 && demoUserIds.size === 0) return data;

  const itemIds = new Set(data.items.filter((i) => demoCompanyIds.has(i.companyId)).map((i) => i.id));
  const qrIds = new Set(data.qrCodes.filter((q) => demoCompanyIds.has(q.companyId)).map((q) => q.id));

  return {
    ...data,
    users: data.users.filter((u) => !demoUserIds.has(u.id)),
    memberships: data.memberships.filter((m) => !demoCompanyIds.has(m.companyId) && !demoUserIds.has(m.userId)),
    companies: data.companies.filter((c) => !demoCompanyIds.has(c.id)),
    categories: data.categories.filter((c) => !demoCompanyIds.has(c.companyId)),
    items: data.items.filter((i) => !demoCompanyIds.has(i.companyId)),
    attributes: data.attributes.filter((a) => !itemIds.has(a.itemId)),
    qrCodes: data.qrCodes.filter((q) => !qrIds.has(q.id)),
    scanEvents: data.scanEvents.filter((s) => !demoCompanyIds.has(s.companyId)),
  };
}
