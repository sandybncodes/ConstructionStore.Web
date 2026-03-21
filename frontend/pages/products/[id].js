import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { getProductById } from '../../lib/api'

export default function ProductDetails(){
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    if(!id) return
    let mounted = true
    getProductById(id).then(data=>{ if(mounted){ setProduct(data); setLoading(false) } }).catch(err=>{ if(mounted){ setError(err.message); setLoading(false) } })
    return ()=>{ mounted = false }
  },[id])

  return (
    <>
      <Header />
      <main className="container container-wide py-5">
        {loading && <div className="text-muted">Loading...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {product && (
          <div className="row bg-white p-4 rounded shadow-sm">
            <div className="col-md-5">
              <img src={product.image || '/resources/repair-tool.png'} className="img-fluid rounded" alt={product.name} />
            </div>
            <div className="col-md-7">
              <h2>{product.name}</h2>
              <p className="text-muted">{product.brand}</p>
              <h4 className="text-primary">${product.price?.toFixed(2) ?? '—'}</h4>
              <p className="mt-3">{product.description}</p>
              <div className="mt-4">
                <button className="btn btn-success me-2">Add to cart</button>
                <button className="btn btn-outline-secondary">Request quote</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
