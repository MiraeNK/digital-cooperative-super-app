"use client"

import { X, ArrowLeft, Share2, Heart } from "lucide-react"

interface Article {
  id: string
  title: string
  category: string
  author: string
  views: number
  cover: string
  excerpt: string
}

interface ArticleReaderProps {
  article: Article
  onClose: () => void
}

export default function ArticleReader({ article, onClose }: ArticleReaderProps) {
  const fullContent = `${article.excerpt}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900 flex-1 mx-4 truncate">Membaca Artikel</h1>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition">
            <Heart className="w-5 h-5 text-slate-600" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition">
            <Share2 className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Cover */}
        <img
          src={article.cover || "/placeholder.jpg"}
          alt={article.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />

        {/* Meta */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
          <div className="space-y-1">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
              {article.category}
            </div>
            <div className="text-sm text-slate-600 mt-2">
              <p className="font-semibold text-slate-900">{article.author}</p>
              <p className="text-xs">{article.views} kali dibaca</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">{article.title}</h1>

        {/* Content */}
        <div className="prose prose-sm max-w-none text-slate-700 space-y-4 mb-8">
          {fullContent.split("\n\n").map((paragraph, idx) => (
            <p key={idx} className="text-base leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-200 space-y-4">
          <div className="flex items-center gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition">
              <Heart className="w-5 h-5" />
              Suka Artikel
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition">
              <Share2 className="w-5 h-5" />
              Bagikan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
