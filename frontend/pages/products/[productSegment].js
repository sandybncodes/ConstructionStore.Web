import { useRouter } from 'next/router'
import ProductDetailView from '../../components/ProductDetailView'

export default function ProductDetails() {
  const router = useRouter()
  const { productSegment, variant } = router.query
  // productSegment may be a plain id like "123" or "product123"
  const productId = productSegment
    ? parseInt(productSegment.replace(/^product/i, ''), 10) || null
    : null
  const variantId = variant ? parseInt(variant, 10) : null

  return <ProductDetailView productId={productId} variantId={variantId} />
}