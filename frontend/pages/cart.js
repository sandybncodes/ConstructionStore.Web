import { useState, useRef } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../lib/cartContext'
import { createOrder } from '../lib/api'
import { useLanguage } from '../lib/i18nContext'
import { getPrimaryProductImage } from '../lib/productImages'
import { downloadOrderPdf } from '../lib/orderPdf'

function QuantityControl({ quantity, onDecrement, onIncrement, t }) {
  return (
    <div className="cart-qty-control">
      <button className="cart-qty-btn" onClick={onDecrement} aria-label={t('decreaseQty')}>−</button>
      <span className="cart-qty-value">{quantity}</span>
      <button className="cart-qty-btn" onClick={onIncrement} aria-label={t('increaseQty')}>+</button>
    </div>
  )
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart()
  const { t, translateProductName } = useLanguage()

  const [showCheckout, setShowCheckout] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', email: '', notes: '' })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [orderSnapshot, setOrderSnapshot] = useState(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const checkoutRef = useRef(null)

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }))
  }

  function validate() {
    const errors = {}
    if (!form.fullName.trim()) errors.fullName = t('fullNameRequired')
    if (!form.phone.trim()) errors.phone = t('phoneRequired')
    if (!form.address.trim()) errors.address = t('addressRequired')
    return errors
  }

  async function handleCheckoutSubmit(e) {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }

    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      customerFullName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      email: form.email.trim() || null,
      notes: form.notes.trim() || null,
      items: cart.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })),
    }

    try {
      const result = await createOrder(payload)
      // Build a full snapshot before the cart is cleared so the PDF has all fields.
      const snapshot = {
        id: result.id,
        orderToken: result.orderToken,
        orderDate: new Date().toISOString(),
        status: 'NOU',
        totalPrice: result.totalPrice,
        customerFullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
        items: cart.map(({ product, quantity, discount }) => {
          const effectivePrice = product.price * (1 - (discount || 0) / 100)
          return {
            productId: product.id,
            productName: product.name,
            productImageUrl: getPrimaryProductImage(product),
            quantity,
            price: effectivePrice,
            lineTotal: effectivePrice * quantity,
          }
        }),
      }
      clearCart()
      setOrderSnapshot(snapshot)
      setOrderSuccess(result)
      setShowCheckout(false)
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleProceedToCheckout() {
    setShowCheckout(true)
    setTimeout(() => checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const isEmpty = cart.length === 0
  const shipping = 0

  return (
    <>
      <Header />

      {/* ── Breadcrumb ── */}
      <div className="shop-breadcrumb-bar">
        <div className="container-main">
          <nav className="shop-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">{t('navHome')}</Link>
            <span className="shop-breadcrumb-sep">/</span>
            <Link href="/products">{t('navShop')}</Link>
            <span className="shop-breadcrumb-sep">/</span>
            <span>{t('shoppingCart')}</span>
          </nav>
          <h1 className="shop-page-title">{t('shoppingCart')}</h1>
        </div>
      </div>

      <main className="container-main">

        {/* ── Order Success Banner ── */}
        {orderSuccess && (
          <div className="checkout-success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
            </svg>
            <h2 className="checkout-success-title">{t('orderPlaced')}</h2>
            <p>{t('thankYouOrder', { id: orderSuccess.id })}</p>
            <p className="checkout-success-token">{t('referenceToken')} <code>{orderSuccess.orderToken}</code></p>
            <p className="checkout-success-total">{t('orderTotal')} <strong>{Number(orderSuccess.totalPrice).toFixed(2)} MDL</strong></p>
            <div className="checkout-success-actions">
              <Link href="/products" className="btn-yellow" style={{ display: 'inline-block' }}>
                {t('continueShopping')}
              </Link>
              {orderSnapshot && (
                <button
                  className="btn-download-pdf"
                  disabled={downloadingPdf}
                  onClick={async () => {
                    setDownloadingPdf(true)
                    try { await downloadOrderPdf(orderSnapshot, t, translateProductName) }
                    finally { setDownloadingPdf(false) }
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {downloadingPdf ? '…' : t('downloadOrderPdf')}
                </button>
              )}
            </div>
          </div>
        )}

        {!orderSuccess && (
          <div className="cart-layout">

            {/* ── Cart Table ── */}
            <div className={`cart-table-wrap${isEmpty ? ' cart-table-wrap--full' : ''}`}>
              {isEmpty ? (
                <div className="cart-empty">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  <p className="cart-empty-title">{t('cartEmpty')}</p>
                  <p className="cart-empty-sub">{t('cartEmptySub')}</p>
                  <Link href="/products" className="btn-yellow">{t('browseProducts')}</Link>
                </div>
              ) : (
                <>
                  <div className="cart-table-header">
                    <span className="cart-col-product">{t('productCol')}</span>
                    <span className="cart-col-price">{t('unitPrice')}</span>
                    <span className="cart-col-qty">{t('quantityCol')}</span>
                    <span className="cart-col-total">{t('totalCol')}</span>
                    <span className="cart-col-remove"></span>
                  </div>

                  <ul className="cart-items-list">
                    {cart.map(({ product, quantity, discount }) => {
                      const effectivePrice = product.price * (1 - (discount || 0) / 100)
                      const lineTotal = effectivePrice * quantity
                      return (
                        <li key={product.id} className="cart-item">
                          <div className="cart-col-product cart-item-product">
                            <div className="cart-item-img">
                              <img
                                src={getPrimaryProductImage(product)}
                                alt={product.name}
                              />
                            </div>
                            <div className="cart-item-info">
                              <Link href={`/products/${product.id}`} className="cart-item-name">
                                {product.name}
                              </Link>
                              {discount > 0 && (
                                <span className="cart-item-discount">-{discount}% off</span>
                              )}
                            </div>
                          </div>

                          <div className="cart-col-price cart-item-price">
                            <span className="cart-mobile-label">{t('unitPrice')}</span>
                            {discount > 0 ? (
                              <div className="cart-price-wrap">
                                <span className="cart-price-original">{product.price.toFixed(2)} MDL</span>
                                <span>{effectivePrice.toFixed(2)} MDL</span>
                              </div>
                            ) : (
                              <span>{product.price.toFixed(2)} MDL</span>
                            )}
                          </div>

                          <div className="cart-col-qty cart-item-qty">
                            <span className="cart-mobile-label">{t('quantityCol')}</span>
                            <QuantityControl
                              quantity={quantity}
                              onDecrement={() => updateQuantity(product.id, quantity - 1)}
                              onIncrement={() => updateQuantity(product.id, quantity + 1)}
                              t={t}
                            />
                          </div>

                          <div className="cart-col-total cart-item-total">
                            <span className="cart-mobile-label">{t('totalCol')}</span>
                            <span className="cart-item-total-price">{lineTotal.toFixed(2)} MDL</span>
                          </div>

                          <div className="cart-col-remove">
                            <button
                              className="cart-remove-btn"
                              onClick={() => removeFromCart(product.id)}
                              aria-label={t('removeItem', { name: product.name })}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                              </svg>
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>

                  <div className="cart-table-footer">
                    <Link href="/products" className="cart-continue-link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                      {t('continueShopping')}
                    </Link>
                    <button className="cart-clear-btn" onClick={clearCart}>
                      {t('clearCart')}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* ── Order Summary ── */}
            {!isEmpty && (
              <aside className="cart-summary">
                <h2 className="cart-summary-title">{t('orderSummary')}</h2>

                <div className="cart-summary-rows">
                  <div className="cart-summary-row">
                    <span>{t('subtotal', { n: cart.reduce((s, i) => s + i.quantity, 0) })}</span>
                    <span>{totalPrice.toFixed(2)} MDL</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>{t('shipping')}</span>
                    <span className="cart-summary-free">{t('free')}</span>
                  </div>
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-total">
                  <span>{t('totalCol')}</span>
                  <span>{(totalPrice + shipping).toFixed(2)} MDL</span>
                </div>

                <button
                  className="btn-yellow cart-checkout-btn"
                  onClick={handleProceedToCheckout}
                  disabled={showCheckout}
                >
                  {showCheckout ? t('fillDetailsBelow') : t('proceedToCheckout')}
                </button>

                <p className="cart-summary-note">
                  {t('freeShippingNote')}
                </p>
              </aside>
            )}
          </div>
        )}

        {/* ── Checkout Form ── */}
        {showCheckout && !orderSuccess && (
          <section className="checkout-section" ref={checkoutRef}>
            <h2 className="checkout-section-title">{t('deliveryDetails')}</h2>

            <form className="checkout-form" onSubmit={handleCheckoutSubmit} noValidate>
              <div className="checkout-form-grid">

                {/* Full Name */}
                <div className={`checkout-field${formErrors.fullName ? ' checkout-field--error' : ''}`}>
                  <label className="checkout-label" htmlFor="co-fullname">
                    {t('fullName')} <span className="checkout-required">*</span>
                  </label>
                  <input
                    id="co-fullname"
                    className="checkout-input"
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleFormChange}
                    placeholder={t('fullNamePlaceholder')}
                    autoComplete="name"
                  />
                  {formErrors.fullName && <p className="checkout-field-error">{formErrors.fullName}</p>}
                </div>

                {/* Phone */}
                <div className={`checkout-field${formErrors.phone ? ' checkout-field--error' : ''}`}>
                  <label className="checkout-label" htmlFor="co-phone">
                    {t('phone')} <span className="checkout-required">*</span>
                  </label>
                  <input
                    id="co-phone"
                    className="checkout-input"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder={t('phonePlaceholder')}
                    autoComplete="tel"
                  />
                  {formErrors.phone && <p className="checkout-field-error">{formErrors.phone}</p>}
                </div>

                {/* Email */}
                <div className="checkout-field">
                  <label className="checkout-label" htmlFor="co-email">
                    {t('emailLabel')} <span className="checkout-optional">{t('optional')}</span>
                  </label>
                  <input
                    id="co-email"
                    className="checkout-input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder={t('emailPlaceholder')}
                    autoComplete="email"
                  />
                </div>

                {/* Address */}
                <div className={`checkout-field checkout-field--full${formErrors.address ? ' checkout-field--error' : ''}`}>
                  <label className="checkout-label" htmlFor="co-address">
                    {t('deliveryAddress')} <span className="checkout-required">*</span>
                  </label>
                  <input
                    id="co-address"
                    className="checkout-input"
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleFormChange}
                    placeholder={t('addressPlaceholder')}
                    autoComplete="street-address"
                  />
                  {formErrors.address && <p className="checkout-field-error">{formErrors.address}</p>}
                </div>

                {/* Notes */}
                <div className="checkout-field checkout-field--full">
                  <label className="checkout-label" htmlFor="co-notes">
                    {t('orderNotes')} <span className="checkout-optional">{t('optional')}</span>
                  </label>
                  <textarea
                    id="co-notes"
                    className="checkout-textarea"
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    placeholder={t('notesPlaceholder')}
                    rows={3}
                  />
                </div>

              </div>

              {/* API error */}
              {submitError && (
                <div className="checkout-submit-error" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {submitError}
                </div>
              )}

              <div className="checkout-form-actions">
                <button
                  type="button"
                  className="checkout-cancel-btn"
                  onClick={() => { setShowCheckout(false); setSubmitError(null); setFormErrors({}) }}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-yellow checkout-submit-btn" disabled={submitting}>
                  {submitting ? t('placingOrder') : t('placeOrder')}
                </button>
              </div>
            </form>
          </section>
        )}

      </main>

      <Footer />
    </>
  )
}
