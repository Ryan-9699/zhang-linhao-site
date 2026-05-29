import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/optimized-uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  outputFileTracingExcludes: {
    "/*": ["./public/uploads/**/*"],
    "/api/uploads": ["./public/uploads/**/*"],
    "/api/content": ["./public/uploads/**/*"],
    "/api/content-text": ["./public/uploads/**/*"],
  },
};

export default nextConfig;
