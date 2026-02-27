"use client"

import { useState, useEffect } from "react"
import { Search, ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { getArticlesWithAuthorData, getAllArticleTags } from "@/lib/firebase"

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
  createdAt: any
  excerpt?: string
}

interface ArticlesDiscoverySectionProps {
  onArticleClick?: (article: Article) => void
}

export default function ArticlesDiscoverySection({ onArticleClick }: ArticlesDiscoverySectionProps) {
  const router = useRouter()
  const [articles, setArticles] = useState<any[]>([])
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [tags, setTags] = useState<string[]>([])
  
  // States for filtering
  const [activeCategory, setActiveCategory] = useState<string>("Semua Kategori")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const articlesData = await getArticlesWithAuthorData(20)
        setAllArticles(articlesData)
        setArticles(articlesData)

        const tagsData = await getAllArticleTags()
        // Gabungkan dengan default tag jika tag dari DB masih kosong/sedikit
        const defaultTags = ["Keuangan", "Pertanian", "Peternakan", "Teknologi", "Berita"]
        const combinedTags = tagsData.length > 0 ? Array.from(new Set([...defaultTags, ...tagsData])) : defaultTags
        setTags(combinedTags)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Efek untuk memfilter artikel setiap kali state pencarian/kategori/sort berubah
  useEffect(() => {
    let result = [...allArticles]

    // 1. Filter Kategori
    if (activeCategory !== "Semua Kategori") {
      result = result.filter((a) => a.tags?.includes(activeCategory))
    }

    // 2. Filter Pencarian
    if (searchTerm.trim() !== "") {
      const lowerQuery = searchTerm.toLowerCase()
      result = result.filter(
        (a) =>
          a.title?.toLowerCase().includes(lowerQuery) ||
          a.description?.toLowerCase().includes(lowerQuery) ||
          a.author?.toLowerCase().includes(lowerQuery)
      )
    }

    // 3. Sorting
    if (sortBy === "oldest") {
      result.reverse() // Asumsi awal sudah 'newest' dari DB
    } else if (sortBy === "popular") {
      result.sort((a, b) => (b.views || 0) - (a.views || 0))
    }

    setArticles(result)
  }, [activeCategory, searchTerm, sortBy, allArticles])

  const featuredArticle = articles.length > 0 ? articles[0] : null
  const gridArticles = articles.length > 1 ? articles.slice(1) : []

  return (
    <div className="min-h-screen bg-[#f9f8f5] text-slate-900 font-sans pb-20">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-6">
        
        {/* Navigation Button */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6 text-sm font-medium w-fit"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Kembali ke Beranda
        </button>

        {/* Hero Section */}
        <div className="py-8 sm:py-12 text-center md:text-left">
          <span className="inline-block text-xs font-semibold text-primary tracking-widest uppercase mb-4">
            Baca & Pelajari
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Jelajahi Artikel <br className="hidden md:block"/> Koperasi
          </h1>
          <p className="text-slate-500 text-base max-w-md mx-auto md:mx-0">
            Temukan panduan, berita terbaru, dan wawasan mendalam dari komunitas untuk mengembangkan usaha Anda.
          </p>
        </div>

        {/* Body Grid Layout (Sidebar + Main Content) */}
        <div className="flex flex-col lg:grid lg:grid-cols-[240px_1fr] gap-10 items-start">
          
          {/* SIDEBAR */}
          <aside className="w-full lg:sticky lg:top-8 space-y-8">
            
            {/* Search */}
            <div>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-3 display-block">
                Pencarian
              </span>
              <div className="flex items-center gap-2 bg-white border-2 border-[#e8e5de] rounded-xl px-4 py-2.5 transition-colors focus-within:border-primary">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cari artikel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Filter Sort */}
            <div>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-3 display-block">
                Urutkan
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white border-2 border-[#e8e5de] rounded-xl px-4 py-3 text-sm text-slate-600 outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="popular">Terpopuler</option>
              </select>
            </div>

            {/* Categories */}
            <div>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-3 display-block">
                Kategori
              </span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setActiveCategory("Semua Kategori")}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    activeCategory === "Semua Kategori"
                      ? "bg-[#ede9ff] text-primary font-semibold"
                      : "text-slate-600 hover:bg-[#f0eeff] hover:text-primary"
                  }`}
                >
                  Semua Kategori
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveCategory(tag)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeCategory === tag
                        ? "bg-[#ede9ff] text-primary font-semibold"
                        : "text-slate-600 hover:bg-[#f0eeff] hover:text-primary"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT (ARTICLES) */}
          <main className="w-full space-y-8">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[#e8e5de]">
                <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-600 font-semibold text-lg">Tidak ada artikel</p>
                <p className="text-slate-400 text-sm mt-1">Coba gunakan kata kunci atau kategori lain.</p>
              </div>
            ) : (
              <>
                {/* 1. FEATURED ARTICLE (Top) */}
                {featuredArticle && (
                  <div
                    onClick={() => onArticleClick?.(featuredArticle)}
                    className="group flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden border-2 border-[#e8e5de] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="w-full md:w-[45%] h-[250px] md:h-[340px] bg-slate-100 overflow-hidden relative">
                      {featuredArticle.coverImage ? (
                        <img 
                          src={featuredArticle.coverImage} 
                          alt={featuredArticle.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#c8a97e] to-[#8b6b4a]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-block px-3 py-1 bg-[#fff8e1] text-[#e6a800] text-[10px] font-bold uppercase tracking-wider rounded-full">
                          Utama
                        </span>
                        <span className="inline-block px-3 py-1 bg-[#f0eeff] text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                          {featuredArticle.tags?.[0] || "Umum"}
                        </span>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-primary transition-colors">
                        {featuredArticle.title}
                      </h3>
                      
                      <p className="text-slate-500 text-sm md:text-base mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed">
                        {featuredArticle.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-sm overflow-hidden border border-slate-200">
                            {featuredArticle.authorAvatar ? (
                              <img src={featuredArticle.authorAvatar} alt="Author" className="w-full h-full object-cover"/>
                            ) : (
                              featuredArticle.author?.charAt(0).toUpperCase() || "A"
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-900">{featuredArticle.author || "Penulis"}</p>
                            <p className="text-xs text-slate-500">5 min read</p>
                          </div>
                        </div>

                        <div className="w-10 h-10 rounded-full border-2 border-[#e8e5de] flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
                          <ArrowUpRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. GRID ARTICLES (Bottom) */}
                {gridArticles.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {gridArticles.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => onArticleClick?.(article)}
                        className="group flex flex-col bg-white rounded-3xl overflow-hidden border-2 border-[#e8e5de] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      >
                        {/* Thumbnail */}
                        <div className="w-full h-[200px] overflow-hidden relative bg-slate-100">
                          {article.coverImage ? (
                            <img 
                              src={article.coverImage} 
                              alt={article.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#a8d8a8] to-[#558b55]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-[#f0eeff] text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                              {article.tags?.[0] || "Umum"}
                            </span>
                          </div>

                          <h4 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                          
                          <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                            {article.description}
                          </p>

                          {/* Spacer to push footer down */}
                          <div className="flex-1" />

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-xs overflow-hidden border border-slate-200">
                                {article.authorAvatar ? (
                                  <img src={article.authorAvatar} alt="Author" className="w-full h-full object-cover"/>
                                ) : (
                                  article.author?.charAt(0).toUpperCase() || "A"
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-xs text-slate-900">{article.author || "Penulis"}</p>
                                <p className="text-[11px] text-slate-500">5 min read</p>
                              </div>
                            </div>

                            <div className="w-8 h-8 rounded-full border-2 border-[#e8e5de] flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
                              <ArrowUpRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}