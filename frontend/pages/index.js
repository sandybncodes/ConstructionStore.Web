import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'

export default function Home(){
  return (
    <>
      <Header />
      <main className="container container-wide py-5">
        <section className="hero d-flex align-items-center">
          <div className="row w-100">
            <div className="col-md-6">
              <h1 className="display-6">Quality construction materials — built to last</h1>
              <p className="text-muted">Browse our catalog of cement, bricks, timber and more — competitive pricing and fast delivery.</p>
              <Link href="/products" className="btn btn-primary btn-lg">Explore products</Link>
            </div>
            <div className="col-md-6 d-none d-md-block">
              <img src="/hero-banner.jpg" alt="materials" className="img-fluid" style={{borderRadius:8}} />
            </div>
          </div>
        </section>

        <section className="mt-5">
          <h3>Why choose us</h3>
          <div className="row mt-3">
            <div className="col-md-4">
              <div className="p-3 bg-white rounded shadow-sm">Competitive Prices</div>
            </div>
            <div className="col-md-4 mt-3 mt-md-0">
              <div className="p-3 bg-white rounded shadow-sm">High Quality</div>
            </div>
            <div className="col-md-4 mt-3 mt-md-0">
              <div className="p-3 bg-white rounded shadow-sm">Fast Delivery</div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
