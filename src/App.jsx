import { useEffect, useMemo, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Header({ onSearch }) {
  const [q, setQ] = useState('')
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <a href="/" className="text-2xl font-black text-blue-600">ShopEase</a>
        <div className="flex-1 flex items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(q)}
            placeholder="Search for products, brands and more"
            className="w-full rounded-l-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={() => onSearch(q)} className="rounded-r-md bg-blue-600 text-white px-4 py-2">Search</button>
        </div>
        <a href="#" className="text-sm font-medium">Sign In</a>
      </div>
    </header>
  )
}

function ProductCard({ p, onAdd }) {
  return (
    <div className="group border rounded-lg overflow-hidden bg-white hover:shadow-lg transition">
      {p.image_url && (
        <img src={`${p.image_url}?w=400&q=80`} alt={p.title} className="h-48 w-full object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-semibold line-clamp-2 min-h-[3.5rem]">{p.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">{p.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-lg font-bold">${p.price}</div>
          <button onClick={() => onAdd(p)} className="bg-blue-600 text-white px-3 py-1.5 rounded-md">Add to Cart</button>
        </div>
      </div>
    </div>
  )
}

function CartDrawer({ open, onClose, items, onCheckout, loading }) {
  const total = useMemo(() => items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0), [items])
  return (
    <div className={`fixed inset-0 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-80 bg-white shadow-xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">Your Cart</h2>
          <button onClick={onClose} className="text-sm text-gray-600">Close</button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-9rem)]">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Your cart is empty.</p>
          ) : items.map((it, idx) => (
            <div key={idx} className="flex gap-3">
              {it.product?.image_url && (
                <img src={`${it.product.image_url}?w=80&q=60`} className="h-16 w-16 object-cover rounded" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-2">{it.product?.title}</p>
                <p className="text-xs text-gray-500">Qty: {it.quantity}</p>
                <p className="text-sm font-semibold">${(it.product?.price || 0).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="font-bold">${total.toFixed(2)}</span>
          </div>
          <button disabled={loading || items.length===0} onClick={onCheckout} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-md">
            {loading ? 'Placing order...' : 'Proceed to Buy'}
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const sessionId = useMemo(() => {
    const key = 'session_id'
    let s = localStorage.getItem(key)
    if (!s) {
      s = Math.random().toString(36).slice(2)
      localStorage.setItem(key, s)
    }
    return s
  }, [])

  useEffect(() => {
    loadProducts()
    loadCart()
  }, [])

  const loadProducts = async () => {
    const res = await fetch(`${BACKEND}/products`)
    if (res.ok) {
      const data = await res.json()
      setProducts(data)
      setFiltered(data)
    } else {
      setProducts([])
      setFiltered([])
    }
  }

  const search = (q) => {
    const s = q.toLowerCase()
    setFiltered(products.filter(p => p.title.toLowerCase().includes(s) || (p.description||'').toLowerCase().includes(s)))
  }

  const loadCart = async () => {
    const res = await fetch(`${BACKEND}/cart?session_id=${sessionId}`)
    if (res.ok) {
      const cart = await res.json()
      const mapped = (cart.items || []).map(it => ({
        ...it,
        product: products.find(p => p._id === it.product_id || p.id === it.product_id || p.title) || products[0]
      }))
      setCartItems(mapped)
    }
  }

  const addToCart = async (product) => {
    const payload = { product_id: product._id || product.id || product.title, quantity: 1, session_id: sessionId }
    await fetch(`${BACKEND}/cart/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setCartOpen(true)
    setCartItems(prev => {
      const idx = prev.findIndex(i => (i.product?._id||i.product?.id||i.product?.title) === (product._id||product.id||product.title))
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 }
        return copy
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const checkout = async () => {
    setLoading(true)
    await fetch(`${BACKEND}/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId }) })
    setLoading(false)
    setCartItems([])
    setCartOpen(false)
    alert('Order placed successfully!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={search} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p, i) => (
            <ProductCard key={i} p={p} onAdd={addToCart} />
          ))}
        </div>
      </div>

      <button onClick={() => setCartOpen(true)} className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">Cart ({cartItems.length})</button>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} onCheckout={checkout} loading={loading} />
    </div>
  )
}

export default App
