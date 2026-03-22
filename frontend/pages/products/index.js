import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCard from '../../components/ProductCard'
import { getProducts, getCategories } from '../../lib/api'
import { useCart } from '../../lib/cartContext'
import { useLanguage } from '../../lib/i18nContext'

const PAGE_SIZE = 12

const RATING_MAP = [4, 4.5, 4, 4, 4, 4.5, 4, 4.5, 4, 4, 5, 4]

function SidebarSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="shop-sidebar-section">
      <div className="shop-sidebar-section-header" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <span className="shop-sidebar-toggle">{open ? '−' : '+'}</span>
      </div>
      {open && <div className="shop-sidebar-section-body">{children}</div>}
    </div>
  )
}

export default function Products() {
  const { addToCart } = useCart()
  const { t, translateCategoryName } = useLanguage()
  const router = useRouter()
  const [allProducts, setAllProducts]   = useState([])
  const [categories, setCategories]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [sortBy, setSortBy]             = useState('default')
  const [viewMode, setViewMode]         = useState('grid')
  const [selectedCat, setSelectedCat]   = useState(null)
  const [searchQuery, setSearchQuery]   = useState('')
  const [priceAll, setPriceAll]         = useState(true)
  const [priceMin, setPriceMin]         = useState('')
  const [priceMax, setPriceMax]         = useState('')
  const [filtersOpen, setFiltersOpen]   = useState(false)

  useEffect(() => {
    let mounted = true
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        if (!mounted) return
        setAllProducts(prods || [])
        setCategories(cats || [])
        setLoading(false)
      })
      .catch(err => { if (mounted) { setError(err.message); setLoading(false) } })
    return () => { mounted = false }
  }, [])

  // Read category from URL query param
  useEffect(() => {
    if (router.query.category) {
      setSelectedCat(Number(router.query.category))
    }
  }, [router.query.category])

  // Lock body scroll when mobile filter panel is open
  useEffect(() => {
    if (filtersOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [filtersOpen])

  // ── Filtering ──
  let filtered = [...allProducts]
  if (selectedCat) {
    filtered = filtered.filter(p => p.categoryId === selectedCat)
  }
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase()
    filtered = filtered.filter(p => p.name?.toLowerCase().includes(q))
  }
  if (!priceAll) {
    const min = priceMin !== '' ? parseFloat(priceMin) : 0
    const max = priceMax !== '' ? parseFloat(priceMax) : Infinity
    filtered = filtered.filter(p => p.price >= min && p.price <= max)
  }

  // ── Sorting ──
  if (sortBy === 'price-asc')  filtered.sort((a, b) => a.price - b.price)
  if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price)
  if (sortBy === 'name-asc')   filtered.sort((a, b) => a.name.localeCompare(b.name))

  const visibleProducts = filtered.slice(0, visibleCount)
  const totalResults    = filtered.length
  const showing         = visibleProducts.length

  return (
    <>
      <Header />

      {/* ── Breadcrumb bar ── */}
      <div className="shop-breadcrumb-bar">
        <div className="container-main">
          <nav className="shop-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">{t('navHome')}</Link>
            <span className="shop-breadcrumb-sep">/</span>
            <span>{t('shopBreadcrumb')}</span>
          </nav>
          <h1 className="shop-page-title">{t('shopPageTitle')}</h1>
        </div>
      </div>

      <main className="container-main">
        <div className="shop-layout">

      {/* ── Mobile filter backdrop ── */}
          {filtersOpen && (
            <div className="shop-filter-backdrop" onClick={() => setFiltersOpen(false)} aria-hidden="true" />
          )}

          {/* ══ SIDEBAR ══ */}
          <aside className={`shop-sidebar${filtersOpen ? ' shop-sidebar--open' : ''}`}>

            {/* Mobile-only header with close button */}
            <div className="shop-sidebar-mob-header">
              <span className="shop-sidebar-mob-title">{t('shopFilters')}</span>
              <button className="shop-sidebar-mob-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <SidebarSection title={t('shopByCategories')}>
              <ul className="shop-cat-list">
                <li>
                  <button
                    className={`shop-cat-btn${!selectedCat ? ' active' : ''}`}
                    onClick={() => { setSelectedCat(null); setVisibleCount(PAGE_SIZE) }}
                  >
                    {t('ourStore')}
                    <span className="shop-cat-count">({allProducts.length})</span>
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button
                      className={`shop-cat-btn${selectedCat === cat.id ? ' active' : ''}`}
                      onClick={() => { setSelectedCat(selectedCat === cat.id ? null : cat.id); setVisibleCount(PAGE_SIZE) }}
                    >
                      {translateCategoryName(cat.name)}
                      <span className="shop-cat-count">({cat.products?.length ?? 0})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </SidebarSection>

            <SidebarSection title={t('priceFilter')}>
              <div className="shop-price-options">
                <label className="shop-price-radio-label">
                  <input
                    type="radio"
                    name="priceMode"
                    checked={priceAll}
                    onChange={() => { setPriceAll(true); setPriceMin(''); setPriceMax('') }}
                  />
                  {t('priceAll')}
                </label>
                <label className="shop-price-radio-label">
                  <input
                    type="radio"
                    name="priceMode"
                    checked={!priceAll}
                    onChange={() => setPriceAll(false)}
                  />
                  {t('priceCustomRange')}
                </label>
                {!priceAll && (
                  <div className="shop-price-inputs">
                    <input
                      type="number"
                      min="0"
                      placeholder={t('minPrice')}
                      className="shop-price-input"
                      value={priceMin}
                      onChange={e => { setPriceMin(e.target.value); setVisibleCount(PAGE_SIZE) }}
                    />
                    <span className="shop-price-dash">—</span>
                    <input
                      type="number"
                      min="0"
                      placeholder={t('maxPrice')}
                      className="shop-price-input"
                      value={priceMax}
                      onChange={e => { setPriceMax(e.target.value); setVisibleCount(PAGE_SIZE) }}
                    />
                  </div>
                )}
              </div>
            </SidebarSection>

          </aside>

          {/* ══ MAIN CONTENT ══ */}
          <div className="shop-main">

            {/* ── Search Bar ── */}
            <div className="shop-search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shop-search-icon">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="shop-search-input"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE) }}
              />
              {searchQuery && (
                <button className="shop-search-clear" onClick={() => setSearchQuery('')} aria-label={t('clearSearch')}>×</button>
              )}
            </div>

            {/* ── Toolbar ── */}
            <div className="shop-toolbar">
              <div className="shop-toolbar-left">
                <button className="shop-filter-toggle-btn" onClick={() => setFiltersOpen(true)} aria-label={t('shopFilters')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                  {t('shopFilters')}
                </button>
                <span className="shop-results-count">
                  {loading ? t('loadingShort') : t('showing', { showing, total: totalResults })}
                </span>
              </div>
              <div className="shop-toolbar-right">
                <select
                  className="shop-sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="default">{t('sortDefault')}</option>
                  <option value="price-asc">{t('sortPriceAsc')}</option>
                  <option value="price-desc">{t('sortPriceDesc')}</option>
                  <option value="name-asc">{t('sortNameAZ')}</option>
                </select>
                <div className="shop-view-toggle">
                  <button
                    className={`shop-view-btn${viewMode === 'grid' ? ' active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label={t('gridView')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                    </svg>
                  </button>
                  <button
                    className={`shop-view-btn${viewMode === 'list' ? ' active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label={t('listView')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="4" width="18" height="2"/><rect x="3" y="11" width="18" height="2"/>
                      <rect x="3" y="18" width="18" height="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* ── Error ── */}
            {error && <div className="alert alert-danger mt-3">Error: {error}</div>}

            {/* ── Product Grid ── */}
            {loading ? (
              <div className="shop-loading">{t('loadingProducts')}</div>
            ) : visibleProducts.length === 0 ? (
              <div className="shop-empty">{t('noProductsMatch')}</div>
            ) : (
              <div className={viewMode === 'grid' ? 'shop-product-grid' : 'shop-product-list'}>
                {visibleProducts.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    rating={RATING_MAP[i % RATING_MAP.length]}
                    listMode={viewMode === 'list'}
                    onAddToCart={qty => addToCart(p, p.discount, qty)}
                  />
                ))}
              </div>
            )}

            {/* ── Load More ── */}
            {!loading && visibleCount < totalResults && (
              <div className="shop-load-more-wrap">
                <button
                  className="btn-yellow shop-load-more"
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                >
                  {t('loadMore')}
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
