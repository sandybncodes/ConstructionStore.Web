const BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')

if (!BASE) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured')
}

async function request(path){
  const res = await fetch(`${BASE}${path}`)
  if(!res.ok){
    const txt = await res.text().catch(()=>res.statusText)
    throw new Error(txt || 'API error')
  }
  return res.json()
}

export async function getProducts(){
  return request('/api/products')
}

export async function getProductById(id){
  return request(`/api/products/${id}`)
}

export async function getCategories(){
  return request('/api/categories')
}

export async function createOrder(orderPayload) {
  const res = await fetch(`${BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText)
    throw new Error(txt || 'Failed to place order')
  }
  return res.json()
}
