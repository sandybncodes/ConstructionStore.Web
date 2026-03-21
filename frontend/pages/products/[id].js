import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { getProductById } from '../../lib/api'
import { useCart } from '../../lib/cartContext'
import { useLanguage } from '../../lib/i18nContext'

function Stars({ rating = 4 }) {
  const { t } = useLanguage()
  return (
    <div className="pd-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#f0b429' : '#d1d5db' }}>&#9733;</span>
      ))}
      <span className="pd-review-link">{t('customerReviewsLabel')}</span>
    </div>
  )
}

export default function ProductDetails() {
  const router = useRouter()
  const { id } = router.query
  const { t } = useLanguage()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) {
      addToCart(product, product.discount)
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  useEffect(() => {
    if (!id) return
    let mounted = true
    getProductById(id)
      .then(data => { if (mounted) { setProduct(data); setLoading(false) } })
      .catch(err => { if (mounted) { setError(err.message); setLoading(false) } })
    return () => { mounted = false }
  }, [id])

  const images = product?.images?.length
    ? product.images.map(img => img.imageUrl)
    : ['/resources/repair-tool.png']

  const prevImg = () => setActiveImg(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setActiveImg(i => (i + 1) % images.length)

  const TABS = [
    { key: 'description', label: t('tabDescription') },
    { key: 'additional', label: t('tabAdditionalInfo') },
    { key: 'reviews', label: t('tabReviews') },
    { key: 'shipping', label: t('tabShipping') },
  ]

  return (
    <>
      <Header />
      <main>

        {/* ── Breadcrumb bar ── */}
        <div className="pd-breadcrumb-bar">
          <div className="container-main pd-breadcrumb-inner">
            <button className="pd-back-btn" onClick={() => router.back()} aria-label="Go back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              {t('back')}
            </button>
            <nav className="pd-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">{t('navHome')}</Link>
              <span>/</span>
              <Link href="/products">{t('navShop')}</Link>
              {product?.category && (
                <>
                  <span>/</span>
                  <span>{product.category.name}</span>
                </>
              )}
              {product && (
                <>
                  <span>/</span>
                  <span className="pd-breadcrumb-current">{product.name}</span>
                </>
              )}
            </nav>
          </div>
        </div>

        <div className="container-main pd-page">

          {loading && (
            <div className="pd-loading">
              <div className="pd-loading-spinner" />
              <span>{t('loadingProduct')}</span>
            </div>
          )}

          {error && (
            <div className="pd-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div><strong>{t('couldNotLoad')}</strong><p>{error}</p></div>
            </div>
          )}

          {product && (
            <>
              {/* ══ Main product section ══ */}
              <div className="pd-main">

                {/* ── Image gallery ── */}
                <div className="pd-gallery">
                  <div className="pd-gallery-main">
                    <img src={images[activeImg]} alt={product.name} onError={e => { e.currentTarget.src = '/resources/repair-tool.png' }} />
                    {images.length > 1 && (
                      <>
                        <button className="pd-gallery-arrow left" onClick={prevImg} aria-label="Previous image">&#8249;</button>
                        <button className="pd-gallery-arrow right" onClick={nextImg} aria-label="Next image">&#8250;</button>
                      </>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="pd-gallery-thumbs">
                      {images.map((src, i) => (
                        <button
                          key={i}
                          className={`pd-thumb${activeImg === i ? ' active' : ''}`}
                          onClick={() => setActiveImg(i)}
                          aria-label={`View image ${i + 1}`}
                        >
                          <img src={src} alt="" onError={e => { e.currentTarget.src = '/resources/repair-tool.png' }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Product info ── */}
                <div className="pd-info">
                  <h1 className="pd-name">{product.name}</h1>

                  <div className="pd-price-block">
                    {product.discount > 0 && (
                      <div className="pd-price-original-row">
                        <span className="pd-price-original">{product.price != null ? product.price.toFixed(2) : '—'} MDL</span>
                        <span className="pd-discount-badge">-{product.discount}%</span>
                      </div>
                    )}
                    <div className="pd-price-row">
                      <span className="pd-price-amount">
                        {product.price != null
                          ? product.discount > 0
                            ? (product.price * (1 - product.discount / 100)).toFixed(2)
                            : product.price.toFixed(2)
                          : '—'}
                      </span>
                      <span className="pd-price-currency">MDL</span>
                    </div>
                  </div>

                  <Stars rating={4} />

                  {product.description && (
                    <p className="pd-description">{product.description}</p>
                  )}

                  {/* Stock */}
                  <div className="pd-stock">
                    <span className="pd-stock-dot" />
                    <span>{product.stockQuantity} {t('inStock')}</span>
                  </div>

                  {/* Quantity + Add to Cart */}
                  <div className="pd-cart-row">
                    <div className="pd-qty">
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">&#8722;</button>
                      <input
                        type="number"
                        className="pd-qty-input"
                        min="1"
                        max={product.stockQuantity || 999}
                        value={qty}
                        onChange={e => {
                          const v = parseInt(e.target.value, 10)
                          if (!isNaN(v) && v >= 1) setQty(Math.min(v, product.stockQuantity || 999))
                        }}
                        aria-label={t('quantityLabel')}
                      />
                      <button onClick={() => setQty(q => Math.min(q + 1, product.stockQuantity || 999))} aria-label="Increase quantity">&#43;</button>
                    </div>
                    <button
                      className={`pd-btn-cart${added ? ' added' : ''}`}
                      onClick={handleAddToCart}
                      disabled={added}
                    >
                      {added ? (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                          {t('addedToCart')}
                        </>
                      ) : (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                          </svg>
                          {t('addToCart')}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Delivery info */}
                  <div className="pd-delivery">
                    <div className="pd-delivery-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                      <span><strong>{t('estimatedDelivery')} :</strong> {t('estimatedDeliveryValue')}</span>
                    </div>
                    <div className="pd-delivery-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span><strong>{t('freeShippingReturns')} :</strong> {t('freeShippingReturnsValue')}</span>
                    </div>
                  </div>


                </div>
              </div>

              {/* ══ Tabs ══ */}
              <div className="pd-tabs-section">
                <div className="pd-tab-bar" role="tablist">
                  {TABS.map(t => (
                    <button
                      key={t.key}
                      role="tab"
                      aria-selected={activeTab === t.key}
                      className={`pd-tab${activeTab === t.key ? ' active' : ''}`}
                      onClick={() => setActiveTab(t.key)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="pd-tab-content" role="tabpanel">

                  {activeTab === 'description' && (
                    <div id="reviews">
                      <h3 className="pd-tab-heading">{t('aboutThisItem')}</h3>
                      <p>{product.description || t('noDescriptionAvailable')}</p>
                      {product.description && (
                        <ul className="pd-feature-list">
                          {product.description.split('.').filter(s => s.trim().length > 10).slice(0, 5).map((s, i) => (
                            <li key={i}>{s.trim()}.</li>
                          ))}
                        </ul>
                      )}
                      <div className="pd-tech-table-wrap">
                        <table className="pd-tech-table">
                          <thead>
                            <tr><th colSpan={2}>{t('technicalDetails')}</th></tr>
                          </thead>
                          <tbody>
                            <tr><td>{t('category')}</td><td>{product.category?.name ?? '—'}</td></tr>
                            <tr><td>{t('stock')}</td><td>{product.stockQuantity} {t('units')}</td></tr>
                            <tr><td>{t('price')}</td><td>{product.discount > 0 ? (product.price * (1 - product.discount / 100)).toFixed(2) : product.price?.toFixed(2)} MDL</td></tr>
                            <tr><td>{t('status')}</td><td>{product.isActive ? t('available') : t('unavailable')}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'additional' && (
                    <div>
                      <h3 className="pd-tab-heading">{t('tabAdditionalInfo')}</h3>
                      <p className="pd-muted">{t('noAdditionalInfo')}</p>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div>
                      <h3 className="pd-tab-heading">{t('customerReviews')}</h3>
                      <p className="pd-muted">{t('noReviews')}</p>
                    </div>
                  )}

                  {activeTab === 'shipping' && (
                    <div>
                      <h3 className="pd-tab-heading">{t('shippingTitle')}</h3>
                      <p>{t('shippingPolicy')}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        /* ── Breadcrumb bar ── */
        .pd-breadcrumb-bar {
          background: var(--bg-light);
          border-bottom: 1px solid var(--border);
          padding: 10px 0;
        }
        .pd-breadcrumb-inner {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .pd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1.5px solid var(--border);
          border-radius: 6px;
          padding: 5px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dark);
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .pd-back-btn svg { width: 14px; height: 14px; }
        .pd-back-btn:hover { border-color: var(--blue-dark); color: var(--blue-dark); }

        .pd-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-gray);
          flex-wrap: wrap;
        }
        .pd-breadcrumb a { color: var(--text-gray); text-decoration: none; }
        .pd-breadcrumb a:hover { color: var(--blue-dark); text-decoration: underline; }
        .pd-breadcrumb-current { color: var(--text-dark); font-weight: 600; }

        /* ── Page wrapper ── */
        .pd-page { padding: 36px 16px 72px; }

        /* ── Loading / Error ── */
        .pd-loading {
          display: flex;
          align-items: center;
          gap: 14px;
          color: var(--text-gray);
          padding: 60px 0;
          font-size: 15px;
        }
        .pd-loading-spinner {
          width: 28px; height: 28px;
          border: 3px solid var(--border);
          border-top-color: var(--blue-dark);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .pd-error {
          display: flex;
          gap: 14px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          border-radius: 10px;
          padding: 24px;
          color: #9f1239;
          max-width: 560px;
          margin: 40px auto;
        }
        .pd-error svg { width: 24px; height: 24px; flex-shrink: 0; }
        .pd-error strong { display: block; margin-bottom: 4px; }
        .pd-error p { margin: 0; font-size: 13px; opacity: 0.8; }

        /* ══ Main two-column layout ══ */
        .pd-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: flex-start;
          margin-bottom: 56px;
        }
        @media (max-width: 768px) {
          .pd-main { grid-template-columns: 1fr; gap: 28px; }
        }

        /* ── Gallery ── */
        .pd-gallery { display: flex; flex-direction: column; gap: 12px; }

        .pd-gallery-main {
          position: relative;
          background: var(--bg-light);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pd-gallery-main img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 16px;
        }
        .pd-gallery-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.9);
          border: 1px solid var(--border);
          border-radius: 50%;
          width: 34px; height: 34px;
          font-size: 22px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          transition: background 0.15s;
          color: var(--text-dark);
        }
        .pd-gallery-arrow:hover { background: #fff; }
        .pd-gallery-arrow.left { left: 8px; }
        .pd-gallery-arrow.right { right: 8px; }

        .pd-gallery-thumbs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pd-thumb {
          width: 68px; height: 68px;
          border: 2px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          padding: 0;
          background: var(--bg-light);
          transition: border-color 0.15s;
        }
        .pd-thumb img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
        .pd-thumb.active { border-color: var(--yellow); }
        .pd-thumb:hover { border-color: var(--blue-dark); }

        /* ── Product info ── */
        .pd-info { display: flex; flex-direction: column; gap: 16px; }

        .pd-name {
          font-size: clamp(20px, 3vw, 28px);
          font-weight: 800;
          color: var(--text-dark);
          margin: 0;
          line-height: 1.2;
        }

        /* ── Price block ── */
        .pd-price-block {
          display: flex;
          align-items: center;
        }.pd-price-row {
          display: flex;
          align-items: baseline;
          gap: 1px;
          background: linear-gradient(135deg, var(--blue-dark) 0%, #2563eb 100%);
          color: #fff;
          padding: 10px 20px 10px 16px;
          border-radius: 10px;
          box-shadow: 0 4px 16px rgba(26,60,139,0.22);
          position: relative;
          overflow: hidden;
        }
        .pd-price-row::before {
          content: '';
          position: absolute;
          top: -18px; right: -18px;
          width: 64px; height: 64px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
        }
        .pd-price-currency {
          font-size: 16px;
          font-weight: 700;
          line-height: 1;
          opacity: 0.85;
          margin-left: 6px;
          align-self: baseline;
        }
        .pd-price-amount {
          font-size: 38px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -1px;
        }

        .pd-price-original-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }
        .pd-price-original {
          font-size: 18px;
          color: rgba(255,255,255,0.6);
          text-decoration: line-through;
        }
        .pd-discount-badge {
          background: rgba(255,255,255,0.2);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .pd-stars {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 17px;
        }
        .pd-review-link {
          font-size: 13px;
          color: var(--blue-dark);
          text-decoration: none;
          margin-left: 6px;
        }
        .pd-review-link:hover { text-decoration: underline; }

        .pd-description {
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-gray);
          margin: 0;
        }

        /* Color swatches */
        .pd-option-group { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .pd-option-label { font-size: 14px; font-weight: 700; color: var(--text-dark); min-width: 44px; }
        .pd-swatches { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        .pd-swatch {
          width: 48px; height: 48px;
          border-radius: 6px;
          border: 2px solid transparent;
          cursor: pointer;
          overflow: hidden;
          padding: 2px;
          transition: border-color 0.15s, transform 0.1s;
        }
        .pd-swatch img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
        .pd-swatch.active { border-color: var(--text-dark); transform: scale(1.05); }
        .pd-swatch:hover { border-color: var(--text-gray); }

        .pd-swatch-clear {
          background: none;
          border: none;
          font-size: 13px;
          color: var(--blue-dark);
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          margin-left: 4px;
        }

        /* Stock */
        .pd-stock {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #059669;
          font-weight: 600;
        }
        .pd-stock-dot {
          width: 8px; height: 8px;
          background: #059669;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Cart row */
        .pd-cart-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pd-qty {
          display: flex;
          align-items: center;
          border: 1.5px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
          height: 46px;
        }
        .pd-qty button {
          width: 38px; height: 100%;
          background: var(--bg-light);
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: var(--text-dark);
          transition: background 0.12s;
          line-height: 1;
        }
        .pd-qty button:hover { background: #e5e7eb; }
        .pd-qty-input {
          width: 52px;
          text-align: center;
          font-weight: 700;
          font-size: 15px;
          border: none;
          border-left: 1.5px solid var(--border);
          border-right: 1.5px solid var(--border);
          height: 100%;
          outline: none;
          background: #fff;
          -moz-appearance: textfield;
          color: var(--text-dark);
        }
        .pd-qty-input::-webkit-outer-spin-button,
        .pd-qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

        .pd-btn-cart {
          flex: 1;
          min-width: 160px;
          height: 46px;
          background: var(--yellow);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.1s;
        }
        .pd-btn-cart:hover:not(:disabled) { background: #d49820; transform: translateY(-1px); }
        .pd-btn-cart.added { background: #16a34a; cursor: default; }
        .pd-btn-cart:disabled { opacity: 0.85; }

        .pd-btn-buy {
          width: 100%;
          height: 46px;
          background: var(--blue-dark);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .pd-btn-buy:hover { background: #142e6e; transform: translateY(-1px); }

        /* Actions */
        .pd-actions {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .pd-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dark);
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
        }
        .pd-action-btn svg { width: 15px; height: 15px; }
        .pd-action-btn:hover { color: var(--blue-dark); }

        /* Delivery */
        .pd-delivery {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 14px 16px;
          background: var(--bg-light);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
        }
        .pd-delivery-row { display: flex; align-items: flex-start; gap: 10px; line-height: 1.5; }
        .pd-delivery-row svg { width: 16px; height: 16px; flex-shrink: 0; color: var(--blue-dark); margin-top: 2px; }

        /* Payment */
        .pd-payment {
          text-align: center;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 16px;
        }
        .pd-payment-icons { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
        .pd-pay-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 28px;
          padding: 0 10px;
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: var(--text-dark);
          background: #fff;
        }
        .pd-payment-label {
          font-size: 11px;
          color: var(--text-gray);
          margin: 0;
          font-weight: 600;
        }

        /* ══ Tabs ══ */
        .pd-tabs-section {
          border-top: 1px solid var(--border);
          margin-top: 8px;
        }
        .pd-tab-bar {
          display: flex;
          gap: 0;
          border-bottom: 2px solid var(--border);
          overflow-x: auto;
        }
        .pd-tab-bar::-webkit-scrollbar { height: 0; }
        .pd-tab {
          padding: 14px 22px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-gray);
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.15s, border-color 0.15s;
        }
        .pd-tab:hover { color: var(--text-dark); }
        .pd-tab.active { color: var(--text-dark); border-bottom-color: var(--text-dark); }

        .pd-tab-content { padding: 32px 0 48px; }

        .pd-tab-heading {
          font-size: 20px;
          font-weight: 800;
          margin: 0 0 16px;
          color: var(--text-dark);
        }

        .pd-feature-list {
          margin: 12px 0 20px;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-gray);
        }

        .pd-muted { font-size: 14px; color: var(--text-gray); }

        /* Technical table */
        .pd-tech-table-wrap {
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          margin-top: 28px;
        }
        .pd-tech-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .pd-tech-table thead tr th {
          background: var(--bg-light);
          padding: 12px 16px;
          text-align: left;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--blue-dark);
          border-bottom: 1px solid var(--border);
        }
        .pd-tech-table tbody tr { border-bottom: 1px solid var(--border); }
        .pd-tech-table tbody tr:last-child { border-bottom: none; }
        .pd-tech-table tbody td { padding: 12px 16px; vertical-align: top; }
        .pd-tech-table tbody td:first-child {
          font-weight: 700;
          color: var(--text-dark);
          width: 180px;
          background: var(--bg-light);
        }
        .pd-tech-table tbody td:last-child { color: var(--text-gray); }
      `}</style>
    </>
  )
}
