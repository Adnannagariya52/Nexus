import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow the IM preview proxy to access _next/* assets without cross-origin warnings.
  allowedDevOrigins: [
    "preview-chat-62c6c972-cb3c-479e-ac8d-6ddad85b4b46.space-z.ai",
    "*.space-z.ai",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
