"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Eye, BookOpen } from "lucide-react"
import { getArticlesWithAuthorData } from "@/lib/firebase"

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

interface ArticlesSectionProps {
  onArticleClick?: (article: Article) => void
}

export default function ArticlesSection({ onArticleClick }: ArticlesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  const dummyArticles: Article[] = [
    {
      id: "dummy-1",
      title: "Tips Berkebun Organik di Rumah",
      description: "Panduan lengkap untuk pemula yang ingin memulai berkebun organik dengan lahan terbatas.",
      tags: ["Pertanian"],
      author: "Tubagus Ahmad",
      authorId: "tubagus-dummy",
      views: 2450,
      likes: 145,
      coverImage: "https://images.unsplash.com/photo-1592424001801-085fb0b04323?q=80&w=600&auto=format&fit=crop",
      excerpt: "Panduan lengkap untuk pemula yang ingin memulai berkebun organik...",
      createdAt: new Date(),
    },
    {
      id: "dummy-2",
      title: "Panduan Bisnis E-Commerce untuk UMKM",
      description: "Strategi memulai bisnis online dari nol dengan modal minimal dan untung maksimal.",
      tags: ["Keuangan"],
      author: "Dewi Lestari",
      authorId: "dewi-dummy",
      views: 1820,
      likes: 92,
      coverImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=600&auto=format&fit=crop",
      excerpt: "Strategi memulai bisnis online dari nol dengan modal minimal...",
      createdAt: new Date(),
    },
    {
      id: "dummy-3",
      title: "Kesehatan Mental di Era Digital",
      description: "Cara menjaga kesehatan mental saat bekerja online dan menghindari burnout.",
      tags: ["Kesehatan"],
      author: "Wahyu Subagyo",
      authorId: "wahyu-dummy",
      views: 3180,
      likes: 215,
      coverImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop",
      excerpt: "Cara menjaga kesehatan mental saat bekerja online...",
      createdAt: new Date(),
    },
    {
      id: "dummy-4",
      title: "Teknologi AI untuk Pertanian Masa Depan",
      description: "Bagaimana teknologi AI mengubah industri pertanian dan meningkatkan hasil panen.",
      tags: ["Teknologi"],
      author: "Roni Hermawan",
      authorId: "roni-dummy",
      views: 1245,
      likes: 68,
      coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop",
      excerpt: "Bagaimana teknologi AI mengubah industri pertanian...",
      createdAt: new Date(),
    },
  ]

  const [articles, setArticles] = useState<Article[]>(dummyArticles)

  // Fetch articles from Firebase on mount
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true)
      try {
        const dbArticles = await getArticlesWithAuthorData(8)
        // Gabungkan Firebase articles dengan dummy articles jika data dari DB sedikit
        const combinedArticles = dbArticles.length > 0 ? [...dbArticles, ...dummyArticles] : dummyArticles
        
        // Buang duplikat berdasarkan ID jika ada
        const uniqueArticles = Array.from(new Map(combinedArticles.map(item => [item.id, item])).values())
        setArticles(uniqueArticles)
      } catch (error) {
        console.error("Error fetching articles:", error)
        setArticles(dummyArticles)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [])

  // Fungsi scroll yang lebih aman menggunakan useRef React
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = 320 // Sesuaikan dengan lebar card
    
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    })
  }

  return (
    <div className="space-y-4">
      {/* Header & Navigation */}
      <div className="flex items-end sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Wawasan & Berita</h3>
          <p className="text-sm text-slate-500 mt-1">Artikel terbaru dari komunitas koperasi</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-primary transition-colors disabled:opacity-50 shadow-sm"
            aria-label="Scroll left"
            disabled={isLoading}
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-primary transition-colors disabled:opacity-50 shadow-sm"
            aria-label="Scroll right"
            disabled={isLoading}
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Articles Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 pt-2"
        style={{ 
          scrollbarWidth: 'none', // Untuk Firefox
          msOverflowStyle: 'none' // Untuk IE/Edge
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          #articles-carousel::-webkit-scrollbar { display: none; }
        `}} />

        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[280px] sm:w-[320px] h-[320px] bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
          ))
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              onClick={() => onArticleClick?.(article)}
              className="group snap-start flex-shrink-0 w-[280px] sm:w-[320px] bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Cover Image */}
              <div className="h-44 bg-slate-100 overflow-hidden relative">
                {article.coverImage ? (
                  <img 
                    src={article.coverImage} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Category Pill */}
                <div className="mb-3">
                  <span className="inline-block px-2.5 py-1 bg-blue-50 text-primary text-[10px] font-bold uppercase tracking-wider rounded-md">
                    {article.tags?.[0] || "Umum"}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-bold text-base sm:text-lg text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {article.title}
                </h4>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mb-4">
                  {article.description || article.excerpt}
                </p>

                {/* Spacer to push footer to bottom */}
                <div className="flex-1" />

                {/* Footer (Author & Stats) */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-[10px] overflow-hidden">
                      {article.authorAvatar ? (
                        <img src={article.authorAvatar} alt={article.author} className="w-full h-full object-cover"/>
                      ) : (
                        article.author?.charAt(0).toUpperCase() || "A"
                      )}
                    </div>
                    <p className="font-semibold text-xs text-slate-700 truncate max-w-[100px] sm:max-w-[120px]">
                      {article.author}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="font-medium">{article.views || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}