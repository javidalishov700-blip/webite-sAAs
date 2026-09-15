import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const origin = SITE.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Every route is locale-prefixed (/en/admin, /az/verify, ...), so a
      // bare "/admin" never actually matched anything — "/*/admin" does.
      // The auth-flow steps only make sense with a live token/session, so
      // they're excluded too instead of showing up as broken/empty pages.
      disallow: [
        "/api/",
        "/*/admin",
        "/*/verify",
        "/*/reset",
        "/*/forgot",
        "/*/check-email",
        "/*/onboarding",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
