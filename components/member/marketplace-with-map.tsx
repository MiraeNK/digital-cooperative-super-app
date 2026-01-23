"use client"

import { useState } from "react"
import { List, Map, MapPin, Star } from "lucide-react"
import MarketplaceGrid from "./marketplace-grid"

interface Shop {
  id: string
  name: string
  distance: string
  rating: number
  reviews: number
  x: number
  y: number
}

const shops: Shop[] = [
  {
    id: "1",
    name: "Toko Roni Hermawan",
    distance: "2.5 km",
    rating: 4.8,
    reviews: 156,
    x: 30,
    y: 35,
  },
  {
    id: "2",
    name: "Lapak Dewi Lestari",
    distance: "4.1 km",
    rating: 4.9,
    reviews: 203,
    x: 70,
    y: 60,
  },
  {
    id: "3",
    name: "Toko Wahyu Subagyo",
    distance: "3.8 km",
    rating: 4.6,
    reviews: 89,
    x: 55,
    y: 25,
  },
  {
    id: "4",
    name: "Kedai Budi Santoso",
    distance: "5.2 km",
    rating: 4.7,
    reviews: 124,
    x: 45,
    y: 70,
  },
]

export default function MarketplaceWithMap() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition ${
            viewMode === "list"
              ? "bg-primary text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <List className="w-4 h-4" />
          Tampilan Daftar
        </button>
        <button
          onClick={() => setViewMode("map")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition ${
            viewMode === "map"
              ? "bg-primary text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Map className="w-4 h-4" />
          Tampilan Peta
        </button>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Produk Terpopuler</h3>
          <MarketplaceGrid />
        </div>
      )}

      {/* Map View */}
      {viewMode === "map" && (
        <div className="space-y-4">
          {/* Map Container */}
          <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
            {/* Map Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Map Pins */}
            {shops.map((shop) => (
              <button
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className="absolute transform -translate-x-1/2 -translate-y-full hover:scale-125 transition-transform z-10"
                style={{ left: `${shop.x}%`, top: `${shop.y}%` }}
              >
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition ${
                      selectedShop?.id === shop.id
                        ? "bg-red-500 scale-125"
                        : "bg-primary hover:bg-blue-700"
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
              </button>
            ))}

            {/* No Shop Selected Message */}
            {!selectedShop && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="text-center text-white">
                  <p className="font-semibold">Klik pin untuk melihat toko</p>
                </div>
              </div>
            )}
          </div>

          {/* Shop Preview Card - Bottom */}
          {selectedShop && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">{selectedShop.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedShop.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {selectedShop.rating} ({selectedShop.reviews})
                    </span>
                  </div>
                </div>
                <button className="flex-shrink-0 px-4 py-2 bg-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm">
                  Kunjungi
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
