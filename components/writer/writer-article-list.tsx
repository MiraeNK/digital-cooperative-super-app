"use client"

import { useState, useEffect } from "react"
import { Edit2, Trash2, Eye } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getArticlesByAuthor, deleteArticle } from "@/lib/firebase"

export default function WriterArticleList() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [articles, setArticles] = useState<any[]>([
    {
      id: "dummy-1",
      title: "Tips Berkebun Organik di Rumah",
      category: "Hasil Tani",
      status: "published",
      views: 2450,
      date: "2 hari lalu",
      excerpt: "Panduan lengkap berkebun organik untuk pemula...",
    },
    {
      id: "dummy-2",
      title: "Panduan Bisnis E-Commerce untuk UMKM",
      category: "Keuangan & Bisnis",
      status: "draft",
      views: 0,
      date: "3 hari lalu",
      excerpt: "Strategi memulai bisnis online dari nol...",
    },
  ])

  useEffect(() => {
    const fetchArticles = async () => {
      if (!user) return
      
      setIsLoading(true)
      try {
        const authorArticles = await getArticlesByAuthor(user.uid)
        // Combine with dummy articles
        const combinedArticles = [...(authorArticles as any[]), ...articles.filter(a => a.id.includes("dummy"))]
        setArticles(combinedArticles)
      } catch (error) {
        console.error("Error fetching articles:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [user])

  const handleDelete = async (articleId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return
    
    // Don't delete dummy articles
    if (articleId.includes("dummy")) {
      alert("Tidak bisa menghapus artikel default")
      return
    }

    try {
      await deleteArticle(articleId)
      setArticles(articles.filter(a => a.id !== articleId))
    } catch (error) {
      console.error("Error deleting article:", error)
      alert("Gagal menghapus artikel")
    }
  }

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

      {isLoading && <p className="text-slate-500">Memuat artikel...</p>}

      <div className="space-y-3">
        {articles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 mb-1 truncate">{article.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{article.excerpt}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(article.status || "draft")}`}>
                {article.status === "published" ? "Dipublikasi" : article.status === "draft" ? "Draft" : "Ditolak"}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
              <div className="space-x-3 flex">
                <span>{article.category}</span>
                <span>
                  {article.createdAt 
                    ? new Date(article.createdAt).toLocaleDateString("id-ID")
                    : article.date}
                </span>
              </div>
              {article.status === "published" && (
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <Eye className="w-4 h-4" />
                  {(article.views || 0).toLocaleString("id-ID")}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button 
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition" 
                title="Edit"
                disabled={true}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(article.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" 
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
