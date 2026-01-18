"use client"

import { useState } from "react"
import { Heart, MessageCircle, MessageSquare, Badge, ThumbsUp, ThumbsDown, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import FloatingMessageButton from "./floating-message-button"

interface Comment {
  id: string
  author: string
  authorId: string
  content: string
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
  userRole?: "member" | "admin"
}

export default function CommunityPage({ onChatSelect, userRole = "member" }: CommunityPageProps) {
  const [showComments, setShowComments] = useState<string | null>(null)
  const [commentInput, setCommentInput] = useState("")
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [showNewThread, setShowNewThread] = useState(false)
  const [newThreadType, setNewThreadType] = useState<"discussion" | "selling">("discussion")
  const [newThreadTitle, setNewThreadTitle] = useState("")
  const [newThreadContent, setNewThreadContent] = useState("")
  const [newThreadImage, setNewThreadImage] = useState<string | null>(null)
  const [newThreadPrice, setNewThreadPrice] = useState("")
  const [expandedPost, setExpandedPost] = useState<string | null>(null)

  const [forumPosts, setForumPosts] = useState<ForumPost[]>([
    {
      id: "1",
      type: "discussion",
      topic: "Keuangan & Bisnis",
      author: "Admin Koperasi",
      authorId: "admin",
      title: "Rapat Anggota Tahunan 2024: Kesempatan Tanya Jawab",
      content:
        "Rapat Anggota Tahunan akan diadakan tanggal 28 Februari 2024. Peserta akan membahas laporan tahunan, pembagian SHU, dan strategi bisnis 2024.",
      timestamp: "2 jam lalu",
      upvotes: 145,
      downvotes: 5,
      isAnnouncement: true,
      image: "/placeholder.jpg",
      comments: [
        {
          id: "c1",
          author: "Budi Santoso",
          authorId: "budi",
          content: "Apakah peserta perlu membawa keluarga?",
          timestamp: "1 jam lalu",
          upvotes: 5,
          downvotes: 0,
          replies: [
            {
              id: "c1r1",
              author: "Admin Koperasi",
              authorId: "admin",
              content: "Keluarga sangat dipersilakan untuk hadir",
              timestamp: "30 menit lalu",
              upvotes: 8,
              downvotes: 0,
            },
          ],
        },
      ],
    },
    {
      id: "2",
      type: "selling",
      topic: "Hasil Tani",
      author: "Roni Hermawan",
      authorId: "roni",
      title: "Panen Cabai Rawit Segar - Harga Grosir Member",
      content:
        "Cabai rawit segar hasil panen hari ini. Kualitas premium, harga grosir untuk member koperasi. Stok terbatas, first come first served.",
      image: "/fresh-red-chili-peppers.jpg",
      price: 45000,
      timestamp: "4 jam lalu",
      upvotes: 89,
      downvotes: 2,
      comments: [
        {
          id: "c2",
          author: "Dewi Kusuma",
          authorId: "dewi",
          content: "Harganya berapa per kg?",
          timestamp: "3 jam lalu",
          upvotes: 12,
          downvotes: 0,
          replies: [
            {
              id: "c2r1",
              author: "Roni Hermawan",
              authorId: "roni",
              content: "Rp 45.000 per kg untuk member, bisa nego untuk pembelian besar",
              timestamp: "2 jam lalu",
              upvotes: 15,
              downvotes: 0,
            },
          ],
        },
      ],
    },
    {
      id: "3",
      type: "discussion",
      topic: "Hasil Tani",
      author: "Wahyu Subagyo",
      authorId: "wahyu",
      title: "Pertanyaan: Pupuk Organik vs Kimia untuk Padi",
      content:
        "Saya baru mulai bertani padi. Banyak yang recommend pupuk organik tapi harganya mahal. Apakah worth it dibanding pupuk kimia biasa?",
      timestamp: "6 jam lalu",
      upvotes: 67,
      downvotes: 1,
      comments: [
        {
          id: "c3",
          author: "Bambang Suryanto",
          authorId: "bambang",
          content: "Pupuk organik lebih bagus untuk jangka panjang, biaya awal tinggi tapi hasil lebih berkualitas",
          timestamp: "5 jam lalu",
          upvotes: 18,
          downvotes: 1,
        },
      ],
    },
    {
      id: "4",
      type: "selling",
      topic: "Kesehatan",
      author: "Dewi Lestari",
      authorId: "dewi",
      title: "Telur Ayam Kampung Organik Tinggi Protein",
      content:
        "Menerima pesanan telur ayam kampung organik. Dipelihara tanpa hormon dan bebas pestisida. Ideal untuk nutrisi keluarga.",
      image: "/organic-farm-eggs.jpg",
      price: 65000,
      timestamp: "8 jam lalu",
      upvotes: 156,
      downvotes: 3,
      comments: [
        {
          id: "c4",
          author: "Rina Wijaya",
          authorId: "rina",
          content: "Lokasi pengiriman ke mana saja?",
          timestamp: "7 jam lalu",
          upvotes: 9,
          downvotes: 0,
        },
      ],
    },
  ])

  const topics = ["Keuangan & Bisnis", "Hasil Tani", "Kesehatan", "Teknologi"]
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>("Semua")
  const filters = ["Semua", "Info Pusat", "Lapak Anggota", "Suara Anggota"]

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    )
  }

  const filteredPosts = forumPosts.filter((post) => {
    if (selectedTopics.length === 0) return true
    return selectedTopics.includes(post.topic)
  })

  const toggleUpvote = (postId: string) => {
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
  }

  const toggleDownvote = (postId: string) => {
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
  }

  const deletePost = (postId: string) => {
    setForumPosts(forumPosts.filter((post) => post.id !== postId))
  }

  const addCommentToPost = (postId: string) => {
    if (commentInput.trim()) {
      setForumPosts(
        forumPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  {
                    id: `c${Date.now()}`,
                    author: "Tubagus Ahmad",
                    authorId: "tubagus",
                    content: commentInput,
                    timestamp: "Sekarang",
                    upvotes: 0,
                    downvotes: 0,
                  },
                ],
              }
            : post,
        ),
      )
      setCommentInput("")
    }
  }

  const createNewThread = () => {
    if (newThreadTitle.trim() && newThreadContent.trim()) {
      const newPost: ForumPost = {
        id: `p${Date.now()}`,
        type: newThreadType,
        topic: "Teknologi",
        author: "Tubagus Ahmad",
        authorId: "tubagus",
        title: newThreadTitle,
        content: newThreadContent,
        image: newThreadImage || undefined,
        price: newThreadType === "selling" ? Number(newThreadPrice) : undefined,
        timestamp: "Sekarang",
        upvotes: 0,
        downvotes: 0,
        comments: [],
      }
      setForumPosts([newPost, ...forumPosts])
      setNewThreadTitle("")
      setNewThreadContent("")
      setNewThreadImage(null)
      setNewThreadPrice("")
      setNewThreadType("discussion")
      setShowNewThread(false)
    }
  }

  const toggleCommentUpvote = (postId: string, commentId: string) => {
    setForumPosts(
      forumPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((c) =>
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

  const toggleLike = (postId: string) => {
    // Placeholder for toggleLike functionality
  }

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
    addCommentToPost(postId)
  }

  return (
    <div className="w-full">
      <FloatingMessageButton onChatSelect={onChatSelect} />

      {/* Forum Content */}
      <div className="px-4 md:px-6 max-w-6xl mx-auto space-y-6">
        {/* Pinned Carousel Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-sm font-semibold text-slate-600">PINNED</h3>
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

          <div className="h-48 rounded-lg overflow-hidden shadow-md transition-all">
            <div className="relative w-full h-full">
              <img 
                src={carouselItems[carouselIndex].image || "/placeholder.svg"} 
                alt={carouselItems[carouselIndex].title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${carouselItems[carouselIndex].color} opacity-70`} />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <h4 className="font-bold text-xl mb-2">{carouselItems[carouselIndex].title}</h4>
                <p className="text-sm line-clamp-2">{carouselItems[carouselIndex].content}</p>
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
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
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
                className="flex-1 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Buat
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
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                      {post.author.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-slate-900">{post.author}</h4>
                        <Badge className="bg-blue-100 text-primary text-xs">{post.topic}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{post.timestamp}</p>
                    </div>
                    {userRole === "admin" && (
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-slate-400 hover:text-red-500 transition p-1"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
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
                      {post.comments.length}
                    </button>
                  </div>
                  {post.type === "selling" && (
                    <button
                      onClick={() => onChatSelect?.(post.authorId)}
                      className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat Penjual
                    </button>
                  )}
                </div>

                {/* Comments Section - Quora Style */}
                {showComments === post.id && (
                  <div className="px-4 py-4 bg-slate-50 border-t border-slate-200 space-y-4">
                    {/* Comments List */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="space-y-2">
                          {/* Main Comment */}
                          <div className="bg-white rounded p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                                {comment.author.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{comment.author}</p>
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
                              <button className="text-xs text-slate-500 hover:text-slate-700 transition">Balas</button>
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
                                  <p className="text-xs text-slate-700">{reply.content}</p>
                                  <div className="flex items-center gap-4 pt-2">
                                    <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition">
                                      <ThumbsUp className="w-3 h-3" />
                                      {reply.upvotes}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Comment Input */}
                    <div className="flex gap-2 pt-2 border-t border-slate-200">
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}
