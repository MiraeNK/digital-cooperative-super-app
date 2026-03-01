"use client"

import { useEffect, useMemo, useState } from "react"
import { Eye, Loader2, MessageSquare, RefreshCw, ThumbsDown, ThumbsUp, Trash2, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { deleteForumPostByAdmin, subscribeKYCForumPosts } from "@/lib/firebase"

export default function CommunityPostsManager() {
  const { user, userProfile } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<any | null>(null)

  const isAdmin = userProfile?.role === "admin"

  const stats = useMemo(() => {
    return {
      total: posts.length,
      totalComments: posts.reduce((sum, post) => sum + Number(post.commentCount || 0), 0),
    }
  }, [posts])

  const loadPosts = async () => {
    // Realtime listener handles updates automatically.
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 250)
  }

  useEffect(() => {
    const unsubscribe = subscribeKYCForumPosts((rows) => {
      setPosts(rows)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleDelete = async (postId: string) => {
    if (!isAdmin || !user?.uid) {
      alert("Hanya admin yang bisa menghapus postingan.")
      return
    }

    const confirmed = window.confirm("Hapus postingan ini dari komunitas?")
    if (!confirmed) return

    setDeletingId(postId)
    try {
      await deleteForumPostByAdmin(postId, user.uid, userProfile?.role || "")
      setPosts((prev) => prev.filter((post) => post.id !== postId))
      if (selectedPost?.id === postId) {
        setSelectedPost(null)
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Gagal menghapus postingan.")
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (value: any) => {
    const date = value instanceof Date ? value : value?.toDate?.() ? value.toDate() : null
    if (!date) return "-"
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Community Manager</h1>
          <p className="text-slate-600">Moderasi diskusi komunitas dan pantau aktivitas member</p>
        </div>
        <button
          onClick={loadPosts}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-slate-600">Total Postingan</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-slate-600">Total Komentar</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalComments}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Belum ada postingan komunitas.</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border border-slate-200 rounded-lg p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 line-clamp-1">{post.title || "Tanpa judul"}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Oleh {post.author || "Unknown"} - {formatDate(post.timestamp || post.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-semibold text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-semibold text-sm disabled:opacity-60"
                    >
                      {deletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Hapus
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-700 line-clamp-3 mb-4">{post.content || "-"}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {Array.isArray(post.upvotes) ? post.upvotes.length : Number(post.upvotes || 0)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsDown className="w-4 h-4" />
                    {Array.isArray(post.downvotes) ? post.downvotes.length : Number(post.downvotes || 0)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {Number(post.commentCount || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200">
            <div className="flex items-start justify-between p-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedPost.title || "Tanpa judul"}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Oleh {selectedPost.author || "Unknown"} - {formatDate(selectedPost.timestamp || selectedPost.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {selectedPost.image && (
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title || "Community post image"}
                  className="w-full h-56 object-cover rounded-lg border border-slate-200"
                />
              )}
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedPost.content || "-"}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 pt-2 border-t border-slate-200">
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {Array.isArray(selectedPost.upvotes) ? selectedPost.upvotes.length : Number(selectedPost.upvotes || 0)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ThumbsDown className="w-4 h-4" />
                  {Array.isArray(selectedPost.downvotes) ? selectedPost.downvotes.length : Number(selectedPost.downvotes || 0)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {Number(selectedPost.commentCount || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
