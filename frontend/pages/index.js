import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Link from 'next/link'
import { getProducts, getCategories } from '../lib/api'
import { useLanguage } from '../lib/i18nContext'
import { useCart } from '../lib/cartContext'

const RATING_CYCLE = [4, 4.5, 4, 4, 4.5]

function CategoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const { t, translateCategoryName } = useLanguage()
  const { addToCart } = useCart()

  useEffect(() => {
    getProducts()
      .then(data => setProducts(data || []))
      .catch(() => {})
    getCategories()
      .then(data => setCategories(data || []))
      .catch(() => {})
  }, [])

  const displayed = products.slice(0, 5)
  const displayedCategories = categories.slice(0, 8)

  return (
    <>
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

        <div className="container-main">

          {/* ══ Category Grid ══ */}
          {displayedCategories.length > 0 && (
            <section className="home-section">
              <div className="home-section-head">
                <h2 className="section-title">{t('navCategories')}</h2>
                <Link href="/products" className="home-section-link">{t('heroBtn')} →</Link>
              </div>
              <div className="home-cat-grid">
                {displayedCategories.map((cat) => (
                  <Link key={cat.id} href={`/products?category=${cat.id}`} className="home-cat-card">
                    <div className="home-cat-icon">
                      <CategoryIcon />
                    </div>
                    <span className="home-cat-name">{translateCategoryName(cat.name)}</span>
                    {cat.products?.length > 0 && (
                      <span className="home-cat-count">{cat.products.length} {t('navProductsWord')}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ══ Popular Products ══ */}
          <section className="home-section">
            <div className="home-section-head">
              <h2 className="section-title">{t('popularProducts')}</h2>
              <Link href="/products" className="home-section-link">{t('heroBtn')} →</Link>
            </div>

            {displayed.length === 0 ? (
              <div className="home-loading">
                <div className="home-loading-spinner" />
                <span>{t('loadingProductsHome')}</span>
              </div>
            ) : (
              <div className="popular-products-grid">
                {displayed.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    rating={RATING_CYCLE[i % RATING_CYCLE.length]}
                    onAddToCart={(qty) => addToCart(p, p.discount || 0, qty)}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}

