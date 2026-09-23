/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sgoxywyhaketjmdmkzhm.supabase.co"
      }
    ]
  }
};

export default nextConfig;
