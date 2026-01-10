"use client"

import { useState } from "react"
import { MessageSquare, Megaphone, Heart, MessageCircle, Badge, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ChatItem {
  id: string
  name: string
  avatar?: string
  context: string
  contextBadge: string
  message: string
  timestamp: string
  unread: number
  isAdmin?: boolean
}

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
  const [activeTab, setActiveTab] = useState("pesan")
  const [showComments, setShowComments] = useState<string | null>(null)
  const [postComments, setPostComments] = useState<{ [key: string]: string[] }>({
    "1": ["Terima kasih atas pengumuman ini"],
    "2": ["Bagus banget produknya!", "Berapa harganya?"],
    "3": ["Ide bagus, setuju!"],
    "4": ["Sudah pesan, kapan sampai?"],
  })
  const [commentInput, setCommentInput] = useState("")

  const [chats, setChats] = useState<ChatItem[]>([
    {
      id: "admin",
      name: "Admin Koperasi",
      context: "Sistem",
      contextBadge: "Official",
      message: "Info pembagian SHU & Notifikasi sistem",
      timestamp: "09:15",
      unread: 2,
      isAdmin: true,
    },
    {
      id: "budi",
      name: "Budi Santoso",
      context: "Order #INV-202601",
      contextBadge: "Penjual",
      message: "Stok beras rojolele siap dikirim pak...",
      timestamp: "10:30",
      unread: 0,
    },
    {
      id: "pelanggan",
      name: "Layanan Pelanggan",
      context: "Token Listrik",
      contextBadge: "Transaksi",
      message: "Transaksi pending sedang dicek...",
      timestamp: "13:45",
      unread: 1,
    },
    {
      id: "siti",
      name: "Siti Nurhaliza",
      context: "Order #INV-202602",
      contextBadge: "Pembeli",
      message: "Barangnya sudah sampai, terima kasih...",
      timestamp: "15:20",
      unread: 0,
    },
  ])

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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Komunitas</h2>
        <p className="text-slate-600">Terhubung dengan anggota koperasi lainnya</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pesan" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 mb-6">
          <TabsTrigger value="pesan" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">💬 Pesan</span>
            <span className="sm:hidden">Pesan</span>
          </TabsTrigger>
          <TabsTrigger value="forum" className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline">📢 Forum</span>
            <span className="sm:hidden">Forum</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PESAN (Private Chats) */}
        <TabsContent value="pesan" className="space-y-4">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect?.(chat.id)}
              className="w-full text-left p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow hover:border-primary"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    chat.isAdmin
                      ? "bg-gradient-to-br from-primary to-blue-700"
                      : "bg-gradient-to-br from-orange-400 to-orange-500"
                  }`}
                >
                  {chat.name.charAt(0)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{chat.name}</h3>
                    {chat.isAdmin && <Badge className="bg-primary text-white text-xs">Official</Badge>}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-xs font-medium text-slate-700 rounded">
                      {chat.contextBadge}
                    </span>
                    <span className="text-xs text-slate-500">{chat.context}</span>
                  </div>

                  <p className="text-sm text-slate-600 truncate">{chat.message}</p>
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {chat.timestamp}
                  </span>
                  {chat.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </TabsContent>

        {/* TAB 2: FORUM (Public Boards) */}
        <TabsContent value="forum" className="space-y-6">
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
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
