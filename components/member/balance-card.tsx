"use client"

import { Eye, EyeOff } from "lucide-react"

interface BalanceCardProps {
  visible: boolean
  onToggleVisibility: () => void
}

export default function BalanceCard({ visible, onToggleVisibility }: BalanceCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-600">TOTAL TABUNGAN</p>
        <button onClick={onToggleVisibility} className="p-2 hover:bg-slate-200 rounded-lg transition">
          {visible ? <Eye className="w-5 h-5 text-slate-600" /> : <EyeOff className="w-5 h-5 text-slate-600" />}
        </button>
      </div>
      <p className="text-3xl sm:text-4xl font-bold text-slate-900">{visible ? "Rp 5.250.000" : "••••••••"}</p>
      <p className="text-sm text-slate-500 mt-3">Koperasi Simpan Pinjam Sejahtera</p>
    </div>
  )
}
