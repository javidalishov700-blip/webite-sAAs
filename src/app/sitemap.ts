import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/constants";
import { SITE } from "@/lib/site";

const PATHS = ["", "/about", "/contact", "/faq", "/privacy", "/terms", "/cookies", "/careers", "/login", "/signup"];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = SITE.url.replace(/\/$/, "");
  const now = new Date();
  return LOCALES.flatMap((locale) =>
    PATHS.map((path) => ({
      url: `${origin}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.6,
    })),
  );
}
