"use client"

import { Eye, Share2 } from "lucide-react"

export default function WriterStats() {
  const stats = [
    { label: "Total Dibaca", value: "12,450", icon: Eye, color: "bg-blue-100 text-primary" },
    { label: "Total Share", value: "3,240", icon: Share2, color: "bg-green-100 text-green-600" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Lihat performa artikel Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Artikel Terbaru</h2>
        <div className="space-y-3">
          {[
            { title: "Tips Berkebun Organik di Rumah", views: 2450, date: "2 hari lalu" },
            { title: "Panduan Bisnis E-Commerce untuk UMKM", views: 1820, date: "5 hari lalu" },
            { title: "Kesehatan Mental di Era Digital", views: 3180, date: "1 minggu lalu" },
          ].map((article, idx) => (
            <div key={idx} className="flex items-start justify-between pb-3 border-b border-slate-100 last:border-b-0">
              <div>
                <p className="font-semibold text-slate-900 mb-1">{article.title}</p>
                <p className="text-xs text-slate-500">{article.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">{article.views} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
