import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.arctracker.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
