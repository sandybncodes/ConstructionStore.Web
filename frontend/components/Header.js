import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { getCategories } from '../lib/api'
import { useCart } from '../lib/cartContext'
import { useLanguage } from '../lib/i18nContext'

const LANG_OPTIONS = [
  { code: 'ro', label: 'RO', flag: '\uD83C\uDDF7\uD83C\uDDF4', name: 'Română' },
  { code: 'ru', label: 'RU', flag: '\uD83C\uDDF7\uD83C\uDDFA', name: 'Русский' },
  { code: 'en', label: 'EN', flag: '\uD83C\uDDEC\uD83C\uDDE7', name: 'English' },
]

function LanguageSwitcher() {
  const { lang, changeLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = LANG_OPTIONS.find(l => l.code === lang) || LANG_OPTIONS[0]

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        className="lang-switcher-btn"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="lang-flag">{current.flag}</span>
        <span className="lang-code">{current.label}</span>
        <svg className="lang-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <ul className="lang-dropdown" role="listbox">
          {LANG_OPTIONS.map(option => (
            <li key={option.code} role="option" aria-selected={lang === option.code}>
              <button
                className={`lang-option${lang === option.code ? ' active' : ''}`}
                onClick={() => { changeLanguage(option.code); setOpen(false) }}
              >
                <span className="lang-flag">{option.flag}</span>
                <span className="lang-name">{option.name}</span>
                <span className="lang-code-small">{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Header() {
  const { totalCount } = useCart()
  const { t, translateCategoryName, translateProductName } = useLanguage()
  const [categories, setCategories] = useState([])
  const [megaOpen, setMegaOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [navOpen, setNavOpen] = useState(false)
  const [mobileCatOpen, setMobileCatOpen] = useState(false)
  const closeTimer = useRef(null)

  useEffect(() => {
    getCategories()
      .then(data => {
        const list = data || []
        setCategories(list)
        if (list.length > 0) setActiveCategory(list[0])
      })
      .catch(() => {})
  }, [])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (navOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [navOpen])

  function openMega() {
    clearTimeout(closeTimer.current)
    setMegaOpen(true)
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150)
  }

  function closeDrawer() {
    setNavOpen(false)
    setMobileCatOpen(false)
  }

  return (
    <header>
      {/* ── Main Navigation ── */}
      <nav className="site-nav navbar navbar-expand-lg" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <div className="container-main d-flex align-items-center w-100">
          <Link href="/" className="navbar-brand me-3">
            <img src="/resources/logo-mirdav.svg" alt="Mirdav" className="nav-logo" />
          </Link>

          {/* Hamburger — mobile only */}
          <button
            className="navbar-toggler ms-auto"
            type="button"
            onClick={() => setNavOpen(true)}
            aria-controls="siteNavMenu"
            aria-expanded={navOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* ── Desktop nav (hidden on mobile) ── */}
          <div className="collapse navbar-collapse" id="siteNavMenu">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link href="/" className="nav-link desktop-nav-link">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  {t('navHome')}
                </Link>
              </li>
              {/* ── Categories Mega Menu ── */}
              <li
                className="nav-item cat-nav-item"
                onMouseEnter={openMega}
                onMouseLeave={scheduleClose}
              >
                <button
                  className="nav-link cat-nav-trigger"
                  aria-haspopup="true"
                  aria-expanded={megaOpen}
                  onClick={() => setMegaOpen(o => !o)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="cat-nav-icon">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  {t('navCategories')}
                  <svg className="cat-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {megaOpen && (
                  <div
                    className="cat-mega"
                    onMouseEnter={openMega}
                    onMouseLeave={scheduleClose}
                    role="menu"
                  >
                    {categories.length === 0 ? (
                      <div className="cat-mega-empty">{t('navLoadingCategories')}</div>
                    ) : (
                      <div className="cat-mega-inner">
                        {/* Left: category list */}
                        <ul className="cat-mega-list" role="none">
                          {categories.map(cat => (
                            <li
                              key={cat.id}
                              className={`cat-mega-row${activeCategory?.id === cat.id ? ' active' : ''}`}
                              onMouseEnter={() => setActiveCategory(cat)}
                              role="none"
                            >
                              <Link
                                href={`/products?category=${cat.id}`}
                                className="cat-mega-row-link"
                                onClick={() => setMegaOpen(false)}
                                role="menuitem"
                              >
                                <span className="cat-mega-row-name">{translateCategoryName(cat.name)}</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                              </Link>
                            </li>
                          ))}
                        </ul>

                        {/* Right: products for active category */}
                        <div className="cat-mega-products">
                          {activeCategory && (
                            <>
                              <p className="cat-mega-products-heading">
                                {translateCategoryName(activeCategory.name)}
                                <span>{activeCategory.products?.length ?? 0} {t('navProductsWord')}</span>
                              </p>
                              {activeCategory.products?.length > 0 ? (
                                <ul className="cat-mega-products-list">
                                  {activeCategory.products.map(p => (
                                    <li key={p.id}>
                                      <Link href={`/products/${p.id}`} className="cat-mega-product-link">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        </svg>
                                        {translateProductName(p.name)}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="cat-mega-no-products">{t('navNoProductsInCategory')}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>

              <li className="nav-item">
                <Link href="/products" className="nav-link desktop-nav-link">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                  {t('navProducts')}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/track-order" className="nav-link desktop-nav-link">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="1" y="3" width="15" height="13" rx="1" />
                    <path d="M16 8h4l3 5v3h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  {t('navTrackOrder')}
                </Link>
              </li>
            </ul>

            <Link href="/cart" className="cart-icon-btn" aria-label={t('navShoppingCartAria')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span>{totalCount} {t('navItems')}</span>
              {totalCount > 0 && (
                <span className="cart-badge">{totalCount}</span>
              )}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      {navOpen && (
        <div className="mob-backdrop" onClick={closeDrawer} aria-hidden="true" />
      )}
      <div className={`mob-drawer${navOpen ? ' mob-drawer--open' : ''}`} aria-hidden={!navOpen}>
        {/* Drawer header */}
        <div className="mob-drawer-header">
          <Link href="/" className="mob-drawer-brand" onClick={closeDrawer}>
            <img src="/resources/logo-mirdav.svg" alt="Mirdav" className="nav-logo" />
          </Link>
          <button className="mob-drawer-close" onClick={closeDrawer} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="mob-drawer-nav">
          <Link href="/" className="mob-nav-link" onClick={closeDrawer}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {t('navHome')}
          </Link>

          <Link href="/products" className="mob-nav-link" onClick={closeDrawer}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            {t('navProducts')}
          </Link>

          <Link href="/track-order" className="mob-nav-link" onClick={closeDrawer}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 5v3h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            {t('navTrackOrder')}
          </Link>

          {/* Categories accordion */}
          <div className="mob-cat-section">
            <button
              className="mob-nav-link mob-cat-toggle"
              onClick={() => setMobileCatOpen(o => !o)}
              aria-expanded={mobileCatOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              {t('navCategories')}
              <svg
                className={`mob-cat-chevron${mobileCatOpen ? ' mob-cat-chevron--open' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {mobileCatOpen && (
              <ul className="mob-cat-list">
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.id}`}
                      className="mob-cat-item"
                      onClick={closeDrawer}
                    >
                      <span className="mob-cat-dot" />
                      {translateCategoryName(cat.name)}
                      {cat.products?.length > 0 && (
                        <span className="mob-cat-count">{cat.products.length}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        {/* Drawer footer */}
        <div className="mob-drawer-footer">
          <Link href="/cart" className="mob-cart-btn" onClick={closeDrawer}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {t('navShoppingCartAria')}
            {totalCount > 0 && <span className="mob-cart-badge">{totalCount}</span>}
          </Link>
          <div className="mob-lang-row">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* ── Language Switcher ── */
        .lang-switcher {
          position: relative;
          margin-left: 10px;
        }
        .lang-switcher-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: 1.5px solid var(--border);
          border-radius: 6px;
          padding: 5px 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dark);
          cursor: pointer;
          transition: border-color 0.18s;
          white-space: nowrap;
        }
        .lang-switcher-btn:hover { border-color: var(--blue-dark); }
        .lang-flag { font-size: 16px; line-height: 1; }
        .lang-code { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }
        .lang-chevron { width: 12px; height: 12px; }
        .lang-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          list-style: none;
          padding: 4px;
          margin: 0;
          min-width: 155px;
          z-index: 2000;
        }
        .lang-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 6px;
          font-size: 14px;
          color: var(--text-dark);
          text-align: left;
          transition: background 0.15s;
        }
        .lang-option:hover { background: var(--bg-light); }
        .lang-option.active {
          background: #eff6ff;
          color: var(--blue-dark);
          font-weight: 600;
        }
        .lang-name { flex: 1; }
        .lang-code-small {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-gray);
          letter-spacing: 0.5px;
        }

        /* ── Desktop nav links with icons ── */
        .desktop-nav-link {
          display: inline-flex !important;
          align-items: center;
          gap: 6px;
        }
        .desktop-nav-link svg {
          flex-shrink: 0;
          color: var(--text-gray);
          transition: color 0.15s;
        }
        .desktop-nav-link:hover svg { color: var(--yellow); }

        /* ── Categories trigger button ── */
        .cat-nav-item { position: static; }

        .cat-nav-trigger {
          display: inline-flex !important;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          color: var(--text-dark) !important;
          padding: 0 14px !important;
          height: 100%;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          line-height: 1;
          vertical-align: middle;
        }
        .cat-nav-trigger:hover { color: var(--yellow) !important; }
        .cat-nav-icon {
          flex-shrink: 0;
          color: var(--text-gray);
          transition: color 0.15s;
        }
        .cat-nav-trigger:hover .cat-nav-icon { color: var(--yellow); }

        .cat-chevron {
          width: 13px;
          height: 13px;
          margin-left: 2px;
          transition: transform 0.2s;
        }
        .cat-nav-trigger[aria-expanded="true"] .cat-chevron {
          transform: rotate(180deg);
        }

        /* ── Mega dropdown panel ── */
        .cat-mega {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background: #fff;
          border-top: 3px solid var(--yellow);
          box-shadow: 0 12px 40px rgba(0,0,0,0.13);
          z-index: 1000;
          animation: megaFadeIn 0.18s ease;
        }
        @keyframes megaFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cat-mega-empty {
          padding: 24px 32px;
          color: var(--text-gray);
          font-size: 14px;
        }

        /* ── Two-column inner layout ── */
        .cat-mega-inner {
          display: flex;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
          min-height: 300px;
          max-height: 480px;
        }

        /* ── Left: category list ── */
        .cat-mega-list {
          list-style: none;
          margin: 0;
          padding: 12px 0;
          width: 240px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          overflow-y: auto;
        }
        .cat-mega-list::-webkit-scrollbar { width: 4px; }
        .cat-mega-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        .cat-mega-row {
          border-left: 3px solid transparent;
          transition: background 0.12s, border-color 0.12s;
          user-select: none;
        }
        .cat-mega-row-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dark) !important;
          text-decoration: none !important;
          transition: color 0.12s;
          width: 100%;
        }
        .cat-mega-row-link svg {
          width: 14px;
          height: 14px;
          color: var(--text-gray);
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.15s, transform 0.15s;
        }
        .cat-mega-row:hover,
        .cat-mega-row.active {
          background: var(--bg-light);
          border-left-color: var(--yellow);
        }
        .cat-mega-row:hover .cat-mega-row-link,
        .cat-mega-row.active .cat-mega-row-link {
          color: var(--blue-dark) !important;
        }
        .cat-mega-row:hover .cat-mega-row-link svg,
        .cat-mega-row.active .cat-mega-row-link svg {
          opacity: 1;
          transform: translateX(2px);
        }

        .cat-mega-row-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-right: 8px;
        }

        /* ── Right: products panel ── */
        .cat-mega-products {
          flex: 1;
          padding: 20px 28px;
          overflow-y: auto;
        }
        .cat-mega-products::-webkit-scrollbar { width: 4px; }
        .cat-mega-products::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        .cat-mega-products-heading {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-gray);
          margin: 0 0 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
        }
        .cat-mega-products-heading span {
          font-weight: 500;
          font-size: 11px;
          background: var(--bg-light);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2px 8px;
          text-transform: none;
          letter-spacing: 0;
        }

        .cat-mega-products-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 4px;
        }

        .cat-mega-product-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 6px;
          color: var(--text-dark) !important;
          text-decoration: none !important;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.12s, color 0.12s;
        }
        .cat-mega-product-link svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          color: var(--text-gray);
          transition: color 0.12s;
        }
        .cat-mega-product-link:hover {
          background: var(--bg-light);
          color: var(--blue-dark) !important;
        }
        .cat-mega-product-link:hover svg { color: var(--yellow); }

        .cat-mega-no-products {
          font-size: 13px;
          color: var(--text-gray);
          margin: 0;
          padding: 20px 0;
        }

        /* ── Make nav position relative so dropdown anchors to it ── */
        .site-nav {
          position: relative;
        }

        /* ════════════════════════════════════════
           MOBILE DRAWER
        ════════════════════════════════════════ */

        /* Backdrop */
        .mob-backdrop {
          display: none;
        }
        @media (max-width: 991px) {
          .mob-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            z-index: 1200;
            animation: backdropIn 0.25s ease;
          }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Drawer panel */
        .mob-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 300px;
          max-width: 85vw;
          height: 100%;
          background: #fff;
          z-index: 1300;
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 24px rgba(0,0,0,0.12);
        }
        .mob-drawer--open {
          transform: translateX(0);
        }
        /* Only show drawer on mobile */
        @media (min-width: 992px) {
          .mob-drawer { display: none; }
          .mob-backdrop { display: none !important; }
        }

        /* Drawer header */
        .mob-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 64px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .mob-drawer-brand {
          display: inline-flex;
          align-items: center;
          line-height: 0;
          text-decoration: none !important;
        }
        .mob-drawer-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          background: var(--bg-light);
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-dark);
          transition: background 0.15s;
        }
        .mob-drawer-close:hover { background: var(--border); }

        /* Drawer nav area */
        .mob-drawer-nav {
          flex: 1;
          overflow-y: auto;
          padding: 12px 0;
        }
        .mob-drawer-nav::-webkit-scrollbar { width: 4px; }
        .mob-drawer-nav::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        /* Nav links */
        .mob-nav-link {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 14px 20px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-dark) !important;
          text-decoration: none !important;
          border: none;
          background: none;
          cursor: pointer;
          transition: background 0.14s, color 0.14s;
          border-left: 3px solid transparent;
        }
        .mob-nav-link:hover {
          background: var(--bg-light);
          border-left-color: var(--yellow);
          color: var(--blue-dark) !important;
        }
        .mob-nav-link svg {
          flex-shrink: 0;
          color: var(--text-gray);
        }

        /* Categories toggle */
        .mob-cat-toggle {
          justify-content: flex-start;
        }
        .mob-cat-chevron {
          width: 16px;
          height: 16px;
          margin-left: auto;
          flex-shrink: 0;
          transition: transform 0.22s;
        }
        .mob-cat-chevron--open {
          transform: rotate(180deg);
        }

        /* Categories list (accordion body) */
        .mob-cat-list {
          list-style: none;
          margin: 0;
          padding: 4px 0 8px;
          background: var(--bg-light);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .mob-cat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 20px 11px 52px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-dark) !important;
          text-decoration: none !important;
          transition: background 0.13s, color 0.13s;
        }
        .mob-cat-item:hover {
          background: #e8f0fe;
          color: var(--blue-dark) !important;
        }
        .mob-cat-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--yellow);
          flex-shrink: 0;
        }
        .mob-cat-count {
          margin-left: auto;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-gray);
          background: #e5e7eb;
          border-radius: 12px;
          padding: 2px 8px;
        }

        /* Drawer footer */
        .mob-drawer-footer {
          flex-shrink: 0;
          border-top: 1px solid var(--border);
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mob-cart-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 18px;
          background: var(--yellow, #f5c518);
          color: #1a1a1a !important;
          text-decoration: none !important;
          font-size: 15px;
          font-weight: 700;
          border-radius: 10px;
          transition: opacity 0.15s;
          position: relative;
        }
        .mob-cart-btn:hover { opacity: 0.9; }
        .mob-cart-badge {
          margin-left: auto;
          background: #1a1a1a;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mob-lang-row {
          display: flex;
          align-items: center;
        }
        .mob-lang-row .lang-switcher {
          margin-left: 0;
        }
        /* Open language dropdown upward inside the drawer footer */
        .mob-lang-row .lang-dropdown {
          top: auto;
          bottom: calc(100% + 6px);
          right: auto;
          left: 0;
        }
      `}</style>
    </header>
  )
}

