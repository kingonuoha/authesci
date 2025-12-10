import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  /* config options here */
};

console.log(
  "next.config.ts - NEXT_PUBLIC_SUPABASE_URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);
console.log(
  "next.config.ts - NEXT_PUBLIC_SUPABASE_ANON_KEY:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default nextConfig;
