const createNextIntlPlugin = require("next-intl/plugin");
const withPWAInit = require("@ducanh2912/next-pwa").default;

const withPWA = withPWAInit({
  dest: "public",
  disable: true,
  disableLogging: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
});

const nextConfig = {
  reactStrictMode: false,
  output: "standalone",

  images: {
    domains: [process.env.APP_URL || "localhost"],
    unoptimized: true,
    path: "./public",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bff.ariansystem.net",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    extensionAlias: {
      ".js": [".js", ".ts", ".tsx"],
    },
  },
  compiler: {
    styledComponents: true,
    reactRemoveProperties: true,
  },
  webpack(config) {
    config.optimization.minimizer = [];
    return config;
  },
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self' https: http:;",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:;",
              "style-src 'self' 'unsafe-inline' https: http:;",
              "img-src 'self' blob: data: https: http:;",
              "font-src 'self' https: data:;",
              "connect-src 'self' https: http: ws: wss: *;",
              "media-src 'self' blob:;",
              "object-src 'none';",
              "frame-ancestors 'none';",
            ].join(" "),
          },
        ],
      },
    ];
  },
  // حذف headers از next.config.js زیرا از middleware استفاده می‌کنیم
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value: [
  //             "default-src * data: blob: 'unsafe-inline' 'unsafe-eval';",
  //             "img-src * data: blob: 'unsafe-inline';",
  //             "media-src * data: blob:;",
  //             "style-src * 'unsafe-inline';",
  //             "font-src * data:;",
  //             "connect-src *;",
  //             "script-src * 'unsafe-inline' 'unsafe-eval';",
  //             "frame-src *;",
  //             "worker-src blob:;",
  //           ].join(" "),
  //         },
  //       ],
  //     },
  //   ];
  // },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
module.exports = withNextIntl(withPWA(nextConfig));
