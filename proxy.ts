import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  const [firstSegment] = segments;

  if (!locales.includes(firstSegment as Locale)) {
    const targetPath = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", firstSegment);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
