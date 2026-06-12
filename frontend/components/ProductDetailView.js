import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Header from './Header'
import Seo from './Seo'
import Footer from './Footer'
import { getProductById } from '../lib/api'
import { useCart } from '../lib/cartContext'
import { useLanguage } from '../lib/i18nContext'
import { getFallbackProductImage, getProductImageSet } from '../lib/productImages'
import { resolveActiveVariant, getSameAttrVariants, getVariantGridColumns, formatAttrValue, buildVariantSuffix } from '../lib/variantUtils'

function Stars({ rating = 4 }) {
  const { t } = useLanguage()
  return (
    <div className="pd-stars">
      {[1, 2, 3, 4, 5].map(index => (
        <span key={index} style={{ color: index <= Math.round(rating) ? '#d89c22' : '#cbd5e1' }}>
          &#9733;
        </span>
      ))}
      <span className="pd-review-link">{t('customerReviewsLabel')}</span>
    </div>
  )
}

/**
 * Shared product detail view, used by both:
 *   pages/products/[id].js          → /products/123
 *   pages/products/[productSegment]/[variantSegment].js  → /products/product123/variant456
 *
 * Props:
 *   productId  – number
 *   variantId  – number | null
 */
export default function ProductDetailView({ productId, variantId }) {
  const router = useRouter()
  const { t, translateCategoryName, translateProductName } = useLanguage()
  const { addToCart } = useCart()
  const thumbRailRef = useRef(null)
  const touchStartX = useRef(null)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [added, setAdded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (!productId) return

    let mounted = true
    setLoading(true)
    setError(null)

    getProductById(productId)
      .then(data => {
        if (!mounted) return
        setProduct(data)
        setLoading(false)
      })
      .catch(err => {
        if (!mounted) return
        setError(err.message)
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [productId])

  useEffect(() => {
    setActiveImg(0)
    setQty(1)
    setActiveTab('description')
    setAdded(false)
  }, [product?.id, variantId])

  const activeVariant = resolveActiveVariant(product, variantId)

  const images = getProductImageSet(product)
  const variantSuffix = activeVariant ? buildVariantSuffix(activeVariant) : ''
  const baseProductName = product ? translateProductName(product) : ''
  const productName = variantSuffix ? `${baseProductName} ${variantSuffix}` : baseProductName
  const categoryName = product?.category
    ? translateCategoryName(product.category)
    : '—'
  const currentImage = images[activeImg] ?? images[0]
  const maxQuantity = Math.max(1, activeVariant?.stockQuantity || 1)
  const activePrice = activeVariant?.price ?? null
  const shortDescription = product?.description
    ?.split('.')
    .map(sentence => sentence.trim())
    .find(Boolean)
  const featurePoints = product?.description
    ? product.description
        .split('.')
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 12)
        .slice(0, 4)
    : []

  // Variant grid data — shown when product has 2 or more variants
  const sameAttrVariants = product && (product.variants || []).length > 1
    ? getSameAttrVariants(product.variants, activeVariant)
    : []
  const variantGridCols = getVariantGridColumns(sameAttrVariants)
  const showVariantsGrid = sameAttrVariants.length > 1

  useEffect(() => {
    if (!thumbRailRef.current) return
    const activeThumb = thumbRailRef.current.querySelector(`[data-thumb-index="${activeImg}"]`)
    activeThumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeImg])

  function setSafeQuantity(nextQuantity) {
    if (!product) return
    setQty(Math.max(1, Math.min(nextQuantity, maxQuantity)))
  }

  function handleAddToCart() {
    if (!product || !activeVariant || activeVariant.stockQuantity <= 0) return

    // Store the full variant name (with suffix) so the cart and order show correct info
    const fullVariantName = variantSuffix ? `${product.name} ${variantSuffix}` : product.name

    addToCart(
      {
        ...product,
        name: fullVariantName,
        price: activeVariant.price,
        stockQuantity: activeVariant.stockQuantity,
        _variantId: activeVariant.id,
        _variantAttributes: activeVariant.attributes || [],
      },
      0,
      qty
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  function prevImg() {
    setActiveImg(index => (index - 1 + images.length) % images.length)
  }

  function nextImg() {
    setActiveImg(index => (index + 1) % images.length)
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null || images.length < 2) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) delta > 0 ? nextImg() : prevImg()
    touchStartX.current = null
  }

  useEffect(() => {
    if (!lightboxOpen) return
    function onKey(e) { if (e.key === 'Escape') setLightboxOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen])

  const tabs = [
    { key: 'description', label: t('tabDescription') },
    { key: 'additional', label: t('tabAdditionalInfo') },
    { key: 'reviews', label: t('tabReviews') },
    { key: 'shipping', label: t('tabShipping') },
  ]

  const seoTitle = product ? `${productName} — ${t('siteTitle')}` : t('siteTitle')
  const seoDescription = shortDescription || t('heroDesc') || ''

  const productStructuredData = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productName,
        image: images.map(i => i.imageUrl),
        description: product.description || seoDescription,
        sku: product.sku || String(product.id),
        brand: { '@type': 'Brand', name: 'MirDav Company' },
        offers: {
          '@type': 'Offer',
          price: activePrice != null ? String(activePrice) : undefined,
          priceCurrency: 'MDL',
          availability: (activeVariant?.stockQuantity || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      }
    : null

  const breadcrumbStructuredData = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/` },
          { '@type': 'ListItem', position: 2, name: 'Products', item: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/products` },
          ...(product.category ? [{ '@type': 'ListItem', position: 3, name: categoryName, item: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/products?category=${product.categoryId || ''}` }] : []),
          { '@type': 'ListItem', position: (product.category ? 4 : 3), name: productName, item: typeof window !== 'undefined' ? window.location.href : `${process.env.NEXT_PUBLIC_SITE_URL || ''}/products/${product.id}` },
        ],
      }
    : null

  const combinedStructured = product ? [productStructuredData, breadcrumbStructuredData] : null

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        ogImage={currentImage?.imageUrl}
        structuredData={combinedStructured}
      />
      <Header />
      <main>
        <div className="pd-breadcrumb-bar">
          <div className="container-main pd-breadcrumb-inner">
            <button className="pd-back-btn" type="button" onClick={() => router.back()} aria-label={t('back')}>
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
                  <span>{categoryName}</span>
                </>
              )}
              {product && (
                <>
                  <span>/</span>
                  <span className="pd-breadcrumb-current">{productName}</span>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <strong>{t('couldNotLoad')}</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {product && (
            <>
              <div className="pd-main">
                <section className="pd-gallery-card">
                  <div className="pd-gallery-rail" ref={thumbRailRef} aria-label={t('galleryScrollHint')}>
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        className={`pd-thumb${activeImg === index ? ' active' : ''}`}
                        onClick={() => setActiveImg(index)}
                        aria-label={t('viewImage', { index: index + 1 })}
                        data-thumb-index={index}
                      >
                        <img
                          src={image.imageUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          onError={event => {
                            event.currentTarget.onerror = null
                            event.currentTarget.src = getFallbackProductImage()
                          }}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="pd-stage">
                    <div
                      className="pd-stage-frame"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      onClick={() => setLightboxOpen(true)}
                      style={{ cursor: 'zoom-in' }}
                      title={t('viewFullscreen')}
                    >
                      <img
                        src={currentImage?.imageUrl || getFallbackProductImage()}
                        alt={t('productImageAlt', { name: productName, index: activeImg + 1 })}
                        loading="eager"
                        decoding="async"
                        onError={event => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = getFallbackProductImage()
                        }}
                      />
                    </div>

                    {images.length > 1 && (
                      <div className="pd-stage-nav">
                        <button type="button" className="pd-gallery-arrow" onClick={prevImg} aria-label={t('previousImage')}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>
                        <span className="pd-stage-progress">{activeImg + 1} / {images.length}</span>
                        <button type="button" className="pd-gallery-arrow" onClick={nextImg} aria-label={t('nextImage')}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {images.length > 1 && <p className="pd-gallery-hint">{t('galleryScrollHint')}</p>}
                  </div>
                </section>

                <section className="pd-info-card">
                  <div className="pd-info-head">
                    <h1 className="pd-name">{productName}</h1>
                    <p className="pd-lead">{shortDescription || t('noDescriptionAvailable')}</p>
                  </div>

                  <div className="pd-price-block">
                    <div className="pd-price-row">
                      <span className="pd-price-amount">{activePrice != null ? activePrice.toFixed(2) : '—'}</span>
                      <span className="pd-price-currency">MDL</span>
                    </div>
                  </div>

                  <div className="pd-fact-grid">
                    <div className="pd-fact-card">
                      <span>{t('category')}</span>
                      <strong>{categoryName}</strong>
                    </div>
                    <div className="pd-fact-card">
                      <span>{t('stock')}</span>
                      <strong>{activeVariant?.stockQuantity ?? 0} {t('units')}</strong>
                    </div>
                    <div className="pd-fact-card">
                      <span>{t('status')}</span>
                      <strong>{product.isActive && (activeVariant?.stockQuantity ?? 0) > 0 ? t('available') : t('unavailable')}</strong>
                    </div>
                  </div>

                  <div className="pd-purchase-card">
                    <div className="pd-stock">
                      <span className={`pd-stock-dot${(activeVariant?.stockQuantity ?? 0) <= 0 ? ' pd-stock-dot--unavailable' : ''}`} />
                      <span>
                        {(activeVariant?.stockQuantity ?? 0) > 0
                          ? `${activeVariant.stockQuantity} ${t('inStock')}`
                          : t('unavailable')}
                      </span>
                    </div>

                    <div className="pd-cart-row">
                      <div className="pd-qty">
                        <button type="button" onClick={() => setSafeQuantity(qty - 1)} aria-label={t('decreaseQuantity')}>
                          &#8722;
                        </button>
                        <input
                          type="number"
                          className="pd-qty-input"
                          min="1"
                          max={maxQuantity}
                          value={qty}
                          onChange={event => {
                            const nextValue = parseInt(event.target.value, 10)
                            if (!Number.isNaN(nextValue)) setSafeQuantity(nextValue)
                          }}
                          aria-label={t('quantityLabel')}
                        />
                        <button type="button" onClick={() => setSafeQuantity(qty + 1)} aria-label={t('increaseQuantity')}>
                          &#43;
                        </button>
                      </div>

                      <button
                        type="button"
                        className={`pd-btn-cart${added ? ' added' : ''}`}
                        onClick={handleAddToCart}
                        disabled={added || (activeVariant?.stockQuantity ?? 0) <= 0}
                      >
                        {added ? (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {t('addedToCart')}
                          </>
                        ) : (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="9" cy="21" r="1" />
                              <circle cx="20" cy="21" r="1" />
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            {t('addToCart')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pd-delivery">
                    <div className="pd-delivery-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                      <span><strong>{t('estimatedDelivery')}:</strong> {t('estimatedDeliveryValue')}</span>
                    </div>
                    <div className="pd-delivery-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span><strong>{t('freeShippingReturns')}:</strong> {t('freeShippingReturnsValue')}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* ── Variants grid ── */}
              {showVariantsGrid && (
                <div className="pd-variants-section">
                  <h3 className="pd-variants-heading">{t('otherVariants')}</h3>
                  <div className="pd-variants-table-wrap">
                    <table className="pd-variants-table">
                      <thead>
                        <tr>
                          {variantGridCols.map(col => (
                            <th key={col}>{col}</th>
                          ))}
                          <th>{t('price')}</th>
                          <th>{t('stock')}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sameAttrVariants.map(v => {
                          const isCurrent = v.id === activeVariant?.id
                          return (
                            <tr key={v.id} className={isCurrent ? 'pd-variant-row--active' : ''}>
                              {variantGridCols.map(col => {
                                const attr = (v.attributes || []).find(
                                  a => a.attributeName.toLowerCase() === col.toLowerCase()
                                )
                                return <td key={col}>{formatAttrValue(attr)}</td>
                              })}
                              <td>{v.price.toFixed(2)} MDL</td>
                              <td>{v.stockQuantity} {t('units')}</td>
                              <td>
                                {isCurrent
                                  ? <span className="pd-variant-current-badge">{t('currentVariant')}</span>
                                  : <Link href={`/products/product${product.id}/variant${v.id}`} className="pd-variant-select-link">{t('selectVariant')}</Link>
                                }
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pd-tabs-section">
                <div className="pd-tab-bar" role="tablist">
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.key}
                      className={`pd-tab${activeTab === tab.key ? ' active' : ''}`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="pd-tab-content" role="tabpanel">
                  {activeTab === 'description' && (
                    <div>
                      <h3 className="pd-tab-heading">{t('aboutThisItem')}</h3>
                      <p>{product.description || t('noDescriptionAvailable')}</p>
                      <div className="pd-tech-table-wrap">
                        <table className="pd-tech-table">
                          <thead>
                            <tr>
                              <th colSpan={2}>{t('technicalDetails')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr><td>{t('category')}</td><td>{categoryName}</td></tr>
                            <tr><td>{t('stock')}</td><td>{activeVariant?.stockQuantity ?? 0} {t('units')}</td></tr>
                            <tr><td>{t('price')}</td><td>{activePrice != null ? activePrice.toFixed(2) : '—'} MDL</td></tr>
                            <tr><td>{t('status')}</td><td>{product.isActive && (activeVariant?.stockQuantity ?? 0) > 0 ? t('available') : t('unavailable')}</td></tr>
                            {(activeVariant?.attributes || []).map(attr => (
                              <tr key={attr.attributeName}>
                                <td>{attr.attributeName}</td>
                                <td>{formatAttrValue(attr)}</td>
                              </tr>
                            ))}
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

      {/* ── Fullscreen Lightbox ── */}
      {lightboxOpen && (
        <div
          className="pd-lightbox"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t('closeFullscreen')}
        >
          <button
            type="button"
            className="pd-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label={t('closeFullscreen')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {images.length > 1 && (
            <button
              type="button"
              className="pd-lightbox-arrow pd-lightbox-arrow--prev"
              onClick={e => { e.stopPropagation(); prevImg() }}
              aria-label={t('previousImage')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <img
            className="pd-lightbox-img"
            src={currentImage?.imageUrl || getFallbackProductImage()}
            alt={t('productImageAlt', { name: productName, index: activeImg + 1 })}
            loading="eager"
            decoding="async"
            onClick={e => e.stopPropagation()}
            onError={event => {
              event.currentTarget.onerror = null
              event.currentTarget.src = getFallbackProductImage()
            }}
          />

          {images.length > 1 && (
            <button
              type="button"
              className="pd-lightbox-arrow pd-lightbox-arrow--next"
              onClick={e => { e.stopPropagation(); nextImg() }}
              aria-label={t('nextImage')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          <div className="pd-lightbox-counter" onClick={e => e.stopPropagation()}>
            {activeImg + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
