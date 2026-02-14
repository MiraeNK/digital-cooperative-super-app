"use client"

import { Eye, Share2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { getWriterStats, getArticlesByAuthor } from "@/lib/firebase"

export default function WriterStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalArticles: 0, totalViews: 0, totalLikes: 0, averageViewsPerArticle: 0 })
  const [articles, setArticles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      setIsLoading(true)
      try {
        const [writerStats, authorArticles] = await Promise.all([
          getWriterStats(user.uid),
          getArticlesByAuthor(user.uid)
        ])
        
        setStats(writerStats)
        setArticles(authorArticles.slice(0, 3)) // Top 3 recent articles
      } catch (error) {
        console.error("Error fetching writer stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  const statCards = [
    { label: "Total Dibaca", value: stats.totalViews.toString(), icon: Eye, color: "bg-blue-100 text-primary" },
    { label: "Total Like", value: stats.totalLikes.toString(), icon: Share2, color: "bg-green-100 text-green-600" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Lihat performa artikel Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 text-primary">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-2">Total Artikel</p>
          <p className="text-3xl font-bold text-slate-900">{isLoading ? "-" : stats.totalArticles}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-2">Total Dibaca</p>
          <p className="text-3xl font-bold text-slate-900">{isLoading ? "-" : (stats.totalViews || 0).toLocaleString("id-ID")}</p>
        </div>

        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hidden">
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
        <h2 className="text-lg font-bold text-slate-900 mb-4">Artikel Terbaru Anda</h2>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : articles.length > 0 ? (
            articles.map((article, idx) => (
              <div key={idx} className="flex items-start justify-between pb-3 border-b border-slate-100 last:border-b-0">
                <div>
                  <p className="font-semibold text-slate-900 mb-1">{article.title}</p>
                  <p className="text-xs text-slate-500">
                    {article.createdAt ? new Date(article.createdAt).toLocaleDateString("id-ID") : "Terbaru"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{(article.views || 0).toLocaleString("id-ID")} views</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm">Belum ada artikel. Mulai tulis artikel Anda sekarang!</p>
          )}
        </div>
      </div>
    </div>
  )
}
