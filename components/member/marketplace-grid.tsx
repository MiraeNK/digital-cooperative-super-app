import { ShoppingCart, Percent } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Beras Putih Premium",
    price: 52000,
    memberPrice: 47000,
    image: "🍚",
    discount: 10,
  },
  {
    id: 2,
    name: "Minyak Goreng 2L",
    price: 28000,
    memberPrice: 24000,
    image: "🫒",
    discount: 15,
  },
  {
    id: 3,
    name: "Baju Batik Lokal",
    price: 75000,
    memberPrice: 62000,
    image: "👔",
    discount: 17,
  },
  {
    id: 4,
    name: "Kopi Arabika Asli",
    price: 85000,
    memberPrice: 72000,
    image: "☕",
    discount: 15,
  },
]

export default function MarketplaceGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Image */}
          <div className="relative h-32 sm:h-40 bg-slate-100 flex items-center justify-center text-4xl sm:text-5xl">
            {product.image}
            <div className="absolute top-2 right-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Percent className="w-3 h-3" />
              {product.discount}%
            </div>
          </div>

          {/* Details */}
          <div className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2">{product.name}</p>

            {/* Price */}
            <div className="mt-3">
              <p className="text-xs text-slate-500 line-through">Rp {product.price.toLocaleString()}</p>
              <p className="text-sm sm:text-base font-bold text-primary">Rp {product.memberPrice.toLocaleString()}</p>
            </div>

            {/* Button */}
            <button className="w-full mt-3 bg-primary hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition active:scale-95">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjang</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
