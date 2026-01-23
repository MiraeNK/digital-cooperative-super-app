"use client"

import { useState } from "react"
import { Pill, Stethoscope, MessageCircle } from "lucide-react"

interface Practitioner {
  id: string
  name: string
  role: string
  avatar: string
  online: boolean
}

const practitioners: Practitioner[] = [
  {
    id: "1",
    name: "Bidan Ani",
    role: "Kesehatan Ibu & Anak",
    avatar: "👩‍⚕️",
    online: true,
  },
  {
    id: "2",
    name: "Dr. Bambang",
    role: "Dokter Umum",
    avatar: "👨‍⚕️",
    online: true,
  },
  {
    id: "3",
    name: "Perawat Siti",
    role: "Perawat Kesehatan",
    avatar: "👩‍⚕️",
    online: false,
  },
  {
    id: "4",
    name: "Ahli Gizi Budi",
    role: "Konsultan Gizi",
    avatar: "👨‍⚕️",
    online: true,
  },
]

const pharmacyItems = [
  { id: "obat", label: "Obat", icon: "💊" },
  { id: "vitamin", label: "Vitamin", icon: "🌿" },
  { id: "ibu-anak", label: "Ibu & Anak", icon: "👶" },
  { id: "p3k", label: "P3K", icon: "🩹" },
  { id: "alat", label: "Alat Kesehatan", icon: "🩺" },
]

export default function HealthServiceSection() {
  const [selectedPractitioner, setSelectedPractitioner] = useState<string | null>(null)

  return (
    <div className="bg-white border border-red-100 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <Stethoscope className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Layanan Kesehatan Koperasi</h3>
          <p className="text-sm text-slate-500">Kesehatan terdepan untuk keluarga Anda</p>
        </div>
      </div>

      {/* Pharmacy Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Pill className="w-4 h-4 text-red-500" />
          Apotek Koperasi
        </h4>
        <div className="grid grid-cols-5 gap-3">
          {pharmacyItems.map((item) => (
            <button
              key={item.id}
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-red-50 transition group"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-2xl group-hover:bg-red-100 transition">
                {item.icon}
              </div>
              <span className="text-xs font-medium text-slate-700 text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Practitioner Consultation Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-red-500" />
          Konsultasi Praktisi
        </h4>

        {/* Horizontal Scroll Container */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-min">
            {practitioners.map((practitioner) => (
              <div
                key={practitioner.id}
                className="flex-shrink-0 w-44 bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-lg p-4 hover:shadow-md transition"
              >
                {/* Avatar and Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{practitioner.avatar}</div>
                    {practitioner.online && (
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
                    )}
                  </div>

                  {/* Name and Role */}
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{practitioner.name}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{practitioner.role}</p>
                  </div>

                  {/* Status and Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-red-100">
                    <span
                      className={`text-xs font-medium ${
                        practitioner.online ? "text-green-600" : "text-slate-400"
                      }`}
                    >
                      {practitioner.online ? "Online" : "Offline"}
                    </span>
                    <button className="flex items-center gap-1 px-2 py-1 bg-primary hover:bg-blue-700 text-white rounded text-xs font-semibold transition">
                      <MessageCircle className="w-3 h-3" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
