import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCard from '../../components/ProductCard'
import { getProducts } from '../../lib/api'

export default function Products(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    getProducts().then(data=>{
      if(mounted){ setProducts(data || []); setLoading(false) }
    }).catch(err=>{ if(mounted){ setError(err.message); setLoading(false) }})
    return ()=>{ mounted = false }
  },[])

  return (
    <>
      <Header />
      <main className="container container-wide py-5">
        <h2>Products</h2>
        {loading && <div className="text-muted">Loading products...</div>}
        {error && <div className="alert alert-danger">Error: {error}</div>}

        <div className="row g-3 mt-3">
          {products.map(p => (
            <div key={p.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
