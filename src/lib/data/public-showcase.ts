import { generateId, nowIso } from "@/lib/data/ids";
import type { SeedDb } from "@/lib/data/seed-data";

export const PUBLIC_SHOWCASE_SLUG = "live-demo";

function unsplash(id: string, w = 900): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

/** Public browse-only catalog (no login). Used by the landing live-demo CTA. */
export function ensurePublicShowcase<T extends SeedDb>(data: T): T {
  if (data.companies.some((c) => c.slug === PUBLIC_SHOWCASE_SLUG)) return data;

  const now = nowIso();
  const companyId = generateId("cmp");
  const cats = [
    { name: "Starters", icon: "Salad", items: [
      { title: "Bruschetta Trio", price: 8.5, image: "1540420773420-3366772f4999", desc: "Tomato, ricotta, basil-fig." },
      { title: "Caesar Salad", price: 9.9, image: "1512621776951-a57141f2eefd", desc: "Romaine, parmesan, house dressing." },
    ]},
    { name: "Mains", icon: "UtensilsCrossed", items: [
      { title: "Classic Cheeseburger", price: 12.9, image: "1568901346375-23c9450c58cd", desc: "Double smash, aged cheddar.", featured: true },
      { title: "Margherita Pizza", price: 11, image: "1565299624946-b28f40a0ae38", desc: "San Marzano, fior di latte.", featured: true },
      { title: "Truffle Pasta", price: 14.5, image: "1567620905732-2d1ec7ab7445", desc: "Tagliatelle, mushroom cream." },
    ]},
    { name: "Desserts", icon: "IceCreamCone", items: [
      { title: "Molten Chocolate Cake", price: 6.9, image: "1578985545062-69928b1d9587", desc: "Warm center, vanilla ice cream.", featured: true },
      { title: "Tiramisu", price: 6.5, image: "1551024506-0bccd828d307", desc: "Espresso, mascarpone, cocoa." },
    ]},
    { name: "Drinks", icon: "GlassWater", items: [
      { title: "Fresh Orange Juice", price: 4, image: "1544145945-f90425340c7e", desc: "Cold-pressed, no sugar." },
      { title: "Espresso", price: 3, image: "1509042239860-f550ce710b93", desc: "Double shot, house roast." },
    ]},
  ];

  data.companies.push({
    id: companyId,
    slug: PUBLIC_SHOWCASE_SLUG,
    name: "Live Kitchen",
    description: "A public sample catalog — scan, browse, tap. Create your own after signup.",
    logoUrl: unsplash("1414235077428-338989a2e8c0", 256),
    coverUrl: unsplash("1414235077428-338989a2e8c0", 1600),
    industry: "RESTAURANT",
    plan: "PRO",
    currency: "USD",
    defaultLocale: "en",
    supportedLocales: ["en", "ru", "tr", "az"],
    accentColor: "#FF6B4A",
    address: "Sample venue",
    phone: null,
    website: null,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  });

  cats.forEach((cat, ci) => {
    const categoryId = generateId("cat");
    data.categories.push({
      id: categoryId,
      companyId,
      name: cat.name,
      icon: cat.icon,
      position: ci,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    });
    cat.items.forEach((item, ii) => {
      data.items.push({
        id: generateId("itm"),
        companyId,
        categoryId,
        title: item.title,
        description: item.desc,
        price: item.price,
        compareAtPrice: null,
        currency: "USD",
        images: [unsplash(item.image)],
        isVisible: true,
        isFeatured: Boolean(item.featured),
        stockCount: null,
        position: ii,
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  const qrId = generateId("qr");
  data.qrCodes.push({
    id: qrId,
    companyId,
    name: "Showcase QR",
    targetUrl: `/api/qr/${qrId}/go`,
    dotsColor: "#FF6B4A",
    backgroundColor: "#120A08",
    dotsStyle: "ROUNDED",
    cornerStyle: "EXTRA_ROUNDED",
    logoUrl: null,
    scans: 0,
    createdAt: now,
    updatedAt: now,
  });

  return data;
}
