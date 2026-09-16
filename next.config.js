/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir: true // Removido pois é padrão no Next.js 14
  },
  images: {
    domains: ['localhost', 'images.unsplash.com', 'source.unsplash.com', 'picsum.photos'],
  },
  async headers() {
    return [
      {
        // Aplica-se a todas as rotas do site
        source: '/:path*',
        headers: [
          {
            // Força HTTPS em todos os pedidos futuros (1 ano, incluindo subdomínios)
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // Impede que o site seja carregado dentro de <iframe> de outros domínios (clickjacking)
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // Impede que o browser tente "adivinhar" o tipo de ficheiro (MIME sniffing)
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Controla quanta informação de referência é enviada para outros sites
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Restringe o acesso a APIs sensíveis do browser (câmara, microfone, localização)
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            // Proteção adicional contra XSS em browsers mais antigos
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
