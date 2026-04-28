import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

/** Unique key per cart line — combines product id and variant id */
function cartKey(product) {
  return `${product.id}_${product._variantId ?? ''}`
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sc_cart')
      if (saved) setCart(JSON.parse(saved))
    } catch {}
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('sc_cart', JSON.stringify(cart))
  }, [cart, hydrated])

  function addToCart(product, discount, qty = 1) {
    const key = cartKey(product)
    setCart(prev => {
      const existing = prev.find(item => cartKey(item.product) === key)
      if (existing) {
        return prev.map(item =>
          cartKey(item.product) === key
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      }
      return [...prev, { product, quantity: qty, discount: discount ?? 0 }]
    })
  }

  function removeFromCart(productId, variantId) {
    const key = `${productId}_${variantId ?? ''}`
    setCart(prev => prev.filter(item => cartKey(item.product) !== key))
  }

  function updateQuantity(productId, variantId, qty) {
    if (qty < 1) { removeFromCart(productId, variantId); return }
    const key = `${productId}_${variantId ?? ''}`
    setCart(prev =>
      prev.map(item =>
        cartKey(item.product) === key ? { ...item, quantity: qty } : item
      )
    )
  }

  function clearCart() {
    setCart([])
  }

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => {
    const discount = item.discount || 0
    const unitPrice = item.product.price * (1 - discount / 100)
    return sum + unitPrice * item.quantity
  }, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
