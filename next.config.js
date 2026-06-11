const createNextIntlPlugin = require("next-intl/plugin");

// const withPWAInit = require("@ducanh2912/next-pwa").default;

/**
 * =========================
 * Next.js Base Config
 * =========================
 */
const nextConfig = {
  reactStrictMode: false,

  // مهم برای Docker production
  output: "standalone",

  productionBrowserSourceMaps: false,
 

  /**
   * =========================
   * ESLint behavior in CI/CD
   * =========================
   * جلوگیری از fail شدن build به خاطر warning ها
   */
  eslint: {
    ignoreDuringBuilds: true,
  },

  /**
   * =========================
   * Images config
   * =========================
   */
  images: {
    domains: [process.env.APP_URL || "localhost"],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bff.arianerp.ir",
        pathname: "/**",
      },
    ],
  },

  /**
   * =========================
   * Compiler optimizations
   * =========================
   */
  compiler: {
    styledComponents: true,
    reactRemoveProperties: true,
  },

  /**
   * =========================
   * Rewrites
   * =========================
   */
  async rewrites() {
    return [
      {
        source: "/:locale(en|fa)/assets/:path*",
        destination: "/assets/:path*",
      },
      {
        source: "/:locale(en|fa)/images/:path*",
        destination: "/images/:path*",
      },
    ];
  },

  /**
   * =========================
   * Security headers (CSP)
   * =========================
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self' https:;",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;",
              "style-src 'self' 'unsafe-inline' https:;",
              "img-src 'self' blob: data: https:;",
              "font-src 'self' https: data:;",
              "connect-src 'self' https: ws: wss:;",
              "media-src 'self' blob:;",
              "object-src 'none';",
              "frame-ancestors 'none';",
            ].join(" "),
          },
        ],
      },
    ];
  },
};

/**
 * =========================
 * i18n plugin
 * =========================
 */
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

module.exports = withNextIntl(nextConfig);