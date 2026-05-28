/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"]
  }
};

module.exports = nextConfig;
