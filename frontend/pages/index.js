import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Seo from '../components/Seo'
import Footer from '../components/Footer'
import Link from 'next/link'
import { getProducts, getCategories } from '../lib/api'
import { useLanguage } from '../lib/i18nContext'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])  
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    getProducts()
      .then(data => setProducts(data || []))
      .catch(() => {})
      .finally(() => setLoadingProducts(false))
    getCategories()
      .then(data => setCategories(data || []))
      .catch(() => {})
      .finally(() => setLoadingCategories(false))
  }, [])

  return (
    <>
      <Seo title={`${t('heroTitle')} | ${t('siteTitle')}`} description={t('heroDesc')} canonical={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/`} />
      <Header />
      <main>

        {/* ══ Hero Banner ══ */}
        <section className="hero-section">
          <div className="hero-ambient" aria-hidden="true">
            <div className="hero-orb hero-orb--1" />
            <div className="hero-orb hero-orb--2" />
            <div className="hero-orb hero-orb--3" />
          </div>

          <div className="container-main hero-inner">
            <div className="hero-content">
              <p className="hero-eyebrow">{t('heroEyebrow')}</p>
              <h1 className="hero-title">{t('heroTitle')}</h1>
              <p className="hero-desc">{t('heroDesc')}</p>
              <div className="hero-cta-row">
                <Link href="/products" className="btn-yellow hero-btn-primary">{t('heroBtn')}</Link>
                <Link href="/products" className="hero-btn-ghost">{t('navCategories')} →</Link>
              </div>
              <div className="hero-trust-row">
                <span className="hero-trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  {t('freeShippingReturns')}
                </span>
                <span className="hero-trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  {t('estimatedDeliveryValue')}
                </span>
              </div>
            </div>

            <div className="hero-image-wrap" aria-hidden="true">
              <div className="hero-image-glow" />
              <img
                src="/resources/hero-worker.png"
                alt=""
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          </div>
        </section>

        {/* ══ Statistics Strip ══ */}
        <section className="stats-section">
          <div className="container-main">
            <p className="stats-eyebrow">{t('statsSectionTitle')}</p>
            <div className="stats-row">

              <div className="stat-item">
                <span className="stat-item-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </span>
                <strong className="stat-item-value">
                  {loadingCategories ? <span className="stat-spinner" aria-label="loading" /> : categories.length}
                </strong>
                <span className="stat-item-label">{t('statCategoriesLabel')}</span>
              </div>

              <div className="stat-item">
                <span className="stat-item-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </span>
                <strong className="stat-item-value">
                  {loadingProducts ? <span className="stat-spinner" aria-label="loading" /> : products.reduce((sum, p) => sum + (p.variants?.length || 1), 0)}
                </strong>
                <span className="stat-item-label">{t('statProductsLabel')}</span>
              </div>

              <div className="stat-item">
                <span className="stat-item-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <strong className="stat-item-value">1000+</strong>
                <span className="stat-item-label">{t('statClientsLabel')}</span>
              </div>

              <div className="stat-item">
                <span className="stat-item-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <strong className="stat-item-value">10+</strong>
                <span className="stat-item-label">{t('statExperienceLabel')}</span>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

