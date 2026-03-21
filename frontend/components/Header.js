import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [cartCount] = useState(0)

  return (
    <header>
      {/* ── Top Info Bar ── */}
      <div className="top-bar">
        <div className="container-main d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex gap-4">
            <span>&#128652; Free Shipping Worldwide</span>
            <span>&#128222; Online 24/7 Supports</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="search-bar">
              <input type="text" placeholder="Search..." />
              <button aria-label="Search">&#128269;</button>
            </div>
            <span style={{ whiteSpace: 'nowrap' }}>Hey, Sign In</span>
          </div>
        </div>
      </div>

      {/* ── Main Navigation ── */}
      <nav className="site-nav navbar navbar-expand-lg">
        <div className="container-main d-flex align-items-center w-100">
          <Link href="/" className="navbar-brand me-3">Stanley</Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#siteNavMenu"
            aria-controls="siteNavMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="siteNavMenu">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link href="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link href="/products" className="nav-link">Shop &#9660;</Link>
              </li>
              <li className="nav-item">
                <Link href="/products" className="nav-link">
                  Categories <span className="badge-sale">SALE</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/products" className="nav-link">
                  Products <span className="badge-hot">HOT</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/" className="nav-link">Top deals &#9660;</Link>
              </li>
              <li className="nav-item">
                <Link href="/" className="nav-link">Elements &#9660;</Link>
              </li>
            </ul>

            <button className="cart-icon-btn" aria-label="Shopping cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span>{cartCount} Items</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}

