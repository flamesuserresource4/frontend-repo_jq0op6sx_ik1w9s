import { useEffect, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function FiltersBar({ onApply }) {
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [q, setQ] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('')

  useEffect(() => {
    fetch(`${BACKEND}/categories`).then(r => r.json()).then(setCategories)
  }, [])

  const apply = () => {
    onApply({ category, q, min_price: minPrice || undefined, max_price: maxPrice || undefined, sort })
  }

  return (
    <div className="bg-white border rounded-md p-3 flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs text-gray-500">Search</label>
        <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && apply()} className="w-full border rounded px-3 py-2" placeholder="Search products" />
      </div>
      <div>
        <label className="block text-xs text-gray-500">Category</label>
        <select value={category} onChange={e=>setCategory(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500">Min Price</label>
        <input value={minPrice} onChange={e=>setMinPrice(e.target.value)} type="number" min="0" className="w-28 border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-xs text-gray-500">Max Price</label>
        <input value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} type="number" min="0" className="w-28 border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-xs text-gray-500">Sort</label>
        <select value={sort} onChange={e=>setSort(e.target.value)} className="border rounded px-3 py-2">
          <option value="">Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Avg. Customer Review</option>
        </select>
      </div>
      <button onClick={apply} className="bg-blue-600 text-white px-4 py-2 rounded">Apply</button>
    </div>
  )
}
