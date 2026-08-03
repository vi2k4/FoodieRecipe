import type { NextConfig } from "next";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN?.trim()
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "my-foodie-ai-images.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...(cloudFrontDomain
        ? [
            {
              protocol: "https" as const,
              hostname: cloudFrontDomain,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
