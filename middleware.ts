import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  // Skip middleware for static assets (both direct and locale-prefixed paths)
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    // Also check for locale-prefixed asset paths (middleware runs before rewrites)
    pathname.match(/^\/(en|fa)\/(assets|images)\//) ||
    pathname.match(/\.(woff|woff2|ttf|eot|png|jpg|jpeg|gif|svg|ico)$/i)
  ) {
    return;
  }

  const handleI18nRouting = createMiddleware({
    locales: ["en", "fa"],
    defaultLocale: "fa",
  });

  const response = handleI18nRouting(request);

  // اگر response یک NextResponse است، CSP header را اضافه کنید برای همه مسیرها
  if (response instanceof NextResponse) {
    // تنظیم CSP با پشتیبانی از blob برای همه مسیرها
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src * data: blob: 'unsafe-inline' 'unsafe-eval';",
        "img-src * data: blob: 'unsafe-inline';",
        "media-src * data: blob:;",
        "style-src * 'unsafe-inline';",
        "font-src * data:;",
        "connect-src *;",
        "script-src * 'unsafe-inline' 'unsafe-eval';",
        "frame-src *;",
        "worker-src blob:;",
      ].join(" ")
    );

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - Static files (files with extensions like .woff, .ttf, .png, etc.)
  // - API routes
  // - Next.js internal routes
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
