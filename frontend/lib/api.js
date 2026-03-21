const BASE = 'https://localhost:7242'

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
