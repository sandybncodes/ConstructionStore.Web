import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Link from 'next/link'
import { getProducts } from '../lib/api'

const DISCOUNT_CYCLE = [-4, -4, -4, -18, -4]
const RATING_CYCLE   = [4,  4.5, 4, 4, 4.5]

const pad = n => String(n).padStart(2, '0')

function Countdown() {
  const [t, setT] = useState(null)

  useEffect(() => {
    setT({ d: 840, h: 20, m: 52, s: 8 })
    const id = setInterval(() => {
      setT(prev => {
        if (!prev) return prev
        let { d, h, m, s } = prev
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) { h = 23; d-- }
        if (d < 0) { d = 0; h = 0; m = 0; s = 0 }
        return { d, h, m, s }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  if (!t) return null

  return (
    <div className="countdown">
      {[{ num: pad(t.d), label: 'Days' }, { num: pad(t.h), label: 'Hrs' }, { num: pad(t.m), label: 'Min' }, { num: pad(t.s), label: 'Secs' }].map(({ num, label }) => (
        <div key={label} className="countdown-unit">
          <span className="countdown-num">{num}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('featured')
  const [products, setProducts] = useState([])

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
                <p className="hero-eyebrow">Max Savings Only Monday</p>
                <h1 className="hero-title">Up To 60% Flat</h1>
                <p className="hero-desc">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </p>
                <Link href="/products" className="btn-yellow">VIEW MORE</Link>
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

          {/* ══ Category Banners ══ */}
          <div className="row g-3 my-5">
            <div className="col-md-6">
              <div className="cat-banner">
                <img
                  className="cat-banner-bg"
                  src="/resources/tools-sale.jpg"
                  alt=""
                  aria-hidden="true"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
                <div className="cat-banner-content">
                  <h4>Tools For Sale</h4>
                  <p>Shop Sears&apos; wide selection of tools&hellip;</p>
                  <Link href="/products" className="btn-yellow" style={{ padding: '9px 22px', fontSize: 12 }}>VIEW MORE</Link>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="cat-banner">
                <img
                  className="cat-banner-bg"
                  src="/resources/measuring-tools.jpg"
                  alt=""
                  aria-hidden="true"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
                <div className="cat-banner-content">
                  <h4>Measuring Tools</h4>
                  <p>Shop Sears&apos; wide selection of tools&hellip;</p>
                  <Link href="/products" className="btn-yellow" style={{ padding: '9px 22px', fontSize: 12 }}>VIEW MORE</Link>
                </div>
              </div>
            </div>
          </div>

          {/* ══ Popular Products ══ */}
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-0">
              <div className="d-flex align-items-center flex-wrap gap-3">
                <h2 className="section-title">Popular Products</h2>
                <div className="tab-pills">
                  {[['featured', 'Featured'], ['new-arrival', 'New Arrival'], ['best-seller', 'Best Seller']].map(([key, label]) => (
                    <button
                      key={key}
                      className={`tab-pill${activeTab === key ? ' active' : ''}`}
                      onClick={() => setActiveTab(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="d-flex gap-2 pb-1">
                <button className="arrow-btn" aria-label="Previous">&#8249;</button>
                <button className="arrow-btn" aria-label="Next">&#8250;</button>
              </div>
            </div>
            <hr className="section-divider" />

            {displayed.length === 0 ? (
              <p className="text-muted py-3">Loading products&hellip;</p>
            ) : (
              <div className="row g-3">
                {displayed.map((p, i) => (
                  <div key={p.id} className="col-6 col-md-4 col-lg">
                    <ProductCard
                      product={p}
                      discount={DISCOUNT_CYCLE[i % DISCOUNT_CYCLE.length]}
                      rating={RATING_CYCLE[i % RATING_CYCLE.length]}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ══ Gift / Promo Banner ══ */}
          <div className="promo-banner mb-5">
            <div className="promo-left">
              <strong>Gift Special :</strong>
              &nbsp;Gift Every Single Day On Weekend &ndash; New coupon Code
            </div>
            <div className="promo-right">
              <span className="promo-right-label">Trade Assurance</span>
              <Link href="/products">VIEW MORE</Link>
            </div>
          </div>

          {/* ══ Deal of the Day ══ */}
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-0">
              <div className="d-flex align-items-center flex-wrap gap-3">
                <h2 className="section-title">Deal Of The Day</h2>
                <Countdown />
              </div>
              <div className="d-flex gap-2 pb-1">
                <button className="arrow-btn" aria-label="Previous">&#8249;</button>
                <button className="arrow-btn" aria-label="Next">&#8250;</button>
              </div>
            </div>
            <hr className="section-divider" />

            {displayed.length === 0 ? (
              <p className="text-muted py-3">Loading&hellip;</p>
            ) : (
              <div className="row g-3">
                {displayed.map((p, i) => (
                  <div key={`deal-${p.id}`} className="col-6 col-md-4 col-lg">
                    <ProductCard
                      product={p}
                      discount={i === 3 ? -3 : -4}
                      rating={RATING_CYCLE[i % RATING_CYCLE.length]}
                    />
                  </div>
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

