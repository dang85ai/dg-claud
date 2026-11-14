/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/", has: [{ type: "query", key: "intro", value: "replay" }], destination: "/intro", permanent: true }
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sgoxywyhaketjmdmkzhm.supabase.co"
      }
    ]
  }
};

export default nextConfig;
