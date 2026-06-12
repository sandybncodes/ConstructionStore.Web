import { useState } from 'react'
import Head from 'next/head'
import Seo from '../components/Seo'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { trackOrder } from '../lib/api'
import { useLanguage } from '../lib/i18nContext'
import { FALLBACK_PRODUCT_IMAGE } from '../lib/productImages'
import { downloadOrderPdf } from '../lib/orderPdf'

// ── Status steps definition ──────────────────────────────────────────────────
const STATUS_STEPS = ['NOU', 'PREPARING', 'DELIVERED']

function getStepIndex(status) {
  return STATUS_STEPS.indexOf((status ?? '').trim().toUpperCase())
}

// Inline SVGs with explicit sizes so they work outside styled-jsx scope
const STEP_ICONS = {
  NOU: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  PREPARING: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  DELIVERED: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
}
const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TrackOrderPage() {
  const { t, translateProductName } = useLanguage()

  const [form, setForm] = useState({ orderId: '', fullName: '', phone: '' })
  const [formErrors, setFormErrors] = useState({})
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [orders, setOrders] = useState([])
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [downloadingPdfId, setDownloadingPdfId] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }))
  }

  function validate() {
    const errors = {}
    if (form.orderId.trim() && !/^\d+$/.test(form.orderId.trim())) {
      errors.orderId = t('trackOrderOrderIdInvalid')
    }
    if (!form.fullName.trim()) errors.fullName = t('trackOrderFullNameRequired')
    if (!form.phone.trim()) errors.phone = t('trackOrderPhoneRequired')
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }

    setSearching(true)
    setSearchError(null)
    setOrders([])
    setExpandedOrderId(null)

    try {
      const orderId = form.orderId.trim() ? parseInt(form.orderId.trim(), 10) : null
      const result = await trackOrder(form.fullName.trim(), form.phone.trim(), orderId)
      setOrders(result)
      if (result.length === 1) setExpandedOrderId(result[0].id)
    } catch {
      setSearchError(t('trackOrderNotFound'))
    } finally {
      setSearching(false)
    }
  }

  function toggleOrder(id) {
    setExpandedOrderId(prev => prev === id ? null : id)
  }

  // Helper: status class and label
  function getStatusClass(status) {
    return {
      NOU: 'track-status--new',
      PREPARING: 'track-status--preparing',
      DELIVERED: 'track-status--delivered',
    }[(status ?? '').trim().toUpperCase()] ?? 'track-status--unknown'
  }

  function getStatusLabel(status) {
    return {
      NOU: t('trackOrderStatusNew'),
      PREPARING: t('trackOrderStatusPreparing'),
      DELIVERED: t('trackOrderStatusDelivered'),
    }[(status ?? '').trim().toUpperCase()] ?? (status ?? '')
  }

  // Format date + time
  function formatDateTime(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  // Render full order content (timeline + details grid + items)
  function renderOrderContent(order) {
    const currentStepIndex = getStepIndex(order.status)
    const statusClass = getStatusClass(order.status)
    const statusLabel = getStatusLabel(order.status)

    return (
      <>
        {/* ── Status path / timeline ── */}
        <div className="track-timeline">
          {STATUS_STEPS.map((step, idx) => {
            const done = idx < currentStepIndex
            const active = idx === currentStepIndex
            const pending = idx > currentStepIndex

            const stepLabel = {
              NOU: t('trackOrderStatusNew'),
              PREPARING: t('trackOrderStatusPreparing'),
              DELIVERED: t('trackOrderStatusDelivered'),
            }[step]

            return (
              <div key={step} className="track-timeline-step">
                {idx > 0 && (
                  <div className={`track-timeline-line ${done || active ? 'track-timeline-line--filled' : ''}`} />
                )}
                <div className={`track-timeline-node ${done ? 'tn-done' : active ? 'tn-active' : 'tn-pending'}`}>
                  {done ? CHECK_ICON : STEP_ICONS[step]}
                </div>
                <span className={`track-timeline-label ${pending ? 'tl-pending' : ''}`}>
                  {stepLabel}
                </span>
              </div>
            )
          })}
        </div>

        {/* ── Details grid ── */}
        <div className="track-details-grid">
          <div className="track-detail-cell">
            <span className="tdc-key">{t('trackOrderIdField')}</span>
            <span className="tdc-value tdc-id">#{order.id}</span>
          </div>
          <div className="track-detail-cell">
            <span className="tdc-key">{t('trackOrderDateField')}</span>
            <span className="tdc-value">{formatDateTime(order.orderDate)}</span>
          </div>
          <div className="track-detail-cell">
            <span className="tdc-key">{t('trackOrderStatusField')}</span>
            <span className={`tdc-value tdc-status ${statusClass}`}>{statusLabel}</span>
          </div>
          <div className="track-detail-cell tdc-wide">
            <span className="tdc-key">{t('trackOrderAddressField')}</span>
            <span className="tdc-value">{order.address}</span>
          </div>
          {order.notes && (
            <div className="track-detail-cell tdc-wide">
              <span className="tdc-key">{t('trackOrderNotesField')}</span>
              <span className="tdc-value">{order.notes}</span>
            </div>
          )}
          <div className="track-detail-cell">
            <span className="tdc-key">{t('trackOrderTotalField')}</span>
            <span className="tdc-value tdc-total">{Number(order.totalPrice).toFixed(2)} MDL</span>
          </div>
        </div>

        {/* ── Items ── */}
        {order.items && order.items.length > 0 && (
          <div className="track-items-section">
            <h3 className="track-items-heading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {t('trackOrderItemsTitle')}
            </h3>
            <div className="track-items-table-wrap">
              <table className="track-items-table">
                <thead>
                  <tr>
                    <th>{t('trackOrderItemProduct')}</th>
                    <th className="col-num">{t('trackOrderItemQty')}</th>
                    <th className="col-num">{t('trackOrderItemPrice')}</th>
                    <th className="col-num">{t('trackOrderItemTotal')}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="track-item-product">
                          <img
                            src={item.productImageUrl || FALLBACK_PRODUCT_IMAGE}
                            alt={item.productName || `#${item.productId}`}
                            className="track-item-img"
                            onError={e => { e.currentTarget.src = FALLBACK_PRODUCT_IMAGE }}
                          />
                          <div>
                            <span>{item.productName ? translateProductName(item.productName) : `#${item.productId}`}</span>
                            {item.variantAttributes && item.variantAttributes.length > 0 && (
                              <span className="track-item-variant-attrs">
                                {item.variantAttributes
                                  .filter(a => a.attributeName)
                                  .map(a => {
                                    const val = a.valueNumeric != null
                                      ? `${parseFloat(a.valueNumeric)}${a.unit ? ' ' + a.unit : ''}`
                                      : (a.valueText || '')
                                    return `${a.attributeName}: ${val}`
                                  })
                                  .join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="col-num">{item.quantity}</td>
                      <td className="col-num">{Number(item.price).toFixed(2)} MDL</td>
                      <td className="col-num col-total">{Number(item.lineTotal).toFixed(2)} MDL</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Download PDF button ── */}
        <div className="track-download-row">
          <button
            className="btn-download-pdf"
            disabled={downloadingPdfId === order.id}
            onClick={async () => {
              setDownloadingPdfId(order.id)
              try { await downloadOrderPdf(order, t, translateProductName) }
              catch (e) { console.error('PDF download failed:', e) }
              finally { setDownloadingPdfId(null) }
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {downloadingPdfId === order.id ? '…' : t('downloadOrderPdf')}
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <Seo title={`${t('trackOrderTitle')} — MirDav Company`} description={`Verifică statusul comenzilor tale la MirDav Company.`} canonical={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/track-order`} />
      <Header />

      {/* ── Breadcrumb bar ── */}
      <div className="shop-breadcrumb-bar">
        <div className="container-main">
          <nav className="shop-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">{t('navHome')}</Link>
            <span className="shop-breadcrumb-sep">/</span>
            <span>{t('navTrackOrder')}</span>
          </nav>
          <h1 className="shop-page-title">{t('trackOrderTitle')}</h1>
        </div>
      </div>

      <main className="track-page">
        <div className="container-main">

          {/* ── Hero strip ── */}
          <div className="track-hero">
            <div className="track-hero-icon-wrap" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 5v3h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <p className="track-hero-text">{t('trackOrderSubtitle')}</p>
          </div>

          {/* ── Search card ── */}
          <div className="track-card">
            <form onSubmit={handleSubmit} noValidate>
              <div className="track-form-row">
                {/* Order ID — optional */}
                <div className="track-field">
                  <label htmlFor="orderId">
                    {t('trackOrderIdLabel')}
                    <span className="field-optional">{t('trackOrderIdOptional')}</span>
                  </label>
                  <input
                    id="orderId"
                    name="orderId"
                    type="text"
                    inputMode="numeric"
                    placeholder={t('trackOrderIdPlaceholder')}
                    value={form.orderId}
                    onChange={handleChange}
                    className={formErrors.orderId ? 'input-error' : ''}
                    autoComplete="off"
                  />
                  {formErrors.orderId && <span className="field-error">{formErrors.orderId}</span>}
                </div>

                {/* Full Name — required */}
                <div className="track-field">
                  <label htmlFor="fullName">
                    {t('trackOrderFullNameLabel')}
                    <span className="field-required" aria-hidden="true"> *</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder={t('trackOrderFullNamePlaceholder')}
                    value={form.fullName}
                    onChange={handleChange}
                    className={formErrors.fullName ? 'input-error' : ''}
                    autoComplete="name"
                    required
                  />
                  {formErrors.fullName && <span className="field-error">{formErrors.fullName}</span>}
                </div>

                {/* Phone — required */}
                <div className="track-field">
                  <label htmlFor="phone">
                    {t('trackOrderPhoneLabel')}
                    <span className="field-required" aria-hidden="true"> *</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={t('trackOrderPhonePlaceholder')}
                    value={form.phone}
                    onChange={handleChange}
                    className={formErrors.phone ? 'input-error' : ''}
                    autoComplete="tel"
                  />
                  {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                </div>
              </div>

              <div className="track-form-footer">
                <button type="submit" className="btn-primary-track" disabled={searching}>
                  {searching ? (
                    <>
                      <span className="track-spinner" aria-hidden="true" />
                      {t('trackOrderSearching')}
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      {t('trackOrderSubmit')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── Not-found alert ── */}
          {searchError && (
            <div className="track-alert track-alert--error" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>{searchError}</span>
            </div>
          )}

          {/* ── Single order result ── */}
          {orders.length === 1 && (
            <div className="track-result-wrap">
              <div className="track-result-header">
                <h2 className="track-result-title">{t('trackOrderFound')}</h2>
                <div className={`track-status-pill ${getStatusClass(orders[0].status)}`}>
                  {STEP_ICONS[(orders[0].status ?? '').trim().toUpperCase()]}
                  <span>{getStatusLabel(orders[0].status)}</span>
                </div>
              </div>
              {renderOrderContent(orders[0])}
            </div>
          )}

          {/* ── Multiple orders accordion ── */}
          {orders.length > 1 && (
            <div className="track-orders-list">
              <div className="track-orders-list-header">
                <h2 className="track-orders-list-title">
                  {t('trackOrderMultipleFound').replace('{count}', orders.length)}
                </h2>
                <p className="track-orders-list-hint">{t('trackOrderSelectHint')}</p>
              </div>

              {orders.map(order => {
                const isOpen = expandedOrderId === order.id
                const statusClass = getStatusClass(order.status)
                const statusLabel = getStatusLabel(order.status)
                const firstItem = (order.items && order.items.length > 0) ? order.items[0] : null

                return (
                  <div key={order.id} className={`track-accordion-item ${isOpen ? 'is-open' : ''}`}>
                    <button
                      type="button"
                      className="track-accordion-header"
                      onClick={() => toggleOrder(order.id)}
                      aria-expanded={isOpen}
                    >
                      <div className="tah-left">
                        <span className="tah-id">#{order.id}</span>
                        <span className="tah-date">{formatDateTime(order.orderDate)}</span>
                      </div>
                      <div className="tah-right">
                        <div className={`track-status-pill ${statusClass}`}>
                          {STEP_ICONS[(order.status ?? '').trim().toUpperCase()]}
                          <span>{statusLabel}</span>
                        </div>

                        {firstItem && (
                          <img
                            src={firstItem.productImageUrl || FALLBACK_PRODUCT_IMAGE}
                            alt={firstItem.productName || ``}
                            className="track-item-img"
                            loading="lazy"
                            decoding="async"
                            onError={e => { e.currentTarget.src = FALLBACK_PRODUCT_IMAGE }}
                          />
                        )}

                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="track-accordion-body">
                        {renderOrderContent(order)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        /* ── Page ── */
        .track-page {
          min-height: 100vh;
          padding-top: 28px;
          padding-bottom: 72px;
          background: var(--surface, #f3f4f6);
        }

        /* ── Hero strip ── */
        .track-hero {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
          padding: 18px 24px;
          background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
          border: 1px solid #bfdbfe;
          border-radius: 14px;
        }
        .track-hero-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          background: #2563eb;
          color: #fff;
          border-radius: 12px;
          flex-shrink: 0;
        }
        .track-hero-text {
          font-size: .97rem;
          color: #1e40af;
          margin: 0;
          line-height: 1.5;
        }

        /* ── Search card ── */
        .track-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 1px 6px rgba(0,0,0,.06);
        }
        .track-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (max-width: 700px) {
          .track-form-row { grid-template-columns: 1fr; }
          .track-card { padding: 20px; }
        }
        .track-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .track-field label {
          font-size: .82rem;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
          color: #374151;
        }
        .track-field input {
          padding: 11px 14px;
          border: 1.5px solid #d1d5db;
          border-radius: 10px;
          font-size: .95rem;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          background: #fafafa;
        }
        .track-field input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
          background: #fff;
        }
        .track-field input.input-error { border-color: #dc2626; }
        .field-error { font-size: .8rem; color: #dc2626; }

        .track-form-footer { display: flex; }
        .btn-primary-track {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 30px;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: .97rem;
          font-weight: 700;
          cursor: pointer;
          transition: background .15s, transform .1s;
        }
        .btn-primary-track:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
        .btn-primary-track:disabled { opacity: .7; cursor: not-allowed; }
        .track-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: tspin .7s linear infinite;
        }
        @keyframes tspin { to { transform: rotate(360deg); } }

        /* ── Alert ── */
        .track-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 12px;
          padding: 14px 18px;
          font-size: .93rem;
          margin-bottom: 24px;
        }
        .track-alert--error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        /* ── Result wrapper ── */
        .track-result-wrap {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 1px 6px rgba(0,0,0,.06);
        }
        @media (max-width: 700px) {
          .track-result-wrap { padding: 20px; }
        }

        /* Result header */
        .track-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 28px;
        }
        .track-result-title {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
          color: #111827;
        }

        /* Status pill */
        .track-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 999px;
          font-weight: 700;
          font-size: .9rem;
        }
        .track-status--new    { background: #eff6ff; color: #1d4ed8; border: 1.5px solid #bfdbfe; }
        .track-status--preparing { background: #fffbeb; color: #b45309; border: 1.5px solid #fde68a; }
        .track-status--delivered { background: #f0fdf4; color: #15803d; border: 1.5px solid #bbf7d0; }
        .track-status--unknown { background: #f3f4f6; color: #374151; border: 1.5px solid #d1d5db; }

        /* ── Timeline ── */
        .track-timeline {
          display: flex;
          align-items: flex-start;
          gap: 0;
          margin-bottom: 32px;
          padding: 24px 20px;
          background: #f9fafb;
          border: 1px solid #f3f4f6;
          border-radius: 14px;
        }
        .track-timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }
        /* connector line */
        .track-timeline-line {
          position: absolute;
          top: 21px;
          right: calc(50% + 21px);
          width: calc(100% - 42px);
          height: 3px;
          background: #e5e7eb;
          border-radius: 99px;
        }
        .track-timeline-line--filled { background: #2563eb; }

        /* node circle */
        .track-timeline-node {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          border: 2.5px solid;
          transition: all .2s;
          position: relative;
          z-index: 1;
        }
        .tn-done {
          background: #2563eb;
          border-color: #2563eb;
          color: #fff;
        }
        .tn-active {
          background: #fff;
          border-color: #2563eb;
          color: #2563eb;
          box-shadow: 0 0 0 5px rgba(37,99,235,.15);
        }
        .tn-pending {
          background: #f3f4f6;
          border-color: #d1d5db;
          color: #9ca3af;
        }

        /* label */
        .track-timeline-label {
          font-size: .78rem;
          font-weight: 700;
          text-align: center;
          color: #111827;
          text-transform: uppercase;
          letter-spacing: .04em;
        }
        .tl-pending { color: #9ca3af; }

        @media (max-width: 500px) {
          .track-timeline { padding: 16px 8px; }
          .track-timeline-node { width: 36px; height: 36px; }
          .track-timeline-label { font-size: .68rem; }
        }

        /* ── Details grid ── */
        .track-details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 28px;
        }
        @media (max-width: 700px) {
          .track-details-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 440px) {
          .track-details-grid { grid-template-columns: 1fr; }
        }
        .track-detail-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 14px 16px;
          background: #f9fafb;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
        }
        .tdc-wide { grid-column: 1 / -1; }
        .tdc-key {
          font-size: .72rem;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: .06em;
        }
        .tdc-value {
          font-size: .97rem;
          color: #111827;
          font-weight: 500;
        }
        .tdc-id { font-weight: 700; font-size: 1.1rem; color: #111827; }
        .tdc-total { font-weight: 800; font-size: 1.15rem; color: #2563eb; }
        .tdc-status { font-weight: 700; }

        /* ── Label decorators ── */
        .field-required { color: #dc2626; font-weight: 700; }
        .field-optional {
          margin-left: 6px;
          font-size: .75rem;
          font-weight: 500;
          color: #9ca3af;
          text-transform: none;
          letter-spacing: 0;
        }

        /* ── Items ── */
        .track-items-section { }
        .track-items-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 14px;
          color: #111827;
        }
        .track-items-table-wrap {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        .track-items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: .9rem;
        }
        .track-items-table th {
          padding: 11px 14px;
          background: #f9fafb;
          text-align: left;
          font-weight: 700;
          font-size: .78rem;
          text-transform: uppercase;
          letter-spacing: .04em;
          color: #6b7280;
          white-space: nowrap;
          border-bottom: 1px solid #e5e7eb;
        }
        .track-items-table th.col-num { text-align: right; }
        .track-items-table td {
          padding: 11px 14px;
          border-top: 1px solid #f3f4f6;
          color: #111827;
          vertical-align: middle;
        }
        .track-items-table td.col-num { text-align: right; color: #374151; }
        .track-items-table td.col-total { font-weight: 700; color: #111827; }
        .track-items-table tbody tr:hover td { background: #f9fafb; }
        .track-item-product {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .track-item-img {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          flex-shrink: 0;
          background: #f9fafb;
        }
        .track-item-variant-attrs {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-top: 2px;
        }

        /* ── Multiple orders list ── */
        .track-orders-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .track-orders-list-header {
          margin-bottom: 4px;
        }
        .track-orders-list-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0 0 4px;
          color: #111827;
        }
        .track-orders-list-hint {
          font-size: .88rem;
          color: #6b7280;
          margin: 0;
        }

        /* ── Accordion ── */
        .track-accordion-item {
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,.05);
          transition: border-color .15s, box-shadow .15s;
        }
        .track-accordion-item.is-open {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.08), 0 2px 8px rgba(0,0,0,.07);
        }
        .track-accordion-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 22px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background .12s;
        }
        .track-accordion-header:hover { background: #f9fafb; }
        .track-accordion-item.is-open .track-accordion-header { background: #eff6ff; }
        .tah-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .tah-id {
          font-size: 1rem;
          font-weight: 800;
          color: #111827;
        }
        .tah-date {
          font-size: .87rem;
          color: #6b7280;
        }
        .tah-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .tah-chevron {
          color: #6b7280;
          transition: transform .2s;
          flex-shrink: 0;
        }
        .tah-chevron--open { transform: rotate(180deg); color: #2563eb; }
        .track-accordion-body {
          padding: 0 22px 22px;
          border-top: 1px solid #e5e7eb;
        }
        .track-accordion-body > * { margin-top: 22px; }
        @media (max-width: 600px) {
          .track-accordion-header { padding: 14px 16px; }
          .track-accordion-body { padding: 0 16px 16px; }
          .tah-right .track-status-pill { display: none; }
        }

        /* ── Download PDF button row ── */
        .track-download-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }
      `}</style>
    </>
  )
}

