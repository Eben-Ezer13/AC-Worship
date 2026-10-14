import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
