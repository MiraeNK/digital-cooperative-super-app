"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle, MessageSquare, Badge, ThumbsUp, ThumbsDown, Trash2, ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react"
import FloatingMessageButton from "./floating-message-button"
import PublicProfile from "./public-profile"
import { useAuth } from "@/components/auth-provider"
import { getUserProfile, createForumPost, addCommentToPost, addReplyToComment, voteOnPost, getForumPostsWithAuthorData, deleteForumPostByAdmin, getCommentsForPost } from "@/lib/firebase"

interface Comment {
  id: string
  author: string
  authorId: string
  content: string
  replyToName?: string
  replyToUserId?: string
  timestamp: string
  upvotes: number
  downvotes: number
  upvoted?: boolean
  downvoted?: boolean
  replies?: Comment[]
}

interface ForumPost {
  id: string
  type: "discussion" | "selling"
  topic: "Keuangan & Bisnis" | "Hasil Tani" | "Kesehatan" | "Teknologi"
  author: string
  authorId: string
  avatar?: string
  title: string
  content: string
  timestamp: string
  image?: string
  upvotes: number
  downvotes: number
  comments: Comment[]
  upvoted?: boolean
  downvoted?: boolean
  isAnnouncement?: boolean
  price?: number
}

interface CommunityPageProps {
  onChatSelect?: (chatId: string) => void
  userRole?: "member" | "admin" | "super_admin"
}

export default function CommunityPage({ onChatSelect, userRole = "member" }: CommunityPageProps) {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null)
  
  const [showComments, setShowComments] = useState<string | null>(null)
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({})
  const [activeReplyKey, setActiveReplyKey] = useState<string | null>(null)
  const [replyTargets, setReplyTargets] = useState<{ [key: string]: { name: string; userId: string } }>({})
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [showNewThread, setShowNewThread] = useState(false)
  const [newThreadType, setNewThreadType] = useState<"discussion" | "selling">("discussion")
  const [newThreadTopic, setNewThreadTopic] = useState<"Keuangan & Bisnis" | "Hasil Tani" | "Kesehatan" | "Teknologi">("Teknologi")
  const [newThreadTitle, setNewThreadTitle] = useState("")
  const [newThreadContent, setNewThreadContent] = useState("")
  const [newThreadImage, setNewThreadImage] = useState<string | null>(null)
  const [newThreadPrice, setNewThreadPrice] = useState("")
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingPost, setIsSavingPost] = useState(false)
  const [savingCommentPostId, setSavingCommentPostId] = useState<string | null>(null)
  const [savingReplyPostId, setSavingReplyPostId] = useState<string | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [userRole_, setUserRole_] = useState<"member" | "admin">("member")
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([])

  const formatPostTimestamp = (value: any) => {
    const date =
      value instanceof Date
        ? value
        : typeof value?.toDate === "function"
          ? value.toDate()
          : typeof value === "string" || typeof value === "number"
            ? new Date(value)
            : null
    if (!date || Number.isNaN(date.getTime())) return "Baru saja"
    return date.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
  }

  const formatCommentTimestamp = (value: any) => {
    const date =
      value instanceof Date
        ? value
        : typeof value?.toDate === "function"
          ? value.toDate()
          : typeof value === "string" || typeof value === "number"
            ? new Date(value)
            : null
    if (!date || Number.isNaN(date.getTime())) return "Sekarang"
    return date.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
  }

  const loadForumPosts = async () => {
    setIsLoading(true)
    try {
      const posts = await getForumPostsWithAuthorData()
      const normalizedPosts = await Promise.all(
        posts.map(async (post: any) => {
          let rawComments: any[] = []
          try {
            rawComments = await getCommentsForPost(post.id)
          } catch (error) {
            // Keep post visible even when comment subcollection read fails.
            rawComments = []
          }
          const normalizedComments: Comment[] = await Promise.all(
            (rawComments || []).map(async (comment: any) => {
              let authorProfile: any = null
              try {
                authorProfile = await getUserProfile(comment.userId)
              } catch (error) {
                authorProfile = null
              }
              return {
                id: comment.id,
                author: authorProfile?.displayName || "Anggota",
                authorId: comment.userId || "",
                content: comment.content || "",
                timestamp: formatCommentTimestamp(comment.createdAt || comment.timestamp),
                upvotes: Number(comment.upvotes || 0),
                downvotes: Number(comment.downvotes || 0),
                replies: await Promise.all(
                  ((comment.replies || []) as any[]).map(async (reply: any) => {
                    let replyAuthorProfile: any = null
                    try {
                      replyAuthorProfile = await getUserProfile(reply.userId || reply.authorId || "")
                    } catch (error) {
                      replyAuthorProfile = null
                    }
                    return {
                      id: reply.id || `r-${Date.now()}`,
                      author: replyAuthorProfile?.displayName || reply.author || "Anggota",
                      authorId: reply.userId || reply.authorId || "",
                      content: reply.content || "",
                      replyToName: reply.replyToName || "",
                      replyToUserId: reply.replyToUserId || "",
                      timestamp: formatCommentTimestamp(reply.createdAt || reply.timestamp),
                      upvotes: Number(reply.upvotes || 0),
                      downvotes: Number(reply.downvotes || 0),
                    }
                  }),
                ),
              }
            }),
          )

          return {
            ...post,
            author: post.authorData?.displayName || post.author || "Anggota",
            authorId: post.userId || post.authorId || "",
            timestamp: formatPostTimestamp(post.createdAt || post.timestamp),
            upvotes: Array.isArray(post.upvotes) ? post.upvotes.length : Number(post.upvotes || 0),
            downvotes: Array.isArray(post.downvotes) ? post.downvotes.length : Number(post.downvotes || 0),
            comments: normalizedComments,
          }
        }),
      )

      setForumPosts(normalizedPosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setForumPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch posts from Firebase on mount
  useEffect(() => {
    loadForumPosts()
  }, [])

  const topics = ["Keuangan & Bisnis", "Hasil Tani", "Kesehatan", "Teknologi"]
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    )
  }

  const filteredPosts = forumPosts.filter((post) => {
    if (selectedTopics.length === 0) return true
    return selectedTopics.includes(post.topic)
  })

  const toggleUpvote = async (postId: string) => {
    try {
      await voteOnPost(postId, user?.uid || "", "upvote")
      setForumPosts(
        forumPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                upvoted: !post.upvoted,
                upvotes: post.upvoted ? post.upvotes - 1 : post.upvotes + 1,
                downvoted: post.upvoted ? false : post.downvoted,
              }
            : post,
        ),
      )
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const toggleDownvote = async (postId: string) => {
    try {
      await voteOnPost(postId, user?.uid || "", "downvote")
      setForumPosts(
        forumPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                downvoted: !post.downvoted,
                downvotes: post.downvoted ? post.downvotes - 1 : post.downvotes + 1,
                upvoted: post.downvoted ? false : post.upvoted,
              }
            : post,
        ),
      )
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  // Set user role from userProfile
  useEffect(() => {
    if (userProfile?.role) {
      setUserRole_(userProfile.role as "member" | "admin")
    }
  }, [userProfile])

  const deletePost = async (postId: string) => {
    if (!user) {
      alert("Anda harus login untuk menghapus postingan")
      return
    }

    try {
      setDeletingPostId(postId)
      await deleteForumPostByAdmin(postId, user.uid, userRole_)
      setForumPosts((prev) => prev.filter((post) => post.id !== postId))
      alert("Postingan berhasil dihapus")
    } catch (error) {
      console.error("Error deleting post:", error)
      alert((error as any)?.message || "Gagal menghapus postingan")
    } finally {
      setDeletingPostId(null)
    }
  }

  const handleAddComment = async (postId: string) => {
    const commentText = (commentInputs[postId] || "").trim()
    if (!user || !commentText) return

    setSavingCommentPostId(postId)
    try {
      await addCommentToPost(postId, user.uid, commentText)
      setForumPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...(post.comments || []),
                  {
                    id: `c${Date.now()}`,
                    author: userProfile?.displayName || "User",
                    authorId: user.uid,
                    content: commentText,
                    timestamp: "Sekarang",
                    upvotes: 0,
                    downvotes: 0,
                  },
                ],
              }
            : post,
        ),
      )
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }))
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Gagal mengirim komentar. Coba lagi.")
    } finally {
      setSavingCommentPostId(null)
    }
  }

  const handleAddReply = async (postId: string, commentId: string) => {
    const replyKey = `${postId}:${commentId}`
    const replyText = (commentInputs[postId] || "").trim()
    const replyTarget = replyTargets[replyKey]
    if (!user || !replyText) return

    setSavingReplyPostId(postId)
    try {
      await addReplyToComment(
        postId,
        commentId,
        user.uid,
        replyText,
        replyTarget?.userId || "",
        replyTarget?.name || "",
      )
      setForumPosts((prev) =>
        prev.map((post) =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: (post.comments || []).map((comment) =>
                  comment.id !== commentId
                    ? comment
                    : {
                        ...comment,
                        replies: [
                          ...(comment.replies || []),
                          {
                            id: `r-${Date.now()}`,
                            author: userProfile?.displayName || "User",
                            authorId: user.uid,
                            content: replyText,
                            replyToName: replyTarget?.name || "",
                            replyToUserId: replyTarget?.userId || "",
                            timestamp: "Sekarang",
                            upvotes: 0,
                            downvotes: 0,
                          },
                        ],
                      },
                ),
              },
        ),
      )
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }))
      setReplyTargets((prev) => ({ ...prev, [replyKey]: { name: "", userId: "" } }))
      setActiveReplyKey(null)
    } catch (error) {
      console.error("Error adding reply:", error)
      alert("Gagal mengirim balasan. Coba lagi.")
    } finally {
      setSavingReplyPostId(null)
    }
  }

  const createNewThread = async () => {
    if (!user || !newThreadTitle.trim() || !newThreadContent.trim()) {
      alert("Silakan isi semua field")
      return
    }
    
    setIsSavingPost(true)
    try {
      const createdId = await createForumPost(user.uid, {
        type: newThreadType,
        topic: newThreadTopic,
        author: userProfile?.displayName || "User",
        title: newThreadTitle,
        content: newThreadContent,
        image: newThreadImage || null,
        price: newThreadType === "selling" ? Number(newThreadPrice) : null,
      })

      // Optimistic update supaya post langsung muncul walau reload backend sedang lambat.
      setForumPosts((prev) => [
        {
          id: createdId || `tmp-${Date.now()}`,
          type: newThreadType,
          topic: newThreadTopic,
          author: userProfile?.displayName || "User",
          authorId: user.uid,
          title: newThreadTitle,
          content: newThreadContent,
          image: newThreadImage || undefined,
          price: newThreadType === "selling" ? Number(newThreadPrice || 0) : undefined,
          timestamp: "Baru saja",
          upvotes: 0,
          downvotes: 0,
          comments: [],
        },
        ...prev,
      ])

      // Refresh posts agar metadata sinkron dengan server saat data siap.
      await loadForumPosts()
      
      setNewThreadTitle("")
      setNewThreadContent("")
      setNewThreadImage(null)
      setNewThreadPrice("")
      setNewThreadType("discussion")
      setNewThreadTopic("Teknologi")
      setShowNewThread(false)
    } catch (error) {
      console.error("Error creating thread:", error)
      alert((error as any)?.message || "Gagal membuat post")
    } finally {
      setIsSavingPost(false)
    }
  }

  const toggleCommentUpvote = (postId: string, commentId: string) => {
    setForumPosts(
      forumPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: (post.comments || []).map((c) =>
                c.id === commentId
                  ? {
                      ...c,
                      upvoted: !c.upvoted,
                      upvotes: c.upvoted ? c.upvotes - 1 : c.upvotes + 1,
                      downvoted: c.upvoted ? false : c.downvoted,
                    }
                  : c,
              ),
            }
          : post,
      ),
    )
  }

  const unreadMessages = [
    {
      id: "admin",
      name: "Admin Koperasi",
      avatar: "A",
      message: "Info pembagian SHU & Notifikasi...",
      timestamp: "09:15",
      unreadCount: 2,
    },
    {
      id: "pelanggan",
      name: "Layanan Pelanggan",
      avatar: "L",
      message: "Transaksi pending sedang dicek...",
      timestamp: "13:45",
      unreadCount: 1,
    },
  ]

  const carouselItems = [
    {
      title: "Pengumuman Resmi",
      content: "Rapat Anggota Tahunan akan diadakan tanggal 28 Februari 2024",
      image: "/placeholder.jpg",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Topik Hangat",
      content: "Diskusi: Strategi bertani organik untuk hasil optimal",
      image: "/placeholder.jpg",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Artikel Terbaru",
      content: "5 Tips Manajemen Keuangan Koperasi di Era Digital",
      image: "/placeholder.jpg",
      color: "from-green-500 to-green-600",
    },
  ]

  const addComment = (postId: string) => {
    handleAddComment(postId)
  }

  // Show public profile modal if viewing
  if (viewingProfileId) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 py-4">
        <PublicProfile
          userId={viewingProfileId}
          onBack={() => setViewingProfileId(null)}
          onMessage={onChatSelect}
        />
      </div>
    )
  }

  return (
    <div className="w-full">
      <FloatingMessageButton onOpenFullChat={onChatSelect} />

      {/* Forum Content */}
      <div className="px-3 sm:px-4 md:px-6 max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-20">
        {/* Pinned Carousel Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-2 sm:px-4">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-600 uppercase">PINNED</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setCarouselIndex((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1))}
                className="p-1 hover:bg-slate-100 rounded transition"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setCarouselIndex((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1))}
                className="p-1 hover:bg-slate-100 rounded transition"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="h-40 sm:h-48 rounded-lg overflow-hidden shadow-md transition-all">
            <div className="relative w-full h-full">
              <img 
                src={carouselItems[carouselIndex].image || "/placeholder.svg"} 
                alt={carouselItems[carouselIndex].title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${carouselItems[carouselIndex].color} opacity-70`} />
              <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end text-white">
                <h4 className="font-bold text-base sm:text-xl mb-1 sm:mb-2">{carouselItems[carouselIndex].title}</h4>
                <p className="text-xs sm:text-sm line-clamp-2">{carouselItems[carouselIndex].content}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Thread Button */}
        <button
          onClick={() => setShowNewThread(!showNewThread)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Buat Thread Baru
        </button>

        {/* New Thread Form */}
        {showNewThread && (
          <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 sm:space-y-4">
            {/* Thread Type Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setNewThreadType("discussion")}
                className={`flex-1 py-2 px-3 font-semibold rounded-lg transition text-sm ${
                  newThreadType === "discussion"
                    ? "bg-primary text-white"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                💬 Diskusi/Pertanyaan
              </button>
              <button
                onClick={() => setNewThreadType("selling")}
                className={`flex-1 py-2 px-3 font-semibold rounded-lg transition text-sm ${
                  newThreadType === "selling"
                    ? "bg-primary text-white"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                🛍️ Penjualan
              </button>
            </div>

            <input
              type="text"
              placeholder="Judul..."
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <select
              value={newThreadTopic}
              onChange={(e) => setNewThreadTopic(e.target.value as "Keuangan & Bisnis" | "Hasil Tani" | "Kesehatan" | "Teknologi")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="Keuangan & Bisnis">Keuangan & Bisnis</option>
              <option value="Hasil Tani">Hasil Tani</option>
              <option value="Kesehatan">Kesehatan</option>
              <option value="Teknologi">Teknologi</option>
            </select>
            
            <textarea
              placeholder={newThreadType === "selling" ? "Deskripsi produk..." : "Deskripsi pertanyaan atau pemikiran Anda..."}
              value={newThreadContent}
              onChange={(e) => setNewThreadContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />

            {/* Image Upload Preview */}
            {newThreadImage && (
              <div className="relative">
                <img src={newThreadImage || "/placeholder.svg"} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                <button
                  onClick={() => setNewThreadImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  Hapus
                </button>
              </div>
            )}

            <input
              type="text"
              placeholder="Tambahkan gambar (URL)..."
              value={newThreadImage || ""}
              onChange={(e) => setNewThreadImage(e.target.value || null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {newThreadType === "selling" && (
              <input
                type="number"
                placeholder="Harga (Rp)"
                value={newThreadPrice}
                onChange={(e) => setNewThreadPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={createNewThread}
                disabled={isSavingPost}
                className="flex-1 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm"
              >
                {isSavingPost ? "Menyimpan..." : "Buat"}
              </button>
              <button
                onClick={() => setShowNewThread(false)}
                className="flex-1 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        )}
        {/* Multi-Select Topic Filter */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-600">Filter Topik:</p>
          <div className="flex gap-2 flex-wrap">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  selectedTopics.includes(topic)
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
          {selectedTopics.length > 0 && (
            <p className="text-xs text-slate-500">
              Menampilkan {filteredPosts.length} dari {forumPosts.length} thread
            </p>
          )}
        </div>

        {/* Forum Posts */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600">Tidak ada topik yang dipilih. Pilih minimal satu topik untuk melihat diskusi.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                {/* Header */}
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-start gap-3 mb-3">
                    <button
                      onClick={() => setViewingProfileId(post.authorId)}
                      className="w-10 h-10 flex-shrink-0 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition"
                    >
                      {post.author.charAt(0)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <button
                          onClick={() => setViewingProfileId(post.authorId)}
                          className="font-semibold text-slate-900 hover:text-primary transition"
                        >
                          {post.author}
                        </button>
                        <Badge className="bg-blue-100 text-primary text-xs">{post.topic}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{post.timestamp}</p>
                    </div>
                    {(userRole_ === "admin" || (user && post.authorId === user.uid)) && (
                      <button
                        onClick={() => deletePost(post.id)}
                        disabled={deletingPostId === post.id}
                        className="text-slate-400 hover:text-red-500 transition p-1 disabled:opacity-50"
                        title={userRole_ === "admin" ? "Delete post (Admin)" : "Delete your post"}
                      >
                        {deletingPostId === post.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
                  {post.price && (
                    <p className="text-lg font-bold text-primary mb-2">Rp {post.price.toLocaleString('id-ID')}</p>
                  )}
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {expandedPost === post.id || post.content.length < 200 
                      ? post.content 
                      : `${post.content.slice(0, 200)}...`}
                  </p>
                  {post.content.length > 200 && expandedPost !== post.id && (
                    <button
                      onClick={() => setExpandedPost(post.id)}
                      className="text-primary text-sm font-semibold mt-2 hover:underline"
                    >
                      Baca Selengkapnya
                    </button>
                  )}
                  {expandedPost === post.id && post.content.length > 200 && (
                    <button
                      onClick={() => setExpandedPost(null)}
                      className="text-primary text-sm font-semibold mt-2 hover:underline"
                    >
                      Sembunyikan
                    </button>
                  )}

                  {/* Read More for Official Posts */}
                  {post.topic === "Keuangan & Bisnis" && (
                    <button className="mt-3 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
                      Baca Selengkapnya
                    </button>
                  )}
                </div>

                {/* Image */}
                {post.image && (
                  <div className="h-48 bg-slate-200 overflow-hidden">
                    <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Footer - Actions */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleUpvote(post.id)}
                      className={`flex items-center gap-1 text-sm font-semibold transition ${
                        post.upvoted ? "text-primary" : "text-slate-600 hover:text-primary"
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${post.upvoted ? "fill-current" : ""}`} />
                      {post.upvotes}
                    </button>
                    <button
                      onClick={() => toggleDownvote(post.id)}
                      className={`flex items-center gap-1 text-sm font-semibold transition ${
                        post.downvoted ? "text-red-500" : "text-slate-600 hover:text-red-500"
                      }`}
                    >
                      <ThumbsDown className={`w-4 h-4 ${post.downvoted ? "fill-current" : ""}`} />
                      {post.downvotes}
                    </button>
                    <button
                      onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                      className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-primary transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {(post.comments || []).length}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.type === "selling" && (
                      <button
                        onClick={() => onChatSelect?.(post.authorId)}
                        className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Chat Penjual
                      </button>
                    )}
                    {userRole === "super_admin" && (
                      <button
                        onClick={() => deletePost(post.id)}
                        className="px-3 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Comments Section - Quora Style */}
                {showComments === post.id && (
                  <div className="px-4 py-4 bg-slate-50 border-t border-slate-200 space-y-4">
                    {/* Comments List */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {(post.comments || []).map((comment) => (
                        <div key={comment.id} className="space-y-2">
                          {(() => {
                            const replyKey = `${post.id}:${comment.id}`
                            return (
                              <>
                          {/* Main Comment */}
                          <div className="bg-white rounded p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => router.push(`/profile/${comment.authorId}`)}
                                className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold hover:opacity-80 transition"
                              >
                                {comment.author.charAt(0)}
                              </button>
                              <div>
                                <button
                                  onClick={() => router.push(`/profile/${comment.authorId}`)}
                                  className="text-sm font-semibold text-slate-900 hover:text-primary transition"
                                >
                                  {comment.author}
                                </button>
                                <p className="text-xs text-slate-500">{comment.timestamp}</p>
                              </div>
                            </div>
                            <p className="text-sm text-slate-700">{comment.content}</p>
                            <div className="flex items-center gap-4 pt-2">
                              <button
                                onClick={() => toggleCommentUpvote(post.id, comment.id)}
                                className={`flex items-center gap-1 text-xs transition ${
                                  comment.upvoted ? "text-primary" : "text-slate-500 hover:text-primary"
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                {comment.upvotes}
                              </button>
                              <button
                                onClick={() => {
                                  const isSameKey = activeReplyKey === replyKey
                                  setActiveReplyKey(isSameKey ? null : replyKey)
                                  setReplyTargets((prev) => ({
                                    ...prev,
                                    [replyKey]: {
                                      name: comment.author || "Anggota",
                                      userId: comment.authorId || "",
                                    },
                                  }))
                                }}
                                className="text-xs text-slate-500 hover:text-slate-700 transition"
                              >
                                Balas
                              </button>
                            </div>
                          </div>

                          {/* Nested Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-6 space-y-2 border-l-2 border-slate-200 pl-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="bg-white rounded p-3 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-300 text-white text-xs flex items-center justify-center font-bold">
                                      {reply.author.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-slate-900">{reply.author}</p>
                                      <p className="text-xs text-slate-500">{reply.timestamp}</p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-700">
                                    {reply.replyToName ? <span className="font-semibold text-primary">@{reply.replyToName} </span> : null}
                                    {reply.content}
                                  </p>
                                  <div className="flex items-center gap-4 pt-2">
                                    <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition">
                                      <ThumbsUp className="w-3 h-3" />
                                      {reply.upvotes}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveReplyKey(replyKey)
                                        setReplyTargets((prev) => ({
                                          ...prev,
                                          [replyKey]: {
                                            name: reply.author || "Anggota",
                                            userId: reply.authorId || "",
                                          },
                                        }))
                                      }}
                                      className="text-xs text-slate-500 hover:text-slate-700 transition"
                                    >
                                      Balas
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                              </>
                            )
                          })()}
                        </div>
                      ))}
                    </div>

                    {/* Comment Input */}
                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                      {activeReplyKey?.startsWith(`${post.id}:`) && (
                        <div className="w-full text-xs text-slate-600">
                          Membalas <span className="font-semibold text-primary">@{replyTargets[activeReplyKey]?.name || "Anggota"}</span>
                          <button
                            onClick={() => setActiveReplyKey(null)}
                            className="ml-2 text-slate-500 hover:text-slate-700"
                          >
                            Batal
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tulis komentar..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (activeReplyKey?.startsWith(`${post.id}:`)) {
                              const [, commentId = ""] = activeReplyKey.split(":")
                              handleAddReply(post.id, commentId)
                            } else {
                              addComment(post.id)
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          if (activeReplyKey?.startsWith(`${post.id}:`)) {
                            const [, commentId = ""] = activeReplyKey.split(":")
                            handleAddReply(post.id, commentId)
                          } else {
                            addComment(post.id)
                          }
                        }}
                        disabled={(savingCommentPostId === post.id || savingReplyPostId === post.id) || !(commentInputs[post.id] || "").trim()}
                        className="px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                      >
                        {(savingCommentPostId === post.id || savingReplyPostId === post.id) ? "..." : "Kirim"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
