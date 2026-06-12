import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Seo({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
}) {
  const router = useRouter()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const canonicalUrl = canonical || (siteUrl ? `${siteUrl}${router.asPath}` : router.asPath)

  const defaultOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MirDav Company',
    url: siteUrl || 'https://example.com',
    logo: `${siteUrl || ''}/resources/logo-mirdav.svg`,
    contactPoint: [
      { '@type': 'ContactPoint', telephone: '+37368211333', contactType: 'customer service' },
      { '@type': 'ContactPoint', telephone: '+37368008635', contactType: 'customer service' },
    ],
    sameAs: [],
  }

  const defaultLocalBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'MirDav Company',
    url: siteUrl || 'https://example.com',
    telephone: '+37368211333',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Str. Principală 1',
      addressLocality: 'Chișinău',
      addressRegion: 'Chișinău',
      postalCode: '',
      addressCountry: 'MD',
    },
    areaServed: ['Moldova', 'Chișinău', 'Ialoveni'],
    priceRange: '$$',
  }

  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Robots */}
      <meta name="robots" content="index, follow" />

      {/* Default Organization JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(defaultOrg) }} />
      {/* LocalBusiness JSON-LD (local SEO) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(defaultLocalBusiness) }} />

      {/* Page-specific structured data */}
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}
    </Head>
  )
}
