import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
