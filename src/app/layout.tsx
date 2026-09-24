import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import { appBaseUrl } from "@/lib/site";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

// Outfit, the previous heading face, has no "ə"/"Ə" and no Cyrillic, so every
// Azerbaijani heading drew its schwa from a fallback font and Russian headings
// fell back entirely. Both faces here were checked glyph by glyph for ə Ə ğ İ Ж.
const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter-tight",
  display: "swap",
});

/** Marketing headlines only — the product UI stays on the sans faces. */
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
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
      <body className={`${inter.variable} ${interTight.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
