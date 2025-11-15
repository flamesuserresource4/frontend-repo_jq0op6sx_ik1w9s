import { useEffect, useMemo, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Orders() {
  const sessionId = useMemo(() => localStorage.getItem('session_id'), [])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (sessionId) {
      fetch(`${BACKEND}/orders?session_id=${sessionId}`).then(r => r.json()).then(setOrders)
    }
  }, [sessionId])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      <div className="space-y-4">
        {orders.length === 0 && <p className="text-gray-500">No orders yet.</p>}
        {orders.map(o => (
          <div key={o.id} className="bg-white border rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono text-sm">{o.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold">{o.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-semibold">${o.total?.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {o.items?.length} items
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
