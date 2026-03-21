import Link from 'next/link'

export default function Header(){
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container container-wide">
        <Link href="/" className="navbar-brand fw-bold">Construction Store</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><Link href="/" className="nav-link">Home</Link></li>
            <li className="nav-item"><Link href="/products" className="nav-link">Products</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
