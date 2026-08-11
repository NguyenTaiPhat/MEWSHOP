/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  experimental: {
    serverComponentsExternalPackages: ["sharp", "@prisma/client", "bcryptjs"],
  },
};

module.exports = nextConfig;
