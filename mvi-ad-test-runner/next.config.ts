import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "playwright"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
