import Link from 'next/link'
import { useState } from 'react'
import { useLanguage } from '../lib/i18nContext'
import { getFallbackProductImage, getProductImageSet } from '../lib/productImages'

export default function ProductCard({ product, rating = 4, listMode = false, onAddToCart }) {
  const { t, translateProductName } = useLanguage()
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)
  const hasDiscount = product.discount > 0
  const productName = translateProductName(product.name)
  const productImages = getProductImageSet(product)
  const previewImage = productImages[0]?.imageUrl || getFallbackProductImage()
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount / 100)
    : null

  function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    if (onAddToCart) onAddToCart(qty)
    setAdded(true)
    setTimeout(() => { setAdded(false); setQty(1) }, 1400)
  }

  function changeQty(delta, e) {
    e.preventDefault()
    e.stopPropagation()
    setQty(q => Math.max(1, q + delta))
  }

  function handleQtyInput(e) {
    e.stopPropagation()
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v) && v >= 1) setQty(v)
  }

  const productHref = product._variantId
    ? `/products/${product.id}?variant=${product._variantId}`
    : `/products/${product.id}`

  return (
    <div className={`product-card${listMode ? ' product-card--list' : ''}`}>
      <Link href={productHref}>
        <div className="product-card-img">
          <div className="product-card-img-glow" aria-hidden="true" />
          {hasDiscount && (
            <span className="discount-badge">-{product.discount}%</span>
          )}
          <img
            src={previewImage}
            alt={productName}
            onError={event => {
              event.currentTarget.onerror = null
              event.currentTarget.src = getFallbackProductImage()
            }}
          />
          <div className="product-card-gallery-dots" aria-hidden="true">
            {productImages.slice(0, 4).map(image => (
              <span
                key={image.id}
                className={`product-card-gallery-dot${image.isMain ? ' active' : ''}`}
              />
            ))}
            {productImages.length > 4 && (
              <span className="product-card-gallery-more">+{productImages.length - 4}</span>
            )}
          </div>
        </div>
        <div className="product-card-body">
          <div className="product-card-name">{productName}</div>
          {listMode && product.description && (
            <p className="product-card-desc">{product.description}</p>
          )}
          <div className="price-row">
            {hasDiscount && (
              <span className="price-old">{product.price?.toFixed(2)} MDL</span>
            )}
            <span className="price-current">
              {hasDiscount ? discountedPrice.toFixed(2) : (product.price?.toFixed(2) ?? '—')} MDL
            </span>
          </div>
          <div className="pc-qty-row" onClick={e => e.preventDefault()}>
            <div className="pc-qty-control">
              <button className="pc-qty-btn" onClick={e => changeQty(-1, e)} aria-label={t('decreaseQuantity')}>−</button>
              <input
                type="number"
                className="pc-qty-input"
                min="1"
                value={qty}
                onChange={handleQtyInput}
                onClick={e => e.preventDefault()}
                aria-label={t('quantityLabel')}
              />
              <button className="pc-qty-btn" onClick={e => changeQty(1, e)} aria-label={t('increaseQuantity')}>+</button>
            </div>
          </div>
          <button
            className={`add-to-cart-btn${added ? ' added' : ''}`}
            onClick={handleAddToCart}
            aria-label={t('addToCartAria', { name: product.name })}
          >
            {added ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                {t('added')}
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {t('addToCartBtn')}
              </>
            )}
          </button>
        </div>
      </Link>
    </div>
  )
}

