/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"]
  }
};

module.exports = nextConfig;
