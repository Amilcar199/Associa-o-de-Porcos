import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/membros/',
          '/perfil/',
          '/_next/',
          '/favicon.ico',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
