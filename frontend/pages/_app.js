import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.css'
import Head from 'next/head'
import { CartProvider } from '../lib/cartContext'
import { LanguageProvider, useLanguage } from '../lib/i18nContext'

function AppContent({ Component, pageProps }) {
  const { t } = useLanguage()
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{t('siteTitle')}</title>
        <link rel="icon" type="image/svg+xml" href="/resources/logo-mirdav.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'MirDav Company',
          url: process.env.NEXT_PUBLIC_SITE_URL || '',
          logo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/resources/logo-mirdav.svg`,
          contactPoint: [
            { '@type': 'ContactPoint', telephone: '+37368211333', contactType: 'customer service' },
            { '@type': 'ContactPoint', telephone: '+37368008635', contactType: 'customer service' },
          ],
        }) }} />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <CartProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </CartProvider>
    </LanguageProvider>
  )
}
