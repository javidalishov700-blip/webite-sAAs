import type { Metadata, Viewport } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import { appBaseUrl } from "@/lib/site";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  // Array form (not a single string) is the format iOS Safari's chrome-tint
  // heuristic actually reads reliably; values match --background in
  // globals.css for each color-scheme.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#06060b" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Locale-independent, so it lives on the synchronous root; [locale]/layout.tsx
// (async — it awaits params) only overrides title/description with the
// translated copy. Next merges parent + child metadata.
export const metadata: Metadata = {
  // Required for OG/Twitter image URLs to resolve to the real domain instead
  // of localhost when a route only passes a relative path.
  metadataBase: new URL(appBaseUrl()),
  title: {
    default: "QR-Universe — Your business, in a scan",
    template: "%s · QR-Universe",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    // `capable` only emits the new unprefixed `mobile-web-app-capable` tag —
    // iOS itself still keys its home-screen standalone mode (which is what
    // lets black-translucent draw page content under the status bar / Dynamic
    // Island) off the legacy apple-prefixed one, so it has to be added by hand.
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QR-Universe",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The root layout can't read the [locale] route param directly (it wraps
  // every locale), so the initial server-rendered lang comes from next-intl's
  // own middleware-detected locale instead — otherwise every non-English
  // page served its first byte tagged as English. DocumentLocale (in
  // providers.tsx) covers the client-side-navigation case this can't reach.
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} font-sans`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
