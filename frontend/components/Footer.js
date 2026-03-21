import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-main py-5">
        <div className="row g-4">

          <div className="col-md-4">
            <h5>Stanley</h5>
            <p>
              Quality construction tools and materials for every job.
              Free shipping worldwide on all orders.
            </p>
          </div>

          <div className="col-md-2">
            <h6>Quick Links</h6>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/products">Products</Link></li>
              <li><Link href="/products">Categories</Link></li>
              <li><Link href="/products">Top Deals</Link></li>
            </ul>
          </div>

          <div className="col-md-3">
            <h6>Support</h6>
            <ul>
              <li>Online 24/7 Support</li>
              <li>Free Shipping Worldwide</li>
              <li>Trade Assurance</li>
              <li>Secure Payments</li>
            </ul>
          </div>

          <div className="col-md-3">
            <h6>Contact</h6>
            <p>
              Mon&ndash;Fri: 9am &ndash; 6pm<br />
              support@stanleystore.com<br />
              +1 (800) 555-0192
            </p>
          </div>

        </div>
      </div>
      <div className="footer-bottom" style={{ color: '#6b7280' }}>
        &copy; {new Date().getFullYear()} Construction Store &mdash; All rights reserved
      </div>
    </footer>
  )
}

