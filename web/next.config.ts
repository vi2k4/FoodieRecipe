import type { NextConfig } from "next";

const devDistDir = `.next-${process.env.NEXT_DEV_PORT || "3000"}`;

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow two local Next.js dev servers to run at the same time.
  // Production builds continue to use the default `.next` directory.
  ...(process.env.NODE_ENV === "development" ? { distDir: devDistDir } : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "my-foodie-ai-images.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "foodie-storage-017091937113-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
