import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { verifySessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_SEGMENTS = new Set(["admin", "onboarding"]);
const AUTH_ONLY_SEGMENTS = new Set(["login", "signup"]);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];
  const isLocale = (routing.locales as readonly string[]).includes(maybeLocale);
  const locale = isLocale ? maybeLocale : routing.defaultLocale;
  const restSegments = isLocale ? segments.slice(1) : segments;
  const firstSegment = restSegments[0];

  const needsAuthCheck = Boolean(firstSegment) && (PROTECTED_SEGMENTS.has(firstSegment) || AUTH_ONLY_SEGMENTS.has(firstSegment));

  if (needsAuthCheck) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (PROTECTED_SEGMENTS.has(firstSegment) && !session) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.search = "";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (AUTH_ONLY_SEGMENTS.has(firstSegment) && session) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
