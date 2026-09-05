import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Keep in sync with images.remotePatterns below.
const IMAGE_HOSTS = [
  "https://images.unsplash.com",
  "https://*.public.blob.vercel-storage.com",
  "https://*.storage.c-5.us-east-2.aws.neon.tech",
];

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // No nonce/strict-dynamic yet: kept to a static policy so it can't break
  // rendering without an end-to-end test pass. Inline scripts/styles stay
  // allowed because React (style={{}}) and the UI libs (motion, dnd-kit,
  // Radix) set inline styles at runtime, and no code here uses
  // dangerouslySetInnerHTML, so the residual XSS risk is low.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${IMAGE_HOSTS.join(" ")}`,
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // 'self', not 'none': /admin/preview embeds the live catalog in an iframe.
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", "@neondatabase/serverless", "ws", "@aws-sdk/client-s3"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.storage.c-5.us-east-2.aws.neon.tech" },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
