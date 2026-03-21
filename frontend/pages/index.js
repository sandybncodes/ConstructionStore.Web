import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Link from 'next/link'
import { getProducts } from '../lib/api'
import { useLanguage } from '../lib/i18nContext'

const RATING_CYCLE = [4, 4.5, 4, 4, 4.5]

export default function Home() {
  const [products, setProducts] = useState([])
  const { t } = useLanguage()

  useEffect(() => {
    getProducts()
      .then(data => setProducts(data || []))
      .catch(() => {})
  }, [])

  const displayed = products.slice(0, 5)

  return (
    <>
      <Header />
      <main>

        {/* ══ Hero Banner ══ */}
        <section className="hero-section">
          <div className="container-main w-100">
            <div className="row align-items-end" style={{ minHeight: 420 }}>

              <div className="col-md-6 hero-content">
                <p className="hero-eyebrow">{t('heroEyebrow')}</p>
                <h1 className="hero-title">{t('heroTitle')}</h1>
                <p className="hero-desc">{t('heroDesc')}</p>
                <Link href="/products" className="btn-yellow">{t('heroBtn')}</Link>
              </div>

              <div className="col-md-6 d-none d-md-block hero-image-wrap">
                <img
                  src="/resources/hero-worker.png"
                  alt="Construction professional"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              </div>

            </div>
          </div>
        </section>

        <div className="container-main">

          {/* ══ Popular Products ══ */}
          <section className="my-5">
            <div className="mb-0">
              <h2 className="section-title">{t('popularProducts')}</h2>
            </div>
            <hr className="section-divider" />

            {displayed.length === 0 ? (
              <p className="text-muted py-3">{t('loadingProductsHome')}</p>
            ) : (
              <div className="popular-products-grid">
                {displayed.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    rating={RATING_CYCLE[i % RATING_CYCLE.length]}
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

