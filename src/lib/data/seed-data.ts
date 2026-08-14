import { generateId, daysAgoIso, nowIso } from "@/lib/data/ids";
import type {
  AppLocale,
  AttributeType,
  Category,
  Company,
  Industry,
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

/** A fixed bcrypt hash of the string "demo1234" (cost 10), shared by every demo account. */
const DEMO_PASSWORD_HASH = "$2b$10$yMBDqznee4FyvoFvnM32ousXVSAaN5xvj7G2Y/Um77fST0THVsvr6";

function unsplash(id: string, w = 900): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

interface AttrSeed {
  key: string;
  value: string;
  type: AttributeType;
  unit?: string;
}

interface ItemSeed {
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  featured?: boolean;
  stockCount?: number | null;
  attrs?: AttrSeed[];
}

interface CategorySeed {
  name: string;
  icon: string;
  items: ItemSeed[];
}

interface CompanySeed {
  slug: string;
  name: string;
  description: string;
  industry: Industry;
  plan: Company["plan"];
  currency: string;
  accentColor: string;
  logoUrl: string;
  coverUrl: string;
  address: string;
  phone: string;
  website: string;
  supportedLocales: AppLocale[];
  ownerName: string;
  ownerEmail: string;
  categories: CategorySeed[];
  qr: { name: string; dotsColor: string; backgroundColor: string; dotsStyle: QrCode["dotsStyle"]; cornerStyle: QrCode["cornerStyle"] }[];
  scanBaseline: number;
  scanGrowth: number;
}

const COMPANY_SEEDS: CompanySeed[] = [
  {
    slug: "bella-foods",
    name: "Bella Foods",
    description: "Modern Italian-American kitchen serving wood-fired classics and inventive seasonal plates.",
    industry: "RESTAURANT",
    plan: "PRO",
    currency: "USD",
    accentColor: "#FF6B4A",
    logoUrl: unsplash("1414235077428-338989a2e8c0", 256),
    coverUrl: unsplash("1414235077428-338989a2e8c0", 1600),
    address: "142 Riverside Ave, Austin, TX",
    phone: "+1 (512) 555-0142",
    website: "https://bellafoods.example",
    supportedLocales: ["en", "ru", "tr", "az"],
    ownerName: "Isabella Moretti",
    ownerEmail: "demo@bellafoods.com",
    scanBaseline: 60,
    scanGrowth: 2.4,
    qr: [
      { name: "Table QR — Main Hall", dotsColor: "#FF6B4A", backgroundColor: "#120A08", dotsStyle: "ROUNDED", cornerStyle: "EXTRA_ROUNDED" },
      { name: "Storefront Window QR", dotsColor: "#FFD24A", backgroundColor: "#0B0B14", dotsStyle: "CLASSY_ROUNDED", cornerStyle: "DOTS" },
    ],
    categories: [
      {
        name: "Starters",
        icon: "Salad",
        items: [
          {
            title: "Bruschetta Trio",
            description: "Toasted sourdough topped with heirloom tomato, whipped ricotta, and basil-fig compote.",
            price: 8.5,
            image: unsplash("1540420773420-3366772f4999"),
            stockCount: null,
            attrs: [
              { key: "Calories", value: "310", type: "NUMBER", unit: "kcal" },
              { key: "Vegan", value: "false", type: "BOOLEAN" },
              { key: "Allergens", value: "Gluten,Dairy", type: "LIST" },
            ],
          },
          {
            title: "Caesar Salad",
            description: "Crisp romaine, shaved parmesan, garlic croutons, and a classic house-made dressing.",
            price: 9.9,
            image: unsplash("1512621776951-a57141f2eefd"),
            attrs: [
              { key: "Calories", value: "320", type: "NUMBER", unit: "kcal" },
              { key: "Vegan", value: "false", type: "BOOLEAN" },
              { key: "Allergens", value: "Gluten,Dairy,Fish", type: "LIST" },
            ],
          },
          {
            title: "Tomato Basil Soup",
            description: "Slow-roasted San Marzano tomatoes, fresh basil oil, and a touch of cream.",
            price: 7.2,
            image: unsplash("1547592166-23ac45744acd"),
            attrs: [
              { key: "Calories", value: "210", type: "NUMBER", unit: "kcal" },
              { key: "Vegan", value: "true", type: "BOOLEAN" },
            ],
          },
          {
            title: "Weekend Brunch Platter",
            description: "Eggs your way, herb potatoes, smoked bacon, and toasted brioche. Weekends only.",
            price: 15.9,
            image: unsplash("1533089860892-a7c6f0a88666"),
            attrs: [
              { key: "Calories", value: "690", type: "NUMBER", unit: "kcal" },
              { key: "Allergens", value: "Gluten,Dairy,Eggs", type: "LIST" },
            ],
          },
        ],
      },
      {
        name: "Main Course",
        icon: "UtensilsCrossed",
        items: [
          {
            title: "Classic Cheeseburger",
            description: "Double smash patty, aged cheddar, caramelized onion, house sauce, brioche bun.",
            price: 12.9,
            image: unsplash("1568901346375-23c9450c58cd"),
            featured: true,
            attrs: [
              { key: "Calories", value: "780", type: "NUMBER", unit: "kcal" },
              { key: "Spicy", value: "false", type: "BOOLEAN" },
              { key: "Allergens", value: "Gluten,Dairy", type: "LIST" },
            ],
          },
          {
            title: "Spicy Chicken Burger",
            description: "Buttermilk-fried chicken thigh, pickled jalapeño, chipotle mayo.",
            price: 13.5,
            image: unsplash("1571091718767-18b5b1457add"),
            attrs: [
              { key: "Calories", value: "690", type: "NUMBER", unit: "kcal" },
              { key: "Spicy", value: "true", type: "BOOLEAN" },
            ],
          },
          {
            title: "Margherita Pizza",
            description: "San Marzano tomato, fior di latte mozzarella, basil, wood-fired crust.",
            price: 11.0,
            image: unsplash("1565299624946-b28f40a0ae38"),
            featured: true,
            attrs: [
              { key: "Calories", value: "850", type: "NUMBER", unit: "kcal" },
              { key: "Vegan", value: "false", type: "BOOLEAN" },
            ],
          },
          {
            title: "Pepperoni Pizza",
            description: "Double pepperoni, mozzarella, oregano, chili-infused honey drizzle.",
            price: 13.0,
            image: unsplash("1513104890138-7c749659a591"),
            attrs: [{ key: "Calories", value: "920", type: "NUMBER", unit: "kcal" }],
          },
          {
            title: "Creamy Truffle Pasta",
            description: "Fresh tagliatelle, wild mushroom, black truffle cream, aged parmesan.",
            price: 14.5,
            image: unsplash("1567620905732-2d1ec7ab7445"),
            attrs: [
              { key: "Calories", value: "610", type: "NUMBER", unit: "kcal" },
              { key: "Allergens", value: "Gluten,Dairy", type: "LIST" },
            ],
          },
          {
            title: "Grilled Ribeye Steak",
            description: "12oz prime ribeye, rosemary jus, roasted garlic butter, seasonal vegetables.",
            price: 24.9,
            image: unsplash("1546833999-b9f581a1996d"),
            attrs: [
              { key: "Calories", value: "700", type: "NUMBER", unit: "kcal" },
              { key: "Prep time", value: "25", type: "NUMBER", unit: "min" },
            ],
          },
          {
            title: "Dragon Roll Sushi Set",
            description: "Eel, cucumber, avocado, unagi glaze — eight pieces, chef's selection.",
            price: 16.9,
            image: unsplash("1579584425555-c3ce17fd4351"),
            attrs: [
              { key: "Calories", value: "480", type: "NUMBER", unit: "kcal" },
              { key: "Allergens", value: "Fish,Soy", type: "LIST" },
            ],
          },
        ],
      },
      {
        name: "Desserts",
        icon: "IceCreamCone",
        items: [
          {
            title: "Molten Chocolate Cake",
            description: "Warm dark chocolate cake, liquid center, vanilla bean ice cream.",
            price: 6.9,
            image: unsplash("1578985545062-69928b1d9587"),
            featured: true,
            attrs: [{ key: "Calories", value: "540", type: "NUMBER", unit: "kcal" }],
          },
          {
            title: "Tiramisu",
            description: "Espresso-soaked ladyfingers, mascarpone cream, cocoa dust.",
            price: 6.5,
            image: unsplash("1551024506-0bccd828d307"),
            attrs: [{ key: "Calories", value: "420", type: "NUMBER", unit: "kcal" }],
          },
          {
            title: "New York Cheesecake",
            description: "Classic baked cheesecake, red berry compote, graham crust.",
            price: 6.9,
            image: unsplash("1488477181946-6428a0291777"),
            attrs: [{ key: "Calories", value: "460", type: "NUMBER", unit: "kcal" }],
          },
          {
            title: "Vanilla Bean Ice Cream",
            description: "Madagascar vanilla bean, house waffle cone, toasted almonds.",
            price: 4.5,
            image: unsplash("1497034825429-c343d7c6a68f"),
            attrs: [{ key: "Vegan", value: "false", type: "BOOLEAN" }],
          },
        ],
      },
      {
        name: "Drinks",
        icon: "GlassWater",
        items: [
          {
            title: "Fresh Orange Juice",
            description: "Cold-pressed daily, no added sugar.",
            price: 4.0,
            image: unsplash("1544145945-f90425340c7e"),
            attrs: [{ key: "Vegan", value: "true", type: "BOOLEAN" }],
          },
          {
            title: "Signature Mojito",
            description: "White rum, fresh mint, lime, soda — the house classic.",
            price: 8.5,
            image: unsplash("1551024601-bec78aea704b"),
            attrs: [{ key: "Contains alcohol", value: "true", type: "BOOLEAN" }],
          },
          {
            title: "Espresso",
            description: "Double shot, single-origin beans, roasted in-house.",
            price: 3.0,
            image: unsplash("1509042239860-f550ce710b93"),
          },
          {
            title: "House Red Wine",
            description: "A smooth, medium-bodied red from our reserve list. Glass or bottle.",
            price: 7.0,
            image: unsplash("1510812431401-41d2bd2722f3"),
            attrs: [{ key: "Contains alcohol", value: "true", type: "BOOLEAN" }],
          },
        ],
      },
    ],
  },
  {
    slug: "urban-sole",
    name: "Urban Sole",
    description: "Sneaker culture & streetwear essentials — curated drops, every week.",
    industry: "RETAIL",
    plan: "FREE",
    currency: "USD",
    accentColor: "#3AD1C4",
    logoUrl: unsplash("1549298916-b41d501d3772", 256),
    coverUrl: unsplash("1441986300917-64674bd600d8", 1600),
    address: "88 Baker Street, London",
    phone: "+44 20 7946 0958",
    website: "https://urbansole.example",
    supportedLocales: ["en", "tr", "az"],
    ownerName: "Marcus Reed",
    ownerEmail: "demo@urbansole.com",
    scanBaseline: 45,
    scanGrowth: 3.1,
    qr: [{ name: "Storefront QR", dotsColor: "#3AD1C4", backgroundColor: "#08110F", dotsStyle: "SQUARE", cornerStyle: "SQUARE" }],
    categories: [
      {
        name: "Sneakers",
        icon: "Footprints",
        items: [
          {
            title: "Nova Runner X1",
            description: "Lightweight knit upper, responsive foam midsole, everyday trainer.",
            price: 129.99,
            compareAtPrice: 149.99,
            image: unsplash("1549298916-b41d501d3772"),
            featured: true,
            stockCount: 24,
            attrs: [
              { key: "Sizes", value: "38,39,40,41,42,43", type: "LIST" },
              { key: "Material", value: "Mesh / Rubber", type: "TEXT" },
              { key: "Color", value: "White / Black", type: "TEXT" },
            ],
          },
          {
            title: "Street Glide Low",
            description: "Full-grain leather low-top with a vulcanized rubber sole.",
            price: 109.99,
            image: unsplash("1560769629-975ec94e6a86"),
            stockCount: 18,
            attrs: [
              { key: "Sizes", value: "39,40,41,42", type: "LIST" },
              { key: "Material", value: "Leather", type: "TEXT" },
            ],
          },
          {
            title: "Cloud Step Pro",
            description: "Max-cushion performance runner with carbon plate stability.",
            price: 149.99,
            image: unsplash("1595950653106-6c9ebd614d3a"),
            stockCount: 12,
            featured: true,
            attrs: [
              { key: "Sizes", value: "40,41,42,43,44", type: "LIST" },
              { key: "Material", value: "Engineered Knit", type: "TEXT" },
            ],
          },
          {
            title: "Retro 88 High",
            description: "Retro-inspired high-top with premium suede overlays.",
            price: 134.99,
            image: unsplash("1600185365483-26d7a4cc7519"),
            stockCount: 9,
            attrs: [{ key: "Sizes", value: "41,42,43,44,45", type: "LIST" }],
          },
          {
            title: "Velocity Trail",
            description: "Aggressive lug outsole built for mixed-terrain running.",
            price: 119.99,
            image: unsplash("1595341888016-a392ef81b7de"),
            stockCount: 15,
            attrs: [{ key: "Sizes", value: "38,39,40", type: "LIST" }],
          },
          {
            title: "Neon Pulse",
            description: "Bold colourway statement sneaker with reflective accents.",
            price: 99.99,
            image: unsplash("1606107557195-0e29a4b5b4aa"),
            stockCount: 0,
            attrs: [{ key: "Sizes", value: "36,37,38,39", type: "LIST" }],
          },
        ],
      },
      {
        name: "Apparel",
        icon: "Shirt",
        items: [
          {
            title: "Oversized Hoodie",
            description: "Heavyweight brushed fleece, dropped shoulder fit.",
            price: 59.99,
            image: unsplash("1556821840-3a63f95609a7"),
            attrs: [
              { key: "Material", value: "100% Cotton", type: "TEXT" },
              { key: "Sizes", value: "S,M,L,XL", type: "LIST" },
            ],
          },
          {
            title: "Windbreaker Jacket",
            description: "Packable, water-resistant shell with mesh lining.",
            price: 79.99,
            image: unsplash("1551028719-00167b16eac5"),
            attrs: [
              { key: "Material", value: "Nylon", type: "TEXT" },
              { key: "Sizes", value: "M,L,XL", type: "LIST" },
            ],
          },
          {
            title: "Essential Tee",
            description: "Everyday crewneck tee, garment-dyed for a soft vintage feel.",
            price: 24.99,
            image: unsplash("1521572163474-6864f9cf17ab"),
            attrs: [{ key: "Sizes", value: "S,M,L,XL,XXL", type: "LIST" }],
          },
          {
            title: "Snapback Cap",
            description: "Structured 6-panel cap with embroidered logo.",
            price: 19.99,
            image: unsplash("1521369909029-2afed882baee"),
            attrs: [{ key: "Color", value: "Black", type: "TEXT" }],
          },
        ],
      },
      {
        name: "Accessories",
        icon: "Watch",
        items: [
          {
            title: "Urban Crossbody Bag",
            description: "Water-resistant canvas crossbody with dedicated tech pocket.",
            price: 49.99,
            image: unsplash("1584917865442-de89df76afd3"),
            attrs: [{ key: "Material", value: "Canvas", type: "TEXT" }],
          },
          {
            title: "Chrono Watch",
            description: "Minimalist analog watch with a genuine leather strap.",
            price: 89.99,
            image: unsplash("1523275335684-37898b6baf30"),
          },
          {
            title: "Aviator Sunglasses",
            description: "UV400 polarized lenses, classic metal frame.",
            price: 34.99,
            image: unsplash("1572635196237-14b3f281503f"),
          },
        ],
      },
    ],
  },
  {
    slug: "nexustech",
    name: "NexusTech",
    description: "Next-generation computing, mobile, and audio — hands-on in our flagship showroom.",
    industry: "ELECTRONICS",
    plan: "ENTERPRISE",
    currency: "EUR",
    accentColor: "#7C5CFF",
    logoUrl: unsplash("1517336714731-489689fd1ca8", 256),
    coverUrl: unsplash("1441986300917-64674bd600d8", 1600),
    address: "9 Innovation Way, Berlin",
    phone: "+49 30 1234 5678",
    website: "https://nexustech.example",
    supportedLocales: ["en", "ru"],
    ownerName: "Elena Vasquez",
    ownerEmail: "demo@nexustech.com",
    scanBaseline: 80,
    scanGrowth: 1.6,
    qr: [
      { name: "Showroom Entrance QR", dotsColor: "#7C5CFF", backgroundColor: "#0B0B14", dotsStyle: "EXTRA_ROUNDED", cornerStyle: "EXTRA_ROUNDED" },
      { name: "Product Shelf QR", dotsColor: "#00E5FF", backgroundColor: "#05050A", dotsStyle: "CLASSY", cornerStyle: "ROUNDED" },
    ],
    categories: [
      {
        name: "Laptops",
        icon: "Laptop",
        items: [
          {
            title: "NexusBook Air 14",
            description: "Fanless design, all-day battery, stunning 14-inch OLED display.",
            price: 1299,
            image: unsplash("1517336714731-489689fd1ca8"),
            featured: true,
            stockCount: 30,
            attrs: [
              { key: "RAM", value: "16GB", type: "TEXT" },
              { key: "Storage", value: "512GB SSD", type: "TEXT" },
              { key: "Warranty", value: "24", type: "NUMBER", unit: "months" },
            ],
          },
          {
            title: "NexusBook Pro 16",
            description: "Discrete GPU, 16-inch mini-LED display, built for creators.",
            price: 1899,
            image: unsplash("1496181133206-80ce9b88a853"),
            stockCount: 14,
            attrs: [
              { key: "RAM", value: "32GB", type: "TEXT" },
              { key: "Storage", value: "1TB SSD", type: "TEXT" },
              { key: "Warranty", value: "24", type: "NUMBER", unit: "months" },
            ],
          },
          {
            title: "NexusBook Go 13",
            description: "Ultra-portable everyday laptop for work and study.",
            price: 899,
            image: unsplash("1541807084-5c52b6b3adef"),
            stockCount: 40,
            attrs: [
              { key: "RAM", value: "8GB", type: "TEXT" },
              { key: "Storage", value: "256GB SSD", type: "TEXT" },
              { key: "Warranty", value: "12", type: "NUMBER", unit: "months" },
            ],
          },
        ],
      },
      {
        name: "Smartphones",
        icon: "Smartphone",
        items: [
          {
            title: "Nexus Phone 15",
            description: "Titanium frame, pro-grade triple camera, all-day battery life.",
            price: 999,
            image: unsplash("1523206489230-c012c64b2b48"),
            featured: true,
            stockCount: 60,
            attrs: [
              { key: "RAM", value: "8GB", type: "TEXT" },
              { key: "Storage", value: "256GB", type: "TEXT" },
              { key: "Color", value: "Titanium", type: "TEXT" },
              { key: "Warranty", value: "12", type: "NUMBER", unit: "months" },
            ],
          },
          {
            title: "Nexus Phone 15 Lite",
            description: "The essentials, refined — great cameras, small footprint.",
            price: 649,
            image: unsplash("1511707171634-5f897ff02aa9"),
            stockCount: 45,
            attrs: [
              { key: "RAM", value: "6GB", type: "TEXT" },
              { key: "Storage", value: "128GB", type: "TEXT" },
              { key: "Warranty", value: "12", type: "NUMBER", unit: "months" },
            ],
          },
        ],
      },
      {
        name: "Audio & Wearables",
        icon: "Headphones",
        items: [
          {
            title: "AeroBuds Pro",
            description: "Active noise cancelling earbuds with spatial audio.",
            price: 199,
            image: unsplash("1505740420928-5e560c06d30e"),
            attrs: [
              { key: "Warranty", value: "12", type: "NUMBER", unit: "months" },
              { key: "Color", value: "Black", type: "TEXT" },
            ],
          },
          {
            title: "StudioMax Headphones",
            description: "Over-ear studio headphones with 40-hour battery life.",
            price: 299,
            image: unsplash("1484704849700-f032a568e944"),
            attrs: [{ key: "Warranty", value: "24", type: "NUMBER", unit: "months" }],
          },
          {
            title: "PulseWave Speaker",
            description: "360° portable speaker, IP67 rated, 20-hour playtime.",
            price: 149,
            image: unsplash("1545454675-3531b543be5d"),
            attrs: [{ key: "Warranty", value: "12", type: "NUMBER", unit: "months" }],
          },
          {
            title: "Nexus Watch S",
            description: "Health tracking, cellular connectivity, always-on display.",
            price: 249,
            image: unsplash("1544244015-0df4b3ffc6b0"),
            attrs: [{ key: "Warranty", value: "12", type: "NUMBER", unit: "months" }],
          },
          {
            title: "Cinema 55\u2033 4K TV",
            description: "OLED panel, HDR10+, built-in streaming platform.",
            price: 799,
            image: unsplash("1593359677879-a4bb92f829d1"),
            attrs: [{ key: "Warranty", value: "24", type: "NUMBER", unit: "months" }],
          },
          {
            title: "MechType Keyboard",
            description: "Hot-swappable mechanical keyboard with per-key RGB.",
            price: 129,
            image: unsplash("1587829741301-dc798b83add3"),
            attrs: [{ key: "Warranty", value: "12", type: "NUMBER", unit: "months" }],
          },
          {
            title: "VisionCam X",
            description: "Mirrorless hybrid camera for photo and 6K video.",
            price: 549,
            image: unsplash("1502920917128-1aa500764cbd"),
            attrs: [{ key: "Warranty", value: "12", type: "NUMBER", unit: "months" }],
          },
        ],
      },
    ],
  },
];

function weekdayFactor(date: Date, industry: Industry): number {
  const day = date.getDay(); // 0 = Sunday
  const isWeekend = day === 0 || day === 6;
  if (industry === "RESTAURANT") return isWeekend ? 1.6 : 1;
  if (industry === "RETAIL") return isWeekend ? 1.35 : 1;
  return isWeekend ? 0.75 : 1.1;
}

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function buildSeedDb(): SeedDb {
  const users: User[] = [];
  const memberships: Membership[] = [];
  const companies: Company[] = [];
  const categories: Category[] = [];
  const items: Item[] = [];
  const attributes: ItemAttribute[] = [];
  const qrCodes: QrCode[] = [];
  const scanEvents: ScanEvent[] = [];

  COMPANY_SEEDS.forEach((seed, companyIndex) => {
    const companyId = generateId("cmp");
    const userId = generateId("usr");
    const createdAt = daysAgoIso(120 - companyIndex * 5);

    users.push({
      id: userId,
      name: seed.ownerName,
      email: seed.ownerEmail,
      passwordHash: DEMO_PASSWORD_HASH,
      avatarUrl: null,
      createdAt,
      updatedAt: createdAt,
    });

    memberships.push({
      id: generateId("mem"),
      role: "OWNER",
      userId,
      companyId,
      createdAt,
    });

    companies.push({
      id: companyId,
      slug: seed.slug,
      name: seed.name,
      description: seed.description,
      logoUrl: seed.logoUrl,
      coverUrl: seed.coverUrl,
      industry: seed.industry,
      plan: seed.plan,
      currency: seed.currency,
      defaultLocale: "en",
      supportedLocales: seed.supportedLocales,
      accentColor: seed.accentColor,
      address: seed.address,
      phone: seed.phone,
      website: seed.website,
      isPublished: true,
      createdAt,
      updatedAt: createdAt,
    });

    seed.categories.forEach((categorySeed, categoryIndex) => {
      const categoryId = generateId("cat");
      categories.push({
        id: categoryId,
        companyId,
        name: categorySeed.name,
        icon: categorySeed.icon,
        position: categoryIndex,
        isVisible: true,
        createdAt,
        updatedAt: createdAt,
      });

      categorySeed.items.forEach((itemSeed, itemIndex) => {
        const itemId = generateId("itm");
        items.push({
          id: itemId,
          companyId,
          categoryId,
          title: itemSeed.title,
          description: itemSeed.description,
          price: itemSeed.price,
          compareAtPrice: itemSeed.compareAtPrice ?? null,
          currency: seed.currency,
          images: [itemSeed.image],
          isVisible: true,
          isFeatured: Boolean(itemSeed.featured),
          stockCount: itemSeed.stockCount ?? null,
          position: itemIndex,
          createdAt,
          updatedAt: createdAt,
        });

        (itemSeed.attrs ?? []).forEach((attr, attrIndex) => {
          attributes.push({
            id: generateId("atr"),
            itemId,
            key: attr.key,
            value: attr.value,
            type: attr.type,
            unit: attr.unit ?? null,
            position: attrIndex,
          });
        });
      });
    });

    const qrIds: string[] = [];
    seed.qr.forEach((qrSeed) => {
      const qrId = generateId("qr");
      qrIds.push(qrId);
      qrCodes.push({
        id: qrId,
        companyId,
        name: qrSeed.name,
        targetUrl: `/api/qr/${qrId}/go`,
        dotsColor: qrSeed.dotsColor,
        backgroundColor: qrSeed.backgroundColor,
        dotsStyle: qrSeed.dotsStyle,
        cornerStyle: qrSeed.cornerStyle,
        logoUrl: seed.logoUrl,
        scans: 0,
        createdAt,
        updatedAt: createdAt,
      });
    });

    const rand = seededRandom(companyIndex * 7919 + 13);
    const locales: AppLocale[] = seed.supportedLocales.length ? seed.supportedLocales : ["en"];
    let totalScans = 0;
    for (let dayOffset = 44; dayOffset >= 0; dayOffset--) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      const growth = 1 + ((44 - dayOffset) / 44) * (seed.scanGrowth - 1);
      const factor = weekdayFactor(date, seed.industry);
      const noise = 0.75 + rand() * 0.5;
      const scansToday = Math.max(2, Math.round(seed.scanBaseline * growth * factor * noise * 0.35));

      for (let i = 0; i < scansToday; i++) {
        const hour = 8 + Math.floor(rand() * 14);
        const minute = Math.floor(rand() * 60);
        const localeRoll = rand();
        const locale =
          locales.length === 1
            ? locales[0]
            : locales[Math.min(locales.length - 1, Math.floor(localeRoll * locales.length))];
        scanEvents.push({
          id: generateId("scn"),
          companyId,
          qrCodeId: qrIds[Math.floor(rand() * qrIds.length)] ?? null,
          createdAt: daysAgoIso(dayOffset, hour, minute),
          locale,
          device: rand() > 0.18 ? "mobile" : "desktop",
        });
        totalScans++;
      }
    }

    qrIds.forEach((id, idx) => {
      const qr = qrCodes.find((q) => q.id === id);
      if (qr) qr.scans = Math.round((totalScans / qrIds.length) * (idx === 0 ? 1.1 : 0.9));
    });
  });

  return { users, memberships, companies, categories, items, attributes, qrCodes, scanEvents };
}

export const __seedMeta = {
  demoPasswordPlainText: "demo1234",
  generatedAt: nowIso(),
};
