"use client"

import { useState } from "react"
import { Heart, MessageCircle, MessageSquare, Badge } from "lucide-react"
import FloatingMessageButton from "./floating-message-button"

interface ForumPost {
  id: string
  type: "official" | "marketplace" | "feedback"
  author: string
  authorId: string
  avatar?: string
  title: string
  content: string
  timestamp: string
  image?: string
  likes: number
  comments: number
  liked?: boolean
}

interface CommunityPageProps {
  onChatSelect?: (chatId: string) => void
}

export default function CommunityPage({ onChatSelect }: CommunityPageProps) {
  const [showComments, setShowComments] = useState<string | null>(null)
  const [postComments, setPostComments] = useState<{ [key: string]: string[] }>({
    "1": ["Terima kasih atas pengumuman ini"],
    "2": ["Bagus banget produknya!", "Berapa harganya?"],
    "3": ["Ide bagus, setuju!"],
    "4": ["Sudah pesan, kapan sampai?"],
  })
  const [commentInput, setCommentInput] = useState("")

  const [forumPosts, setForumPosts] = useState<ForumPost[]>([
    {
      id: "1",
      type: "official",
      author: "Admin Koperasi",
      authorId: "admin",
      title: "Rapat Anggota Tahunan 2024",
      content:
        "Rapat Anggota Tahunan akan diadakan tanggal 28 Februari 2024 di Gedung Serba Guna Koperasi. Agenda meliputi laporan tahunan, pembagian SHU, dan pemilihan pengurus. Mohon hadir dengan membawa bukti identitas.",
      timestamp: "2 jam lalu",
      likes: 145,
      comments: 23,
    },
    {
      id: "2",
      type: "marketplace",
      author: "Roni Hermawan",
      authorId: "roni",
      title: "Panen Cabai Rawit Murah",
      content:
        "Cabai rawit segar hasil panen hari ini. Kualitas premium, harga grosir untuk member koperasi. Minat bisa langsung chat di toko.",
      image: "/fresh-red-chili-peppers.jpg",
      timestamp: "4 jam lalu",
      likes: 89,
      comments: 12,
    },
    {
      id: "3",
      type: "feedback",
      author: "Wahyu Subagyo",
      authorId: "wahyu",
      title: "Usul Stok Pupuk Subsidi Ditambah",
      content:
        "Permintaan pupuk organik meningkat dari anggota. Alangkah baiknya jika stok pupuk subsidi ditambah agar semua anggota mendapat kesempatan sama.",
      timestamp: "6 jam lalu",
      likes: 67,
      comments: 8,
    },
    {
      id: "4",
      type: "marketplace",
      author: "Dewi Lestari",
      authorId: "dewi",
      title: "Telur Ayam Kampung Organik",
      content:
        "Menerima pesanan telur ayam kampung organik tanpa kimia berbahaya. Gratis ongkir untuk pembelian minimal 10 butir.",
      image: "/organic-farm-eggs.jpg",
      timestamp: "8 jam lalu",
      likes: 156,
      comments: 28,
    },
  ])

  const [selectedFilter, setSelectedFilter] = useState("Semua")
  const filters = ["Semua", "Info Pusat", "Lapak Anggota", "Suara Anggota"]

  const filteredPosts = forumPosts.filter((post) => {
    if (selectedFilter === "Semua") return true
    if (selectedFilter === "Info Pusat") return post.type === "official"
    if (selectedFilter === "Lapak Anggota") return post.type === "marketplace"
    if (selectedFilter === "Suara Anggota") return post.type === "feedback"
    return true
  })

  const toggleLike = (postId: string) => {
    setForumPosts(
      forumPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const addComment = (postId: string) => {
    if (commentInput.trim()) {
      setPostComments({
        ...postComments,
        [postId]: [...(postComments[postId] || []), commentInput],
      })
      setCommentInput("")
      setShowComments(null)
    }
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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Floating Message Button */}
      <FloatingMessageButton
        onOpenFullChat={(chatId) => {
          onChatSelect?.(chatId)
        }}
        unreadMessages={unreadMessages}
      />

      {/* Forum Content */}
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                selectedFilter === filter ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Forum Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`rounded-lg border overflow-hidden transition-shadow hover:shadow-md ${
                post.type === "official"
                  ? "bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200"
                  : "bg-white border-slate-200"
              }`}
            >
              {/* Header */}
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      post.type === "official"
                        ? "bg-primary"
                        : post.type === "marketplace"
                          ? "bg-orange-500"
                          : "bg-slate-400"
                    }`}
                  >
                    {post.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{post.author}</h4>
                      {post.type === "official" && <Badge className="bg-primary text-white text-xs">Official</Badge>}
                    </div>
                    <p className="text-xs text-slate-500">{post.timestamp}</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{post.content}</p>

                {/* Read More for Official Posts */}
                {post.type === "official" && (
                  <button className="mt-3 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
                    Baca Selengkapnya
                  </button>
                )}
              </div>

              {/* Image for Marketplace Posts */}
              {post.image && (
                <div className="h-48 bg-slate-200 overflow-hidden">
                  <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Footer - Actions */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                {post.type === "marketplace" ? (
                  <>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1 text-sm font-semibold transition ${
                          post.liked ? "text-red-500" : "text-slate-600 hover:text-red-500"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} />
                        {post.likes}
                      </button>
                      <button
                        onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                        className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-primary transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {postComments[post.id]?.length || post.comments}
                      </button>
                    </div>
                    <button
                      onClick={() => onChatSelect?.(post.authorId)}
                      className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat Penjual
                    </button>
                  </>
                ) : post.type === "feedback" ? (
                  <div className="w-full flex items-center gap-6">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1 text-sm font-semibold transition ${
                        post.liked ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
                      }`}
                    >
                      <span className="text-xl">👍</span>
                      {post.likes}
                    </button>
                    <button
                      onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                      className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-primary transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {postComments[post.id]?.length || post.comments}
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Comments Section */}
              {showComments === post.id && (
                <div className="px-4 py-4 bg-white border-t border-slate-200 space-y-3">
                  {/* Existing Comments */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(postComments[post.id] || []).map((comment, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded text-sm text-slate-700 flex gap-2">
                        <span className="text-blue-600 font-semibold">You:</span>
                        <span>{comment}</span>
                      </div>
                    ))}
                  </div>

                  {/* Input Comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tulis komentar..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addComment(post.id)
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      onClick={() => addComment(post.id)}
                      className="px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
