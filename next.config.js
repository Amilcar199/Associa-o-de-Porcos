/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir: true // Removido pois é padrão no Next.js 14
  },
  images: {
    domains: ['localhost', 'images.unsplash.com', 'source.unsplash.com', 'picsum.photos'],
  },
}

module.exports = nextConfig
