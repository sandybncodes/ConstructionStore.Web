import Link from 'next/link'

export default function ProductCard({product}){
  return (
    <div className="card product-card h-100 shadow-sm">
      <img src={product.image || '/resources/repair-tool.png'} className="card-img-top" alt={product.name} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="text-muted mb-2">{product.brand || ''}</p>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div className="fw-bold">${product.price?.toFixed(2) ?? '—'}</div>
          <Link href={`/products/${product.id}`} className="btn btn-primary btn-sm">View</Link>
        </div>
      </div>
    </div>
  )
}
