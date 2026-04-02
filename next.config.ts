import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  serverExternalPackages: ["mermaid"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.assurance.co.il",
      },
    ],
  },

  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
      ],
    },
  ],

  async rewrites() {
    return [];
  },
};

export default nextConfig;
