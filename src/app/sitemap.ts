import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/constants";
import { SITE } from "@/lib/site";
import { localizedPath } from "@/lib/catalog-url";
import { listPublishedCompanySlugs } from "@/lib/data/repositories/companies";

const PATHS = ["", "/about", "/contact", "/faq", "/privacy", "/terms", "/cookies", "/careers", "/login", "/signup"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = SITE.url.replace(/\/$/, "");
  const now = new Date();
  const staticEntries = LOCALES.flatMap((locale) =>
    PATHS.map((path) => ({
      url: `${origin}${localizedPath(locale, path)}`,
      lastModified: now,
      changeFrequency: (path === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: path === "" ? 1 : 0.6,
    })),
  );

  // The real content search should surface is every live customer catalog,
  // not just the marketing pages — this was missing entirely before.
  const companies = await listPublishedCompanySlugs().catch(() => []);
  const catalogEntries = companies.flatMap((company) => {
    const locales = company.supportedLocales.length ? company.supportedLocales : LOCALES;
    return locales.map((locale) => ({
      url: `${origin}${localizedPath(locale, `/c/${company.slug}`)}`,
      lastModified: company.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  });

  return [...staticEntries, ...catalogEntries];
}
