const DEFAULT_FALLBACK_PRODUCT_IMAGE = '/resources/repair-tool.png'

export const FALLBACK_PRODUCT_IMAGE =
  process.env.NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL?.trim() || DEFAULT_FALLBACK_PRODUCT_IMAGE

function getValidImageUrl(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function normalizeImageEntry(image, index) {
  if (typeof image === 'string') {
    const imageUrl = getValidImageUrl(image)
    return imageUrl
      ? { id: `image-${index}`, imageUrl, isMain: index === 0, order: index }
      : null
  }

  if (!image || typeof image !== 'object') {
    return null
  }

  const imageUrl = getValidImageUrl(image.imageUrl || image.url || image.src)
  if (!imageUrl) {
    return null
  }

  return {
    id: image.id ?? `image-${index}`,
    imageUrl,
    isMain: Boolean(image.isMain),
    order: typeof image.sortOrder === 'number' ? image.sortOrder : index,
  }
}

function getLegacyImageEntries(product) {
  return [product?.imageUrl, product?.image]
    .map((value, index) => {
      const imageUrl = getValidImageUrl(value)
      return imageUrl
        ? { id: `legacy-image-${index}`, imageUrl, isMain: index === 0, order: index }
        : null
    })
    .filter(Boolean)
}

export function getProductImageSet(product) {
  const rawImages = Array.isArray(product?.images)
    ? product.images.map(normalizeImageEntry).filter(Boolean)
    : []

  const imageCandidates = rawImages.length > 0 ? rawImages : getLegacyImageEntries(product)

  if (imageCandidates.length === 0) {
    return [{ id: 'fallback-image', imageUrl: FALLBACK_PRODUCT_IMAGE, isMain: true, order: 0 }]
  }

  const dedupedImages = []
  const seenUrls = new Set()

  imageCandidates
    .slice()
    .sort((left, right) => {
      if (left.isMain !== right.isMain) {
        return left.isMain ? -1 : 1
      }
      return left.order - right.order
    })
    .forEach(image => {
      if (seenUrls.has(image.imageUrl)) {
        return
      }

      seenUrls.add(image.imageUrl)
      dedupedImages.push(image)
    })

  if (!dedupedImages.some(image => image.isMain)) {
    dedupedImages[0] = { ...dedupedImages[0], isMain: true }
  }

  return dedupedImages
}

export function getPrimaryProductImage(product) {
  return getProductImageSet(product)[0]?.imageUrl || FALLBACK_PRODUCT_IMAGE
}

export function getFallbackProductImage() {
  return FALLBACK_PRODUCT_IMAGE
}