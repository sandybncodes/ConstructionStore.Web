import Link from 'next/link'
import { useState } from 'react'
import { useLanguage } from '../lib/i18nContext'

function Stars({ rating = 4 }) {
  const { t } = useLanguage()
  return (
    <div className="star-rating" aria-label={t('ratingAria', { rating })}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#f0b429' : '#d1d5db' }}>&#9733;</span>
      ))}
    </div>
  )
}

export default function ProductCard({ product, rating = 4, listMode = false, onAddToCart }) {
  const { t, translateProductName } = useLanguage()
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)
  const hasDiscount = product.discount > 0
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

  return (
    <div className={`product-card${listMode ? ' product-card--list' : ''}`}>
      <Link href={`/products/${product.id}`}>
        <div className="product-card-img">
          {hasDiscount && (
            <span className="discount-badge">-{product.discount}%</span>
          )}
          <img
            src={product.imageUrl || product.image || '/resources/repair-tool.png'}
            alt={product.name}
          />
        </div>
        <div className="product-card-body">
          <div className="product-card-name">{translateProductName(product.name)}</div>
          <Stars rating={rating} />
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

