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
