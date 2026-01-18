"use client"

import { ShoppingCart, Package } from "lucide-react"
import { useState } from "react"

interface PharmacyProduct {
  id: number
  name: string
  price: number
  memberPrice: number
  image: string
  category: string
}

const pharmacyProducts: PharmacyProduct[] = [
  {
    id: 101,
    name: "Vitamin C 500mg",
    price: 35000,
    memberPrice: 30000,
    image: "💊",
    category: "Suplemen",
  },
  {
    id: 102,
    name: "Parasetamol 500mg",
    price: 8500,
    memberPrice: 7000,
    image: "💉",
    category: "Obat",
  },
  {
    id: 103,
    name: "Multivitamin Harian",
    price: 65000,
    memberPrice: 55000,
    image: "🌿",
    category: "Suplemen",
  },
  {
    id: 104,
    name: "Antacid Suspension",
    price: 22000,
    memberPrice: 18000,
    image: "🥤",
    category: "Obat",
  },
  {
    id: 105,
    name: "Masker Medis (50pcs)",
    price: 45000,
    memberPrice: 38000,
    image: "😷",
    category: "Kesehatan",
  },
]

export default function PharmacySection() {
  const [cart, setCart] = useState<number[]>([])

  const addToCart = (productId: number) => {
    setCart([...cart, productId])
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Apotek Koperasi</h3>
            <p className="text-xs text-slate-500">Resmi dari Pengelolaan Koperasi</p>
          </div>
        </div>
        <a href="#" className="text-primary text-sm font-semibold hover:underline">
          Lihat Semua
        </a>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {pharmacyProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition">
            {/* Image */}
            <div className="bg-emerald-50 h-24 flex items-center justify-center text-4xl">
              {product.image}
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
              <div>
                <p className="text-xs text-emerald-600 font-semibold mb-1">{product.category}</p>
                <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">{product.name}</h4>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <p className="text-xs text-slate-500 line-through">Rp {product.price.toLocaleString("id-ID")}</p>
                <p className="text-sm font-bold text-emerald-600">Rp {product.memberPrice.toLocaleString("id-ID")}</p>
              </div>

              {/* Add Button */}
              <button
                onClick={() => addToCart(product.id)}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded transition flex items-center justify-center gap-1"
              >
                <ShoppingCart className="w-3 h-3" />
                Beli
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Badge */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
        <div className="text-lg">🏥</div>
        <div className="text-xs text-slate-700">
          <p className="font-semibold text-emerald-700 mb-1">Layanan Apotek Resmi</p>
          <p>Semua produk diatur stoknya oleh Super Admin Koperasi. Garansi keaslian dan keamanan produk dijamin.</p>
        </div>
      </div>
    </div>
  )
}
