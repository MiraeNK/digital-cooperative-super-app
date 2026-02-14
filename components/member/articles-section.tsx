"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Eye, Share2 } from "lucide-react"
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
  createdAt: Date
  excerpt?: string
}

interface ArticlesSectionProps {
  onArticleClick?: (article: Article) => void
}

export default function ArticlesSection({ onArticleClick }: ArticlesSectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const dummyArticles: Article[] = [
    {
      id: "dummy-1",
      title: "Tips Berkebun Organik di Rumah",
      description: "Panduan lengkap untuk pemula yang ingin memulai berkebun organik...",
      tags: ["Hasil Tani", "Tips"],
      author: "Tubagus Ahmad",
      authorId: "tubagus-dummy",
      views: 2450,
      likes: 145,
      coverImage: "/placeholder.jpg",
      excerpt: "Panduan lengkap untuk pemula yang ingin memulai berkebun organik...",
      createdAt: new Date(),
    },
    {
      id: "dummy-2",
      title: "Panduan Bisnis E-Commerce untuk UMKM",
      description: "Strategi memulai bisnis online dari nol dengan modal minimal...",
      tags: ["Keuangan & Bisnis", "Tips"],
      author: "Dewi Lestari",
      authorId: "dewi-dummy",
      views: 1820,
      likes: 92,
      coverImage: "/placeholder.jpg",
      excerpt: "Strategi memulai bisnis online dari nol dengan modal minimal...",
      createdAt: new Date(),
    },
    {
      id: "dummy-3",
      title: "Kesehatan Mental di Era Digital",
      description: "Cara menjaga kesehatan mental saat bekerja online...",
      tags: ["Kesehatan"],
      author: "Wahyu Subagyo",
      authorId: "wahyu-dummy",
      views: 3180,
      likes: 215,
      coverImage: "/placeholder.jpg",
      excerpt: "Cara menjaga kesehatan mental saat bekerja online...",
      createdAt: new Date(),
    },
    {
      id: "dummy-4",
      title: "Teknologi AI untuk Pertanian Masa Depan",
      description: "Bagaimana teknologi AI mengubah industri pertanian...",
      tags: ["Teknologi", "Inovasi"],
      author: "Roni Hermawan",
      authorId: "roni-dummy",
      views: 1245,
      likes: 68,
      coverImage: "/placeholder.jpg",
      excerpt: "Bagaimana teknologi AI mengubah industri pertanian...",
      createdAt: new Date(),
    },
  ]

  const [articles, setArticles] = useState<Article[]>(dummyArticles)

  // Fetch articles from Firebase on mount with author data
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true)
      try {
        const dbArticles = await getArticlesWithAuthorData(8)
        // Combine Firebase articles dengan dummy articles
        const combinedArticles = [...dbArticles, ...dummyArticles]
        setArticles(combinedArticles)
      } catch (error) {
        console.error("Error fetching articles:", error)
        setArticles(dummyArticles)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("articles-carousel")
    if (!container) return

    const scrollAmount = 300
    if (direction === "left") {
      container.scrollLeft -= scrollAmount
      setScrollPosition(container.scrollLeft - scrollAmount)
    } else {
      container.scrollLeft += scrollAmount
      setScrollPosition(container.scrollLeft + scrollAmount)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Wawasan & Berita</h3>
          <p className="text-sm text-slate-500">Artikel terbaru dari komunitas koperasi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Scroll left"
            disabled={isLoading}
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Scroll right"
            disabled={isLoading}
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Articles Carousel */}
      <div
        id="articles-carousel"
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
        style={{ scrollBehavior: "smooth" }}
      >
        {articles.map((article) => (
          <button
            key={article.id}
            onClick={() => onArticleClick?.(article)}
            className="flex-shrink-0 w-80 bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition active:scale-95"
          >
            {/* Cover Image */}
            <div className="h-40 bg-slate-200 overflow-hidden relative">
              <img src={article.coverImage || "/placeholder.jpg"} alt={article.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {article.tags && article.tags.length > 0 && (
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                      {article.tags[0]}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-slate-900 text-sm line-clamp-2">{article.title}</h4>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">{article.description || article.excerpt}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">{article.author}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {article.views || 0}
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
