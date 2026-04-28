/**
 * Dimension / weight attribute names recognised for variant expansion and suffix building.
 * "Densitatea materialului" is intentionally excluded.
 * Greutate is matched by the 'greu' prefix to handle slight naming variations.
 */
const DIMENSION_EXACT = new Set(['inaltime', 'lungime', 'grosime', 'greutate', 'latime'])

/**
 * Formats a numeric value removing unnecessary trailing zeros.
 * 100.00 → "100", 10.50 → "10.5", 10.56 → "10.56"
 */
function fmtNum(n) {
  return parseFloat(n).toString()
}

/**
 * Returns the "Densitatea materialului" attribute of a variant if it exists, else null.
 */
function getDensityAttr(variant) {
  return (variant?.attributes || []).find(
    a => a.attributeName.toLowerCase().includes('densitat')
  ) || null
}

/**
 * Returns true when the given attribute name belongs to the dimension/weight group.
 * "Densitatea materialului" and any other density-named attributes are excluded.
 */
export function isDimensionAttr(name) {
  const lower = (name || '').toLowerCase()
  return DIMENSION_EXACT.has(lower) || lower.startsWith('greu')
}

/**
 * Returns the subset of a variant's attributes that are dimension/weight attributes.
 */
export function getDimensionAttrs(variant) {
  return (variant?.attributes || []).filter(a => isDimensionAttr(a.attributeName))
}

/**
 * Returns the set of lowercase dimension attribute names present on a variant.
 */
function getDimAttrNameSet(variant) {
  return new Set(getDimensionAttrs(variant).map(a => a.attributeName.toLowerCase()))
}

/**
 * Builds a compact dimension suffix for a variant name following these rules:
 *
 * - LUNGIME + LATIME           → "200x100 cm"
 * - LUNGIME + LATIME + GROSIME → "200x100x5 cm"
 * - above + other dim attrs    → "200x100x5 cm, 10 cm, 5 kg"
 * - INALTIME + LATIME          → "100x50 cm"
 * - INALTIME + LATIME + GROSIME→ "100x50x5 cm"
 * - INALTIME primary           → "100 cm, 5 kg"
 * - GREUTATE primary           → "5 kg, 100 cm"
 * - Densitatea materialului    → appended at the end, comma-separated
 * - Attribute names are never shown; only values+units
 */
export function buildVariantSuffix(variant) {
  const dims = getDimensionAttrs(variant)
  const density = getDensityAttr(variant)

  function byName(lowerName) {
    return dims.find(a => a.attributeName.toLowerCase() === lowerName)
  }
  function rawVal(a) {
    return a.valueNumeric != null ? fmtNum(a.valueNumeric) : (a.valueText || '')
  }
  function hasVal(a) {
    return a && (a.valueNumeric != null || (a.valueText && a.valueText.trim() !== ''))
  }
  function fmtPrimary(a) {
    return `${rawVal(a)}${a.unit ? ` ${a.unit}` : ''}`
  }
  function appendDensity(suffix) {
    if (!density || !hasVal(density)) return suffix
    const d = fmtPrimary(density)
    return suffix ? `${suffix}, ${d}` : d
  }

  if (dims.length === 0) return appendDensity('')

  const lungime  = byName('lungime')
  const latime   = byName('latime')
  const grosime  = byName('grosime')
  const inaltime = byName('inaltime')
  const greutate = dims.find(a => a.attributeName.toLowerCase().startsWith('greu'))

  // LUNGIME + LATIME [+ GROSIME] → cross-product block
  if (lungime && latime) {
    const crossParts = [lungime, latime]
    const inCross = new Set(['lungime', 'latime'])
    // Only include GROSIME in the cross if it actually has a value
    if (grosime && hasVal(grosime)) {
      crossParts.push(grosime)
      inCross.add('grosime')
    }
    const unit = lungime.unit || ''
    const crossStr = crossParts.map(a => rawVal(a)).join('x') + (unit ? ` ${unit}` : '')
    const others = dims.filter(a => !inCross.has(a.attributeName.toLowerCase()))
    const otherStr = others.filter(hasVal).map(fmtPrimary).join(', ')
    return appendDensity(otherStr ? `${crossStr}, ${otherStr}` : crossStr)
  }

  // INALTIME + LATIME [+ GROSIME] → cross-product block
  if (inaltime && latime) {
    const crossParts = [inaltime, latime]
    const inCross = new Set(['inaltime', 'latime'])
    if (grosime && hasVal(grosime)) {
      crossParts.push(grosime)
      inCross.add('grosime')
    }
    const unit = inaltime.unit || ''
    const crossStr = crossParts.map(a => rawVal(a)).join('x') + (unit ? ` ${unit}` : '')
    const others = dims.filter(a => !inCross.has(a.attributeName.toLowerCase()))
    const otherStr = others.filter(hasVal).map(fmtPrimary).join(', ')
    return appendDensity(otherStr ? `${crossStr}, ${otherStr}` : crossStr)
  }

  // INALTIME primary
  if (inaltime) {
    const others = dims.filter(a => a !== inaltime)
    const otherStr = others.filter(hasVal).map(fmtPrimary).join(', ')
    return appendDensity(otherStr ? `${fmtPrimary(inaltime)}, ${otherStr}` : fmtPrimary(inaltime))
  }

  // GREUTATE primary
  if (greutate) {
    const others = dims.filter(a => a !== greutate)
    const otherStr = others.filter(hasVal).map(fmtPrimary).join(', ')
    return appendDensity(otherStr ? `${fmtPrimary(greutate)}, ${otherStr}` : fmtPrimary(greutate))
  }

  // Fallback: all as value+unit comma-separated
  return appendDensity(dims.filter(hasVal).map(fmtPrimary).join(', '))
}

/**
 * Given an array of public products (from the API), expands products that have
 * 2 or more active variants with dimension attributes into one card per variant.
 *
 * Each expanded entry gets:
 *   - name:          product.name + dimension suffix (e.g. "Grosime: 5 cm, Inaltime: 100 cm")
 *   - price:         variant.price
 *   - stockQuantity: variant.stockQuantity
 *   - _variantId:    the variant's id (used for ?variant= URL param)
 *   - _isExpanded:   true
 *
 * Products with a single active variant are returned as-is.
 */
export function expandProducts(products) {
  const result = []

  for (const product of products) {
    const activeVariants = (product.variants || []).filter(v => v.isActive)

    if (activeVariants.length > 1) {
      // Expand only when at least one active variant has dimension or density attributes
      const hasDimensions = activeVariants.some(v => getDimensionAttrs(v).length > 0 || getDensityAttr(v) !== null)
      if (hasDimensions) {
        for (const variant of activeVariants) {
          const suffix = buildVariantSuffix(variant)
          result.push({
            ...product,
            name: suffix ? `${product.name} ${suffix}` : product.name,
            price: variant.price,
            stockQuantity: variant.stockQuantity,
            isActive: product.isActive && variant.isActive,
            _variantId: variant.id,
            _isExpanded: true,
          })
        }
        continue
      }
    }

    // Not expanded: use first active variant's price / stock
    const firstActive = activeVariants[0]
    const singleSuffix = firstActive ? buildVariantSuffix(firstActive) : ''
    result.push({
      ...product,
      name: singleSuffix ? `${product.name} ${singleSuffix}` : product.name,
      price: firstActive?.price ?? null,
      stockQuantity: firstActive?.stockQuantity ?? 0,
      _variantId: firstActive?.id ?? null,
      _isExpanded: false,
    })
  }

  return result
}

/**
 * Given a product and an optional variantId, returns the active variant to display.
 * Falls back to the first active variant, then the first variant in the list.
 */
export function resolveActiveVariant(product, variantId) {
  const variants = product?.variants || []
  if (variantId) {
    const found = variants.find(v => v.id === variantId)
    if (found) return found
  }
  return variants.find(v => v.isActive) || variants[0] || null
}

/**
 * Returns the variants from the same dimension-attribute group as `activeVariant`.
 * "Same group" means the set of dimension attribute names is identical.
 * Only active variants are included.
 */
export function getSameAttrVariants(allVariants, activeVariant) {
  if (!activeVariant) return []
  const activeNames = getDimAttrNameSet(activeVariant)
  return (allVariants || []).filter(v => {
    if (!v.isActive) return false
    const names = getDimAttrNameSet(v)
    return (
      names.size === activeNames.size &&
      [...names].every(n => activeNames.has(n))
    )
  })
}

/**
 * Returns an ordered list of dimension column names to display in the variants grid,
 * derived from the union of all dimension attributes across the given variants.
 */
export function getVariantGridColumns(variants) {
  const seen = new Map() // lowercase → original casing
  for (const v of variants) {
    for (const a of v.attributes || []) {
      if (isDimensionAttr(a.attributeName)) {
        const key = a.attributeName.toLowerCase()
        if (!seen.has(key)) seen.set(key, a.attributeName)
      }
    }
  }
  return [...seen.values()]
}

/**
 * Formats a single attribute value for display (numeric + unit or text fallback).
 */
export function formatAttrValue(attr) {
  if (!attr) return '—'
  if (attr.valueNumeric != null) {
    const n = fmtNum(attr.valueNumeric)
    return attr.unit ? `${n} ${attr.unit}` : n
  }
  const text = attr.valueText || '—'
  return attr.unit ? `${text} ${attr.unit}` : text
}
