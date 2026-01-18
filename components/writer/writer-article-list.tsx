"use client"

import { useState } from "react"
import { Edit2, Trash2, Eye } from "lucide-react"

export default function WriterArticleList() {
  const [articles, setArticles] = useState([
    {
      id: "1",
      title: "Tips Berkebun Organik di Rumah",
      category: "Hasil Tani",
      status: "published",
      views: 2450,
      date: "2 hari lalu",
      excerpt: "Panduan lengkap berkebun organik untuk pemula...",
    },
    {
      id: "2",
      title: "Panduan Bisnis E-Commerce untuk UMKM",
      category: "Keuangan & Bisnis",
      status: "draft",
      views: 0,
      date: "3 hari lalu",
      excerpt: "Strategi memulai bisnis online dari nol...",
    },
    {
      id: "3",
      title: "Kesehatan Mental di Era Digital",
      category: "Kesehatan",
      status: "rejected",
      views: 0,
      date: "5 hari lalu",
      excerpt: "Cara menjaga kesehatan mental saat bekerja online...",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700"
      case "draft":
        return "bg-yellow-100 text-yellow-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Artikel Saya</h1>
        <p className="text-slate-600">Kelola semua artikel yang pernah dibuat</p>
      </div>

      <div className="space-y-3">
        {articles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 mb-1 truncate">{article.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{article.excerpt}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(article.status)}`}>
                {article.status === "published" ? "Dipublikasi" : article.status === "draft" ? "Draft" : "Ditolak"}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
              <div className="space-x-3 flex">
                <span>{article.category}</span>
                <span>{article.date}</span>
              </div>
              {article.status === "published" && (
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <Eye className="w-4 h-4" />
                  {article.views}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
