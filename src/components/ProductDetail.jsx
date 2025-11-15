import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function ProductDetail({ productId, onClose, onAdd }) {
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ user_name: '', rating: 5, comment: '' })

  useEffect(() => {
    if (productId) {
      fetch(`${BACKEND}/products/${productId}`).then(r => r.json()).then(setProduct)
      fetch(`${BACKEND}/reviews?product_id=${productId}`).then(r => r.json()).then(setReviews)
    }
  }, [productId])

  const submitReview = async () => {
    if (!form.user_name || !form.rating) return
    await fetch(`${BACKEND}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, product_id: productId })
    })
    setForm({ user_name: '', rating: 5, comment: '' })
    const list = await fetch(`${BACKEND}/reviews?product_id=${productId}`).then(r => r.json())
    setReviews(list)
  }

  if (!productId) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full md:w-[700px] bg-white shadow-xl overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">Product Details</h2>
          <button onClick={onClose} className="text-sm text-gray-600">Close</button>
        </div>
        {product && (
          <div className="p-6 space-y-4">
            {product.image_url && <img src={`${product.image_url}?w=800&q=80`} className="w-full h-72 object-cover rounded" />}
            <h3 className="text-2xl font-semibold">{product.title}</h3>
            <div className="flex items-center gap-2 text-amber-500">
              <Star className="h-5 w-5 fill-amber-400" />
              <span className="font-semibold">{(product.rating ?? 4).toFixed(1)}</span>
              {product.reviews_count ? <span className="text-gray-500 text-sm">({product.reviews_count} reviews)</span> : null}
            </div>
            <p className="text-gray-700">{product.description}</p>
            <div className="text-2xl font-bold">${product.price}</div>
            <button onClick={() => onAdd(product)} className="bg-blue-600 text-white px-4 py-2 rounded">Add to Cart</button>

            <div className="pt-6 border-t">
              <h4 className="font-semibold mb-2">Customer reviews</h4>
              <div className="space-y-3">
                {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews yet.</p>}
                {reviews.map((r, i) => (
                  <div key={i} className="border rounded p-3">
                    <div className="flex items-center gap-2 text-amber-500 text-sm">
                      <Star className="h-4 w-4 fill-amber-400" />
                      <span className="font-semibold">{r.rating}</span>
                      <span className="text-gray-500">by {r.user_name}</span>
                    </div>
                    {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h5 className="font-semibold mb-2">Write a review</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={form.user_name} onChange={e=>setForm({...form, user_name:e.target.value})} placeholder="Your name" className="border rounded px-3 py-2" />
                  <select value={form.rating} onChange={e=>setForm({...form, rating: Number(e.target.value)})} className="border rounded px-3 py-2">
                    {[5,4,3,2,1].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <textarea value={form.comment} onChange={e=>setForm({...form, comment:e.target.value})} placeholder="Share your thoughts" className="mt-2 w-full border rounded px-3 py-2" />
                <button onClick={submitReview} className="mt-2 bg-green-600 text-white px-4 py-2 rounded">Submit Review</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
