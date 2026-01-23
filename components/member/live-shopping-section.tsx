"use client"

import { useRef } from "react"
import { Flame, Eye } from "lucide-react"

const liveStreams = [
  { id: 1, title: "Beras Organik Premium", viewers: 1243, thumbnail: "🌾" },
  { id: 2, title: "Fashion Lokal Terkini", viewers: 856, thumbnail: "👗" },
  { id: 3, title: "Gadget & Elektronik", viewers: 2104, thumbnail: "📱" },
]

export default function LiveShoppingSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Flame className="w-5 h-5 text-red-500 animate-bounce" />
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">Live Shopping Sekarang</h3>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-4">
        <div className="flex gap-4 snap-x snap-mandatory">
          {liveStreams.map((stream) => (
            <div
              key={stream.id}
              className="flex-shrink-0 w-48 sm:w-56 bg-gradient-to-b from-primary to-blue-700 text-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative h-32 sm:h-40 bg-blue-800 flex items-center justify-center text-4xl sm:text-5xl">
                {stream.thumbnail}
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-300 rounded-full animate-pulse"></span>
                  LIVE
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-sm font-semibold line-clamp-2">{stream.title}</p>
                <div className="flex items-center gap-1 mt-3 text-xs">
                  <Eye className="w-4 h-4" />
                  <span>{stream.viewers.toLocaleString()} ditonton</span>
                </div>
                <button className="w-full bg-accent hover:bg-orange-600 text-white text-sm font-bold py-2 rounded-lg mt-3 transition active:scale-95">
                  Gabung
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
