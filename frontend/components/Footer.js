import Link from 'next/link'
import { useLanguage } from '../lib/i18nContext'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer>
      {/* ── Main Footer ── */}
      <div className="site-footer">
        <div className="container-main py-5">
          <div className="row g-4">

            <div className="col-md-3">
              <h5 style={{lineHeight: 1.1}}><span style={{fontWeight: 700, display: 'block'}}>MIRDAV</span><span style={{fontWeight: 400, fontSize: '0.7em'}}>COMPANY</span></h5>
              <p>{t('footerTagline')}</p>
            </div>

            <div className="col-md-2">
              <h6>{t('footerProducts')}</h6>
              <ul>
                <li><Link href="/products">{t('footerAllProducts')}</Link></li>
                <li><Link href="/products">{t('footerBestSellers')}</Link></li>
                <li><Link href="/products">{t('footerNewArrivals')}</Link></li>
                <li><Link href="/products">{t('footerSaleItems')}</Link></li>
              </ul>
            </div>

            <div className="col-md-2">
              <h6>{t('footerHelp')}</h6>
              <ul>
                <li><Link href="/">{t('footerFaq')}</Link></li>
                <li><Link href="/">{t('footerShippingInfo')}</Link></li>
                <li><Link href="/">{t('footerReturns')}</Link></li>
                <li><Link href="/track-order">{t('footerTrackOrder')}</Link></li>
              </ul>
            </div>

            <div className="col-md-2">
              <h6>{t('footerServices')}</h6>
              <ul>
                <li>{t('footerSupport247')}</li>
                <li>{t('footerFreeShipping')}</li>
                <li>{t('footerTradeAssurance')}</li>
                <li>{t('footerSecurePayments')}</li>
              </ul>
            </div>

            <div className="col-md-3">
              <h6>{t('footerAbout')}</h6>
              <p>
                {t('footerSchedule')}<br />
                support@zidexstore.com<br />
                +373 (22) 000-000
              </p>
            </div>

          </div>
        </div>
        <div className="footer-bottom" style={{ color: '#6b7280' }}>
          &copy; {t('footerCopyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  )
}

