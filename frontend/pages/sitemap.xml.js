// Dynamic sitemap generator — outputs XML at /sitemap.xml
export default function Sitemap() {
  // getServerSideProps will handle the response
  return null
}

export async function getServerSideProps({ res }) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '') || 'https://example.com'

  const staticPaths = ['/', '/products', '/track-order', '/cart', '/faq']

  let urls = [...staticPaths]

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')
    if (apiBase) {
      const r = await fetch(`${apiBase}/api/products`)
      if (r.ok) {
        const products = await r.json()
        for (const p of products) {
          urls.push(`/products/${p.id}`)
        }
      }
    }
  } catch (e) {
    // ignore
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(u => `  <url><loc>${baseUrl}${u}</loc></url>`)
    .join('\n')}\n</urlset>`

  res.setHeader('Content-Type', 'text/xml')
  res.write(xml)
  res.end()

  return { props: {} }
}
