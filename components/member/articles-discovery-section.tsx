"use client"

import { useState, useEffect } from "react"
import { Search, Heart, Eye, Tag, BookOpen, X } from "lucide-react"
import { getArticlesWithAuthorData, getAllArticleTags, getArticlesByTag } from "@/lib/firebase"

interface Article {
  id: string
  title: string
  description: string
  tags?: string[]
  author: string
  authorId: string
  authorAvatar?: string
  views: number
  likes: number
  coverImage?: string
  createdAt: Date
  excerpt?: string
}

interface ArticlesDiscoverySectionProps {
  onArticleClick?: (article: Article) => void
}

export default function ArticlesDiscoverySection({ onArticleClick }: ArticlesDiscoverySectionProps) {
  const [articles, setArticles] = useState<any[]>([])
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const articlesData = await getArticlesWithAuthorData(20)
        setAllArticles(articlesData)
        setArticles(articlesData)

        const tagsData = await getAllArticleTags()
        setTags(tagsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleTagClick = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]

    setSelectedTags(newSelectedTags)

    if (newSelectedTags.length === 0) {
      setArticles(allArticles)
    } else {
      const filtered = allArticles.filter((article) =>
        newSelectedTags.some((t) => (article.tags || []).includes(t)),
      )
      setArticles(filtered)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const searchResults = allArticles.filter((article) => {
      const matchesSearch =
        article.title?.toLowerCase().includes(term.toLowerCase()) ||
        article.description?.toLowerCase().includes(term.toLowerCase()) ||
        article.author?.toLowerCase().includes(term.toLowerCase())

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => (article.tags || []).includes(tag))

      return matchesSearch && matchesTags
    })

    setArticles(searchResults)
  }

  const defaultTags = ["Keuangan & Bisnis", "Hasil Tani", "Kesehatan", "Teknologi", "Berita", "Tips & Trik"]
  const displayedArticles = isExpanded ? articles : articles.slice(0, 4)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Jelajahi Artikel</h3>
          <p className="text-sm text-slate-500">Temukan artikel menarik dari komunitas koperasi</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari judul, penulis, atau deskripsi..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 text-slate-900"
        />
      </div>

      {/* Category Tags */}
      <div>
        <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Kategori
        </h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {defaultTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-4 py-2 rounded-full font-semibold transition whitespace-nowrap text-sm ${
                selectedTags.includes(tag)
                  ? "bg-primary text-white"
                  : "bg-white text-primary border-2 border-primary hover:bg-blue-50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {selectedTags.length > 0 && (
        <div className="p-3 bg-blue-100 rounded-lg">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-primary">Filter aktif:</span>
            {selectedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1 bg-white text-primary rounded-full text-sm font-semibold hover:bg-slate-100 transition flex items-center gap-1"
              >
                {tag}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : displayedArticles.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Tidak ada artikel ditemukan</p>
          <p className="text-slate-500 text-sm">Coba ubah filter atau pencarian Anda</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => onArticleClick?.(article)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden text-left border border-slate-200"
              >
                {/* Article Image */}
                {article.coverImage && (
                  <div className="h-32 bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center overflow-hidden">
                    <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Article Content */}
                <div className="p-4">
                  {/* Category Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {article.tags.slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-primary rounded text-xs font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h4 className="font-bold text-sm text-slate-900 mb-1 line-clamp-2">{article.title}</h4>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">{article.description}</p>

                  {/* Author Info */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {article.author?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-900 truncate">{article.author || "Penulis"}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Eye className="w-3 h-3" />
                      <span>{article.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Heart className="w-3 h-3" />
                      <span>{article.likes || 0}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Expand Button */}
          {articles.length > 4 && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm"
              >
                {isExpanded ? "Sembunyikan" : "Lihat Semua Artikel"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
