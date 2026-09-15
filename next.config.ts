import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ws"],
  poweredByHeader: false,
};

export default nextConfig;
