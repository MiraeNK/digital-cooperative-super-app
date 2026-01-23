"use client"

import { Search, Filter, ShoppingCart } from "lucide-react"
import { useState } from "react"

const allProducts = [
  {
    id: 1,
    name: "Beras Putih Premium",
    price: 52000,
    memberPrice: 47000,
    image: "🍚",
    discount: 10,
    category: "Bahan Pokok",
    type: "regular",
  },
  {
    id: 2,
    name: "Minyak Goreng 2L",
    price: 28000,
    memberPrice: 24000,
    image: "🫒",
    discount: 15,
    category: "Bahan Pokok",
    type: "regular",
  },
  { id: 3, name: "Baju Batik Lokal", price: 75000, memberPrice: 62000, image: "👔", discount: 17, category: "Fashion", type: "regular" },
  {
    id: 4,
    name: "Kopi Arabika Asli",
    price: 85000,
    memberPrice: 72000,
    image: "☕",
    discount: 15,
    category: "Minuman",
    type: "regular",
  },
  {
    id: 5,
    name: "Garam Putih Halus",
    price: 8000,
    memberPrice: 6500,
    image: "🧂",
    discount: 19,
    category: "Bahan Pokok",
    type: "regular",
  },
  {
    id: 6,
    name: "Telur Ayam Segar",
    price: 24000,
    memberPrice: 20000,
    image: "🥚",
    discount: 17,
    category: "Makanan Segar",
    type: "regular",
  },
  { id: 7, name: "Jeruk Lokal Segar", price: 32000, memberPrice: 27000, image: "🍊", discount: 16, category: "Buah", type: "regular" },
  {
    id: 8,
    name: "Tahu Goreng Spesial",
    price: 18000,
    memberPrice: 15000,
    image: "🟫",
    discount: 17,
    category: "Makanan",
    type: "regular",
  },
  // Pharmacy/Apotek Products
  {
    id: 101,
    name: "Vitamin C 500mg",
    price: 35000,
    memberPrice: 30000,
    image: "💊",
    discount: 14,
    category: "Suplemen",
    type: "pharmacy",
    requiresPrescription: false,
  },
  {
    id: 102,
    name: "Parasetamol 500mg (10 Tab)",
    price: 8500,
    memberPrice: 7000,
    image: "💉",
    discount: 18,
    category: "Obat",
    type: "pharmacy",
    requiresPrescription: false,
  },
  {
    id: 103,
    name: "Multivitamin Harian",
    price: 65000,
    memberPrice: 55000,
    image: "🌿",
    discount: 15,
    category: "Suplemen",
    type: "pharmacy",
    requiresPrescription: false,
  },
  {
    id: 104,
    name: "Antacid Suspension",
    price: 22000,
    memberPrice: 18000,
    image: "🥤",
    discount: 18,
    category: "Obat",
    type: "pharmacy",
    requiresPrescription: false,
  },
  {
    id: 105,
    name: "Masker Medis (50pcs)",
    price: 45000,
    memberPrice: 38000,
    image: "😷",
    discount: 16,
    category: "Kesehatan",
    type: "pharmacy",
    requiresPrescription: false,
  },
]

const categories = ["Semua", "Bahan Pokok", "Makanan Segar", "Fashion", "Minuman", "Buah", "Makanan", "Obat", "Suplemen", "Kesehatan"]

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [cart, setCart] = useState<number[]>([])

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Toko Online</h2>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">Kategori</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                selectedCategory === category
                  ? "bg-primary text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <p className="text-sm text-slate-600 mb-4">{filteredProducts.length} produk ditemukan</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-32 sm:h-40 bg-slate-100 flex items-center justify-center text-4xl sm:text-5xl">
                {product.image}
                <div className="absolute top-2 right-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
                  {product.discount}%
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2">{product.name}</p>

                <div className="mt-3">
                  <p className="text-xs text-slate-500 line-through">Rp {product.price.toLocaleString()}</p>
                  <p className="text-sm sm:text-base font-bold text-primary">
                    Rp {product.memberPrice.toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => setCart([...cart, product.id])}
                  className={`w-full mt-3 text-white text-xs sm:text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition active:scale-95 ${
                    cart.includes(product.id) ? "bg-accent hover:bg-orange-600" : "bg-primary hover:bg-blue-700"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {cart.filter((id) => id === product.id).length > 0 ? "Tambah" : "Keranjang"}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Total Items</p>
            <p className="text-2xl font-bold text-slate-900">{cart.length}</p>
          </div>
          <button className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition active:scale-95">
            Checkout
          </button>
        </div>
      )}
    </div>
  )
}
