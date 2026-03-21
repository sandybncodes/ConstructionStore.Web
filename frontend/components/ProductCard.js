import Link from 'next/link'

function Stars({ rating = 4 }) {
  return (
    <div className="star-rating" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#f0b429' : '#d1d5db' }}>&#9733;</span>
      ))}
    </div>
  )
}

export default function ProductCard({ product, discount, rating = 4 }) {
  const hasDiscount = typeof discount === 'number' && discount !== 0
  const originalPrice = hasDiscount
    ? product.price / (1 + discount / 100)
    : null

  return (
    <div className="product-card">
      <Link href={`/products/${product.id}`}>
        <div className="product-card-img">
          {hasDiscount && (
            <span className="discount-badge">{discount}%</span>
          )}
          <img
            src={product.imageUrl || product.image || '/resources/repair-tool.png'}
            alt={product.name}
          />
        </div>
        <div className="product-card-body">
          <div className="product-card-name">{product.name}</div>
          <Stars rating={rating} />
          <div className="price-row">
            {hasDiscount && originalPrice != null && (
              <span className="price-old">${originalPrice.toFixed(0)}</span>
            )}
            <span className="price-current">${product.price?.toFixed(2) ?? '—'}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

