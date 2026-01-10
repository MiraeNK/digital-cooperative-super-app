"use client"

import { User, Mail, Phone, MapPin, LogOut, Settings } from "lucide-react"
import { useState } from "react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Profil Saya</h2>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-primary to-blue-700 text-white rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">Tubagus Ahmad</h3>
            <p className="text-blue-100">Member ID: KOP-2024-001234</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs sm:text-sm text-blue-100 mb-1">Saldo Tabungan</p>
            <p className="text-lg sm:text-xl font-bold">Rp 5.250.000</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-blue-100 mb-1">Poin Reward</p>
            <p className="text-lg sm:text-xl font-bold">2.450</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-blue-100 mb-1">Status</p>
            <p className="text-lg sm:text-xl font-bold">Aktif</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Informasi Pribadi</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm font-semibold text-primary hover:text-blue-700 transition"
          >
            {isEditing ? "Selesai" : "Edit"}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
            <input
              type="text"
              defaultValue="Tubagus Ahmad"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              defaultValue="tubagus.ahmad@email.com"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Phone size={16} />
              No. HP
            </label>
            <input
              type="tel"
              defaultValue="081234567890"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Alamat
            </label>
            <textarea
              defaultValue="Bumi Jaya Indah, Purwakarta Jawa Barat 41118"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Keamanan</h3>
        <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition text-slate-700 font-semibold">
          <Settings size={18} />
          Ubah Password
        </button>
      </div>

      {/* Actions */}
      <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition text-red-700 font-semibold">
        <LogOut size={18} />
        Keluar
      </button>
    </div>
  )
}
