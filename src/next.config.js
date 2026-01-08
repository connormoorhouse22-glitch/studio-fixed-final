/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
       {
        protocol: 'https',
        hostname: 'winespace.co.za',
      },
      {
        protocol: 'https',
        hostname: 'africancellar.co.za',
      }
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['studio.firebase.google.com'],
    },
  },
};
module.exports = nextConfig;
