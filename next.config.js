/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // This allows images from ANY secure website
    ],
  },
};

module.exports = nextConfig;
