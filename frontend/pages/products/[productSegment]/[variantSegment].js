import { useRouter } from 'next/router'
import ProductDetailView from '../../../components/ProductDetailView'

/**
 * Handles URLs of the form /products/product{id}/variant{id}
 * e.g. /products/product12/variant34
 */
export default function ProductVariantPage() {
  const router = useRouter()
  const { productSegment, variantSegment } = router.query

  // Parse numeric IDs from "product123" and "variant456"
  const productId = productSegment
    ? parseInt(productSegment.replace(/^product/i, ''), 10) || null
    : null
  const variantId = variantSegment
    ? parseInt(variantSegment.replace(/^variant/i, ''), 10) || null
    : null

  return <ProductDetailView productId={productId} variantId={variantId} />
}
