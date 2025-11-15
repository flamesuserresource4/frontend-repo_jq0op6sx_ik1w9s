import { Star } from 'lucide-react'

export default function ProductCard({ p, onAdd, onOpen }) {
  return (
    <div className="group border rounded-lg overflow-hidden bg-white hover:shadow-lg transition cursor-pointer" onClick={() => onOpen(p)}>
      {p.image_url && (
        <img src={`${p.image_url}?w=400&q=80`} alt={p.title} className="h-48 w-full object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-semibold line-clamp-2 min-h-[3.5rem]">{p.title}</h3>
        <div className="flex items-center gap-1 text-amber-500 text-sm mt-1">
          <Star className="h-4 w-4 fill-amber-400" />
          <span className="font-medium">{(p.rating ?? 4).toFixed(1)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-lg font-bold">${p.price}</div>
          <button onClick={(e) => { e.stopPropagation(); onAdd(p) }} className="bg-blue-600 text-white px-3 py-1.5 rounded-md">Add to Cart</button>
        </div>
      </div>
    </div>
  )
}
