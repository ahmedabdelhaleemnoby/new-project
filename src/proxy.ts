import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

// English is served without a prefix: "/about" is rewritten to "/en/about", and "/en/about"
// redirects to "/about". Other locales ("/ar/...") are served as requested.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const prefix = locales.find(locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (prefix === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (prefix) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes, and files with an extension (images, fonts, icons).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
