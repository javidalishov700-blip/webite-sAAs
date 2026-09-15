import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const origin = SITE.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // localePrefix is "as-needed": English has no prefix (/admin) while
      // az/ru/tr do (/az/admin), so both forms need a rule. The auth-flow
      // steps only make sense with a live token/session, so they're
      // excluded too instead of showing up as broken/empty pages.
      disallow: [
        "/api/",
        "/admin",
        "/*/admin",
        "/verify",
        "/*/verify",
        "/reset",
        "/*/reset",
        "/forgot",
        "/*/forgot",
        "/check-email",
        "/*/check-email",
        "/onboarding",
        "/*/onboarding",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
