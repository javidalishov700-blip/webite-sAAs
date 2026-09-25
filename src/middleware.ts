import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { createSessionToken, needsRefresh, sessionCookieOptions, verifySessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { localizedPath } from "@/lib/catalog-url";

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
      url.pathname = localizedPath(locale, "/login");
      url.search = "";
      url.searchParams.set("next", pathname);
      // A cookie that no longer verifies is, in practice, a session that idled out.
      if (token) url.searchParams.set("reason", "expired");
      const response = NextResponse.redirect(url);
      if (token) response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    if (AUTH_ONLY_SEGMENTS.has(firstSegment) && session) {
      const url = request.nextUrl.clone();
      url.pathname = localizedPath(locale, "/admin");
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Every page an owner opens counts as activity for an unremembered session.
    if (session && needsRefresh(session)) {
      const response = intlMiddleware(request);
      response.cookies.set(SESSION_COOKIE_NAME, await createSessionToken({ userId: session.userId }), sessionCookieOptions(false));
      return response;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
