"use client"

import { User, Mail, MapPin, Edit2 } from "lucide-react"

export default function WriterProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Profil Penulis</h1>
        <p className="text-slate-600">Kelola informasi profil Anda</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white font-bold text-4xl flex-shrink-0">
            SA
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">Tubagus Ahmad</h2>
            <p className="text-slate-600 mb-4">Penulis Konten & Contributor Koperasi</p>
            <button className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profil
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-slate-400" />
              <label className="text-sm font-semibold text-slate-700">Email</label>
            </div>
            <p className="text-slate-900">tubagus.ahmad@email.com</p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-slate-400" />
              <label className="text-sm font-semibold text-slate-700">Role</label>
            </div>
            <p className="text-slate-900 font-semibold">Writer Admin</p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-slate-400" />
              <label className="text-sm font-semibold text-slate-700">Lokasi</label>
            </div>
            <p className="text-slate-900">Purwakarta, Jawa Barat</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Bidang Keahlian</label>
            <p className="text-slate-900">Hasil Tani, Bisnis Digital</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Statistik Penulis</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Total Artikel", value: "12" },
            { label: "Total Dibaca", value: "12,450" },
            { label: "Skor Reputasi", value: "8.5" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-2xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-2">Panduan Penulis</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Tulis konten berkualitas tinggi dan original</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Gunakan kategori yang tepat untuk artikel Anda</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Hindari konten yang tidak sesuai dengan pedoman komunitas</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Respon dari admin biasanya dalam 24 jam</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
