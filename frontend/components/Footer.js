export default function Footer(){
  return (
    <footer className="bg-white mt-5 py-4 border-top">
      <div className="container container-wide text-center text-muted small">
        © {new Date().getFullYear()} Construction Store — Quality building materials
      </div>
    </footer>
  )
}
