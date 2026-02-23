"use client"

import { useState, useEffect } from "react"
import { Trash2, Eye, MessageSquare, ThumbsUp, AlertCircle, Loader2 } from "lucide-react"
import { getKYCForumPosts, deleteForumPostByAdmin } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"

export default function CommunityPostsManager() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<"all" | "discussion" | "selling">("all")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const postsData = await getKYCForumPosts()
      setPosts(postsData)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!user) return
    
    if (!confirm("Apakah Anda yakin ingin menghapus postingan ini?")) return

    setDeletingId(postId)
    try {
      await deleteForumPostByAdmin(postId, user.uid, "admin")
      setPosts(posts.filter((p) => p.id !== postId))
      alert("Postingan berhasil dihapus")
    } catch (error) {
      console.error("Error deleting post:", error)
      alert((error as any)?.message || "Gagal menghapus postingan")
    } finally {
      setDeletingId(null)
    }
  }

  const filteredPosts = filterType === "all" ? posts : posts.filter((p) => p.type === filterType)

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Community Posts Manager</h1>
        <p className="text-slate-600">Kelola dan monitor semua postingan di forum komunitas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold">Total Posts</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{posts.length}</p>
            </div>
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold">Discussions</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{posts.filter((p) => p.type === "discussion").length}</p>
            </div>
            <Eye className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold">For Sale</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{posts.filter((p) => p.type === "selling").length}</p>
            </div>
            <ThumbsUp className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filterType === "all"
              ? "bg-primary text-white"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          All Posts
        </button>
        <button
          onClick={() => setFilterType("discussion")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filterType === "discussion"
              ? "bg-primary text-white"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Discussions
        </button>
        <button
          onClick={() => setFilterType("selling")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filterType === "selling"
              ? "bg-primary text-white"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          For Sale
        </button>
      </div>

      {/* Posts List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">Tidak ada postingan</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-slate-50 transition">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        post.type === "discussion"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {post.type === "discussion" ? "Discussion" : "For Sale"}
                      </span>
                      {post.topic && (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">
                          {post.topic}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      By <span className="font-semibold text-slate-900">{post.author}</span> • {post.authorEmail}
                    </p>
                    <p className="text-sm text-slate-500">
                      Posted: {post.timestamp?.toLocaleDateString("id-ID")} {post.timestamp?.toLocaleTimeString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700 line-clamp-3">{post.content}</p>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm text-slate-600 mb-4">
                  <span>👍 {post.upvotes || 0} Upvotes</span>
                  <span>👎 {post.downvotes || 0} Downvotes</span>
                  <span>💬 {post.comments?.length || 0} Comments</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletingId === post.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-semibold rounded-lg transition disabled:opacity-50 text-sm"
                  >
                    {deletingId === post.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {deletingId === post.id ? "Deleting..." : "Delete Post"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
