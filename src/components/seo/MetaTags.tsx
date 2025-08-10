import Head from 'next/head';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export default function MetaTags({
  title = 'Associação de Porcos - Criação Sustentável',
  description = 'Associação dedicada à promoção da criação sustentável de porcos em Angola. Conectamos produtores, compartilhamos conhecimento e fomentamos o desenvolvimento do setor suíno.',
  keywords = 'porcos, suínos, criação, associação, sustentável, Angola, produtores, conhecimento, setor suíno',
  image = '/images/og-image.jpg',
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = []
}: MetaTagsProps) {
  const fullUrl = url ? `${process.env.NEXTAUTH_URL}${url}` : process.env.NEXTAUTH_URL;
  const fullImage = image.startsWith('http') ? image : `${process.env.NEXTAUTH_URL}${image}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author || 'Associação de Porcos'} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="pt-AO" />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Associação de Porcos" />
      <meta property="og:locale" content="pt_AO" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@associacaoporcos" />
      <meta name="twitter:creator" content="@associacaoporcos" />

      {/* Article Specific Meta Tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#10b981" />
      <meta name="msapplication-TileColor" content="#10b981" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Associação de Porcos",
            "description": description,
            "url": process.env.NEXTAUTH_URL,
            "logo": `${process.env.NEXTAUTH_URL}/assets/logo/logo.png`,
            "image": fullImage,
            "sameAs": [
              "https://www.facebook.com/associacaoporcos",
              "https://www.instagram.com/associacaoporcos",
              "https://www.linkedin.com/company/associacaoporcos"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+244-222-123-456",
              "contactType": "customer service",
              "email": "contato@associacaoporcos.ao"
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Rua das Associações, 123",
              "addressLocality": "Luanda",
              "addressRegion": "Luanda",
              "postalCode": "1000",
              "addressCountry": "AO"
            }
          })
        }}
      />
    </Head>
  );
}
