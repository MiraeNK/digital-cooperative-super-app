"use client"

import { useState, useEffect } from "react"
import { Edit2, Trash2, Eye } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getArticlesByAuthor, deleteArticle } from "@/lib/firebase"
import ArticleReader from "@/components/member/article-reader"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const toDate = (value: any): Date | null => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === "function") return value.toDate()
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

type Props = {
  refreshToken?: number
  onArticleChanged?: () => void
  onEditArticle?: (article: any) => void
}

export default function WriterArticleList({ refreshToken = 0, onArticleChanged, onEditArticle }: Props) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [articles, setArticles] = useState<any[]>([])
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      if (!user) {
        setArticles([])
        return
      }
      
      setIsLoading(true)
      try {
        const authorArticles = await getArticlesByAuthor(user.uid)
        setArticles(authorArticles as any[])
      } catch (error) {
        console.error("Error fetching articles:", error)
        setArticles([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [user, refreshToken])

  const handleDelete = async (articleId: string) => {
    try {
      await deleteArticle(articleId)
      setArticles((prev) => prev.filter((a) => a.id !== articleId))
      onArticleChanged?.()
      toast({
        title: "Artikel dihapus",
        description: "Artikel berhasil dihapus dari daftar Anda.",
      })
    } catch (error) {
      console.error("Error deleting article:", error)
      toast({
        variant: "destructive",
        title: "Gagal menghapus",
        description: "Terjadi kesalahan saat menghapus artikel.",
      })
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

      {!isLoading && articles.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-600">
          Belum ada artikel. Silakan buat artikel pertama Anda.
        </div>
      )}

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
                  {toDate(article.createdAt)?.toLocaleDateString("id-ID") || "-"}
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
                onClick={() => setSelectedArticle(article)}
                className="p-2 text-primary hover:bg-blue-50 rounded-lg transition"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEditArticle?.(article)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition" 
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setDeleteTargetId(article.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" 
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedArticle && (
        <ArticleReader
          article={{
            id: selectedArticle.id,
            title: selectedArticle.title || "Tanpa Judul",
            category: selectedArticle.category,
            author: selectedArticle.author,
            authorId: selectedArticle.authorId,
            views: selectedArticle.views || 0,
            likes: selectedArticle.likes || 0,
            cover: selectedArticle.cover || selectedArticle.coverImage || "",
            excerpt: selectedArticle.excerpt || "",
            description: selectedArticle.description || selectedArticle.excerpt || "",
            content: selectedArticle.content || "",
            tags: selectedArticle.tags || (selectedArticle.category ? [selectedArticle.category] : []),
            createdAt: selectedArticle.createdAt,
          }}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      <AlertDialog open={Boolean(deleteTargetId)} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus artikel ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Artikel akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                const articleId = deleteTargetId
                setDeleteTargetId(null)
                if (articleId) void handleDelete(articleId)
              }}
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
