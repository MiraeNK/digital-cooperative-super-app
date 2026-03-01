"use client"

import { useState, useEffect } from "react"
import { Search, ArrowLeft, ArrowUpRight, BookOpen, Eye, Heart, SlidersHorizontal, ChevronDown } from "lucide-react"
import { getArticlesWithAuthorData, getAllArticleTags } from "@/lib/firebase"

// ─── Gradient palettes untuk placeholder thumbnail ───────────────────────────
const GRADIENTS = [
  "linear-gradient(135deg,#c8a97e,#8b6b4a)",
  "linear-gradient(135deg,#a8d8a8,#2d6a4f)",
  "linear-gradient(135deg,#b8c8e8,#1d4e89)",
  "linear-gradient(135deg,#e8c8a8,#c08060)",
  "linear-gradient(135deg,#d8a8e8,#7b4fa5)",
  "linear-gradient(135deg,#f0e8c0,#c8a020)",
  "linear-gradient(135deg,#c0e8e8,#1a7a8a)",
  "linear-gradient(135deg,#e8a8b8,#a03060)",
]

// ─── Types ────────────────────────────────────────────────────────────────────
interface Article {
  id: string
  title: string
  description?: string
  content?: string
  excerpt?: string
  tags?: string[]
  author: string
  authorId?: string
  authorAvatar?: string
  views?: number
  likes?: number
  coverImage?: string
  createdAt?: any
}

interface ArticlesDiscoverySectionProps {
  onArticleClick?: (article: Article) => void
  onBack?: () => void
}

// ─── DUMMY DATA (fallback kalau Firebase kosong) ───────────────────────────────
const DUMMY_ARTICLES: Article[] = [
  // Fallback articles with full content body for preview/testing.
  {
    id: "d1",
    title: "Cara Cerdas Mengembangkan Usaha Tani dengan Modal Koperasi",
    description: "Panduan lengkap memanfaatkan fasilitas pinjaman koperasi untuk meningkatkan hasil pertanian dan pendapatan keluarga.",
    content: "## Memulai dengan Modal Koperasi\nGunakan modal bertahap agar arus kas tetap aman.\n\n### Langkah Dasar\n- Susun rencana kebutuhan\n- Hitung biaya operasional\n- Review hasil tiap siklus panen\n\n:::quote theme=amber font=serif\nPertumbuhan yang sehat datang dari disiplin pencatatan.\n:::\n\n:::block theme=blue font=sans title=\"Catatan\"\nPisahkan dana produksi dan dana darurat agar usaha tetap stabil saat harga pasar turun.\n:::",
    tags: ["Pertanian"],
    author: "Tubagus Ahmad",
    views: 3240,
    likes: 210,
    coverImage: "",
  },
  {
    id: "d2",
    title: "Strategi UMKM Go Digital: Dari Pasar Tradisional ke Marketplace",
    description: "Transformasi usaha kecil menengah ke platform digital terbukti meningkatkan omzet hingga 3x lipat dalam 6 bulan.",
    content: "## UMKM Go Digital\nMarketplace membantu memperluas jangkauan tanpa membuka toko baru.\n\n### Checklist\n- Foto produk konsisten\n- Deskripsi jelas\n- Respon chat cepat\n\n:::quote theme=purple font=serif\nKecepatan respon sering lebih menentukan daripada harga.\n:::\n\n:::block theme=green font=sans title=\"Workflow\"\nTetapkan jam operasional admin agar pelanggan mendapat pengalaman layanan yang konsisten.\n:::",
    tags: ["Keuangan & Bisnis"],
    author: "Dewi Lestari",
    views: 2180,
    likes: 145,
    coverImage: "",
  },
  {
    id: "d3",
    title: "Kesehatan Jiwa Petani: Mengelola Tekanan Musim Panen",
    description: "Bagaimana komunitas koperasi bisa saling mendukung kesehatan mental antar anggota di tengah tantangan agraris.",
    content: "## Kesehatan Mental\nTekanan target panen perlu diimbangi manajemen istirahat.\n\n### Praktik Harian\n- Istirahat terjadwal\n- Komunikasi terbuka\n- Rotasi beban kerja\n\n:::quote theme=blue font=serif\nTim yang sehat secara mental cenderung lebih produktif dan minim konflik.\n:::\n\n:::block theme=slate font=sans title=\"Pengingat\"\nJadikan pertemuan mingguan sebagai ruang evaluasi teknis dan emosional.\n:::",
    tags: ["Kesehatan"],
    author: "dr. Wahyu Subagyo",
    views: 1870,
    likes: 98,
    coverImage: "",
  },
  {
    id: "d4",
    title: "IoT & Sensor Tanah: Teknologi Murah untuk Panen Maksimal",
    description: "Alat sensor tanah berbasis IoT kini bisa diakses UMKM dengan harga terjangkau dan hasil yang luar biasa.",
    content: "## IoT Pertanian\nSensor membantu keputusan pemupukan berbasis data.\n\n### Dampak\n- Efisiensi air meningkat\n- Pemupukan tepat waktu\n- Risiko gagal panen menurun\n\n:::quote theme=green font=serif\nData kecil yang konsisten sering lebih berguna daripada asumsi besar.\n:::\n\n:::block theme=amber font=mono title=\"Implementasi\"\nMulai dari satu petak uji coba sebelum ekspansi ke seluruh lahan.\n:::",
    tags: ["Teknologi"],
    author: "Roni Hermawan",
    views: 1540,
    likes: 88,
    coverImage: "",
  },
  {
    id: "d5",
    title: "Hasil Ternak Sapi Potong: Menghitung Untung Bersih yang Realistis",
    description: "Analisis biaya produksi dan proyeksi keuntungan beternak sapi potong skala rumahan dengan dukungan koperasi.",
    content: "## Sapi Potong Rumahan\nSkala kecil tetap bisa untung jika biaya pakan terkontrol.\n\n### Fokus\n- Konversi pakan\n- Jadwal vaksin\n- Kualitas kandang\n\n:::quote theme=blue font=serif\nMargin usaha ternak ditentukan oleh disiplin biaya harian.\n:::\n\n:::block theme=slate font=sans title=\"Kontrol\"\nGunakan catatan berat mingguan untuk memantau pertumbuhan secara objektif.\n:::",
    tags: ["Peternakan"],
    author: "Hendra Wijaya",
    views: 2650,
    likes: 175,
    coverImage: "",
  },
  {
    id: "d6",
    title: "Raih Sertifikasi Halal UMKM: Langkah Demi Langkah",
    description: "Panduan praktis mengurus sertifikasi halal produk UMKM agar bisa menembus pasar modern dan ekspor.",
    content: "## Sertifikasi Halal UMKM\nDokumen rapi mempercepat proses verifikasi.\n\n### Dokumen Wajib\n- Data bahan baku\n- Proses produksi\n- SOP kebersihan\n\n:::quote theme=purple font=serif\nDokumentasi yang baik memperkecil revisi berulang.\n:::\n\n:::block theme=green font=sans title=\"Tips\"\nBuat template dokumen standar agar proses sertifikasi produk berikutnya lebih cepat.\n:::",
    tags: ["Keuangan & Bisnis"],
    author: "Siti Rahayu",
    views: 1920,
    likes: 134,
    coverImage: "",
  },
  {
    id: "d7",
    title: "Tips Menjaga Kualitas Beras Organik Selama Penyimpanan",
    description: "Teknik penyimpanan pasca panen yang benar untuk mempertahankan kualitas dan nilai jual beras organik.",
    content: "## Penyimpanan Beras Organik\nSuhu dan kelembapan adalah faktor paling kritis.\n\n### Standar Dasar\n- Ventilasi gudang baik\n- Rotasi stok FIFO\n- Pemeriksaan kualitas berkala\n\n:::quote theme=amber font=serif\nKualitas pasca panen menentukan harga jual akhir.\n:::\n\n:::block theme=blue font=sans title=\"Checklist\"\nGunakan label batch agar traceability produk tetap terjaga.\n:::",
    tags: ["Pertanian"],
    author: "Agus Santoso",
    views: 1340,
    likes: 72,
    coverImage: "",
  },
]

const DEFAULT_CATEGORIES = [
  "Semua Kategori",
  "Keuangan & Bisnis",
  "Pertanian",
  "Peternakan",
  "Kesehatan",
  "Teknologi",
  "Berita",
  "Tips & Trik",
]

// ─── Helper: hitung read time ────────────────────────────────────────────────
function readTime(text?: string) {
  if (!text) return "5 min baca"
  const words = text.split(" ").length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min baca`
}

function toPreviewText(raw?: string) {
  if (!raw) return ""
  return raw
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/<[!/a-zA-Z][^\s>]*/g, " ")
    .replace(/!\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/<u>(.*?)<\/u>/gi, "$1")
    .replace(/:::[\s\S]*?:::/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function getPreviewText(article: Article) {
  return toPreviewText(article.description || article.excerpt || article.content || "")
}

// ─── Helper: ambil inisial ───────────────────────────────────────────────────
function initials(name?: string) {
  if (!name) return "A"
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ArticlesDiscoverySection({
  onArticleClick,
  onBack,
}: ArticlesDiscoverySectionProps) {
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [activeCategory, setActiveCategory] = useState("Semua Kategori")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  // ── Fetch data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const dbArticles = await getArticlesWithAuthorData(30)
        const dbTags = await getAllArticleTags()

        const merged =
          dbArticles.length > 0
            ? [
                ...dbArticles,
                ...DUMMY_ARTICLES.filter((d) => !dbArticles.find((a: Article) => a.id === d.id)),
              ]
            : DUMMY_ARTICLES

        setAllArticles(merged)
        setArticles(merged)

        if (dbTags.length > 0) {
          const combined = Array.from(
            new Set(["Semua Kategori", ...DEFAULT_CATEGORIES.slice(1), ...dbTags])
          )
          setCategories(combined)
        }
      } catch {
        setAllArticles(DUMMY_ARTICLES)
        setArticles(DUMMY_ARTICLES)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  useEffect(() => {
    let result = [...allArticles]

    if (activeCategory !== "Semua Kategori") {
      result = result.filter((a) => a.tags?.includes(activeCategory))
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.author?.toLowerCase().includes(q)
      )
    }

    if (sortBy === "oldest") result.reverse()
    else if (sortBy === "popular") result.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    else if (sortBy === "newest") result.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0
      const tb = b.createdAt?.toMillis?.() ?? 0
      return tb - ta
    })

    setArticles(result)
  }, [activeCategory, searchTerm, sortBy, allArticles])

  const featuredArticle = articles[0] ?? null
  const gridArticles = articles.slice(1)

  // ── Gradient for placeholder ───────────────────────────────────────────────
  const getGradient = (id: string) => {
    const index = Math.abs(id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % GRADIENTS.length
    return GRADIENTS[index]
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "#f9f8f5", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');

        .fraunces { font-family: 'Fraunces', serif; }

        .article-card {
          transition: box-shadow 0.22s ease, transform 0.22s ease;
        }
        .article-card:hover {
          box-shadow: 0 12px 32px rgba(0,0,0,0.09);
          transform: translateY(-2px);
        }

        .featured-card {
          transition: box-shadow 0.22s ease, transform 0.22s ease;
        }
        .featured-card:hover {
          box-shadow: 0 16px 40px rgba(0,0,0,0.09);
          transform: translateY(-2px);
        }

        .link-btn {
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .link-btn:hover {
          background: hsl(var(--primary));
          border-color: hsl(var(--primary));
          color: #fff;
        }

        .cat-btn {
          transition: background 0.15s, color 0.15s;
          text-align: left;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .cat-btn:hover {
          background: #ede9ff;
          color: #5b4fcf;
        }
        .cat-btn.active {
          background: #ede9ff;
          color: #5b4fcf;
          font-weight: 600;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s ease both; }
        .fade-up-1 { animation: fadeUp 0.45s 0.05s ease both; }
        .fade-up-2 { animation: fadeUp 0.45s 0.10s ease both; }
        .fade-up-3 { animation: fadeUp 0.45s 0.15s ease both; }
        .fade-up-4 { animation: fadeUp 0.45s 0.20s ease both; }
        .fade-up-5 { animation: fadeUp 0.45s 0.25s ease both; }

        .search-box:focus-within {
          border-color: hsl(var(--primary)) !important;
        }
        .sort-select:focus {
          border-color: hsl(var(--primary)) !important;
          outline: none;
        }
        .thumb-img {
          transition: transform 0.6s ease;
        }
        .article-card:hover .thumb-img,
        .featured-card:hover .thumb-img {
          transform: scale(1.05);
        }
        .img-wrapper { overflow: hidden; }
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* ── NAVIGATION BUTTON (Back to Home) ── */}
        <div style={{ paddingTop: 28, marginBottom: 8 }}>
          <button
            onClick={onBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              border: "1.5px solid #e8e5de",
              borderRadius: 40,
              padding: "8px 18px 8px 12px",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: "#555",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              transition: "box-shadow 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "hsl(var(--primary))"
              e.currentTarget.style.color = "hsl(var(--primary))"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e8e5de"
              e.currentTarget.style.color = "#555"
            }}
          >
            <span style={{
              width: 26, height: 26,
              borderRadius: "50%",
              background: "#f0eeff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ArrowLeft size={14} style={{ color: "hsl(var(--primary))" }} />
            </span>
            Kembali ke Beranda
          </button>
        </div>

        {/* ── HERO ── */}
        <div style={{ padding: "48px 0 40px", textAlign: "center" }}>
          <span style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 600,
            color: "hsl(var(--primary))",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}>
            Baca & Pelajari
          </span>
          <h1
            className="fraunces"
            style={{
              fontSize: "clamp(36px, 5vw, 62px)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#111",
              marginBottom: 14,
            }}
          >
            Jelajahi Artikel Koperasi
          </h1>
          <p style={{ fontSize: 16, color: "#888", maxWidth: 420, margin: "0 auto" }}>
            Panduan, berita, dan wawasan dari komunitas untuk mengembangkan usaha bersama.
          </p>
        </div>

        {/* ── MOBILE FILTER TOGGLE ── */}
        <div style={{ marginBottom: 16 }} className="lg:hidden">
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#fff", border: "1.5px solid #e8e5de",
              borderRadius: 10, padding: "10px 16px",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, color: "#555", width: "100%",
              justifyContent: "space-between",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SlidersHorizontal size={16} />
              Filter & Kategori
            </span>
            <ChevronDown
              size={16}
              style={{
                transform: showMobileFilter ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>
        </div>

        {/* ── BODY GRID ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            gap: 40,
            alignItems: "start",
          }}
          className="!grid-cols-1 lg:!grid-cols-[240px_1fr]"
        >
          {/* ── SIDEBAR ── */}
          <aside
            style={{ position: "sticky", top: 24 }}
            className={`${showMobileFilter ? "block" : "hidden"} lg:block`}
          >
            {/* Search */}
            <div style={{ marginBottom: 28 }}>
              <span style={{
                display: "block", fontSize: 11, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#aaa", marginBottom: 10,
              }}>
                Pencarian
              </span>
              <div
                className="search-box"
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#fff", border: "1.5px solid #e8e5de",
                  borderRadius: 10, padding: "10px 14px",
                }}
              >
                <Search size={16} style={{ color: "#aaa", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Cari artikel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: "none", outline: "none",
                    background: "transparent",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14, width: "100%", color: "#111",
                  }}
                />
              </div>
            </div>

            {/* Sort */}
            <div style={{ marginBottom: 28 }}>
              <span style={{
                display: "block", fontSize: 11, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#aaa", marginBottom: 10,
              }}>
                Urutkan
              </span>
              <div style={{ position: "relative" }}>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: "100%", background: "#fff",
                    border: "1.5px solid #e8e5de",
                    borderRadius: 10, padding: "10px 14px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14, color: "#666",
                    appearance: "none", cursor: "pointer",
                  }}
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="popular">Terpopuler</option>
                </select>
                <ChevronDown
                  size={14}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)", color: "#aaa",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <span style={{
                display: "block", fontSize: 11, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#aaa", marginBottom: 10,
              }}>
                Kategori
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 14,
                      color: activeCategory === cat ? "#5b4fcf" : "#444",
                      width: "100%",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── MAIN ARTICLES ── */}
          <main style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {isLoading ? (
              /* Skeletons */
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{
                  height: 340, borderRadius: 18,
                  background: "linear-gradient(90deg, #ece9e0 25%, #f5f2ea 50%, #ece9e0 75%)",
                  backgroundSize: "200% 100%",
                  animation: "fadeUp 1.5s ease infinite",
                  border: "1.5px solid #e8e5de",
                }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {[0, 1, 2, 4].map((i) => (
                    <div key={i} style={{
                      height: 280, borderRadius: 16,
                      background: "#ece9e0",
                      border: "1.5px solid #e8e5de",
                    }} />
                  ))}
                </div>
              </div>
            ) : articles.length === 0 ? (
              /* Empty state */
              <div style={{
                textAlign: "center", padding: "80px 24px",
                background: "#fff", borderRadius: 18,
                border: "1.5px dashed #e8e5de",
              }}>
                <BookOpen size={48} style={{ color: "#ddd", margin: "0 auto 16px" }} />
                <p style={{ fontWeight: 600, color: "#666", marginBottom: 4 }}>
                  Artikel tidak ditemukan
                </p>
                <p style={{ fontSize: 14, color: "#aaa" }}>
                  Coba kata kunci atau kategori lain
                </p>
              </div>
            ) : (
              <>
                {/* ── FEATURED CARD ── */}
                {featuredArticle && (
                  <div
                    className="featured-card fade-up"
                    onClick={() => onArticleClick?.(featuredArticle)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      background: "#fff",
                      borderRadius: 18,
                      overflow: "hidden",
                      border: "1.5px solid #e8e5de",
                      cursor: "pointer",
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="img-wrapper" style={{ height: 300 }}>
                      {featuredArticle.coverImage ? (
                        <img
                          src={featuredArticle.coverImage}
                          alt={featuredArticle.title}
                          className="thumb-img"
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <div
                          className="thumb-img"
                          style={{
                            width: "100%", height: "100%",
                            background: getGradient(featuredArticle.id),
                          }}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{
                      padding: "36px 32px",
                      display: "flex", flexDirection: "column",
                      justifyContent: "center", gap: 12,
                    }}>
                      {/* Tags */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={{
                          display: "inline-block", fontSize: 11, fontWeight: 600,
                          letterSpacing: "0.05em", textTransform: "uppercase",
                          color: "#e6a800", background: "#fff8e1",
                          borderRadius: 20, padding: "3px 10px",
                        }}>
                          Utama
                        </span>
                        {featuredArticle.tags?.[0] && (
                          <span style={{
                            display: "inline-block", fontSize: 11, fontWeight: 600,
                            letterSpacing: "0.05em", textTransform: "uppercase",
                            color: "#5b4fcf", background: "#f0eeff",
                            borderRadius: 20, padding: "3px 10px",
                          }}>
                            {featuredArticle.tags[0]}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <div
                        className="fraunces"
                        style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25, color: "#111" }}
                      >
                        {featuredArticle.title}
                      </div>

                      {/* Excerpt */}
                      <div style={{
                        fontSize: 14, color: "#888", lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical" as any,
                        overflow: "hidden",
                      }}>
                        {getPreviewText(featuredArticle)}
                      </div>

                      {/* Stats */}
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#aaa" }}>
                          <Eye size={12} /> {featuredArticle.views ?? 0}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#aaa" }}>
                          <Heart size={12} /> {featuredArticle.likes ?? 0}
                        </span>
                      </div>

                      {/* Author */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "#e8e5de",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700,
                          color: "#5b4fcf", flexShrink: 0, overflow: "hidden",
                        }}>
                          {featuredArticle.authorAvatar ? (
                            <img
                              src={featuredArticle.authorAvatar}
                              alt={featuredArticle.author}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : initials(featuredArticle.author)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#111", fontSize: 13 }}>
                            {featuredArticle.author}
                          </div>
                          <div style={{ fontSize: 12, color: "#aaa" }}>
                            {readTime(getPreviewText(featuredArticle))}
                          </div>
                        </div>

                        {/* Arrow button */}
                        <div style={{ marginLeft: "auto" }}>
                          <div
                            className="link-btn"
                            style={{
                              width: 30, height: 30, borderRadius: "50%",
                              border: "1.5px solid #e8e5de",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#111",
                            }}
                          >
                            <ArrowUpRight size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── GRID CARDS ── */}
                {gridArticles.length > 0 && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 20,
                  }}>
                    {gridArticles.map((article, idx) => (
                      <div
                        key={article.id}
                        className={`article-card fade-up-${Math.min(idx + 1, 5)}`}
                        onClick={() => onArticleClick?.(article)}
                        style={{
                          background: "#fff",
                          borderRadius: 16,
                          border: "1.5px solid #e8e5de",
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        {/* Thumbnail */}
                        <div className="img-wrapper" style={{ height: 200 }}>
                          {article.coverImage ? (
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className="thumb-img"
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                          ) : (
                            <div
                              className="thumb-img"
                              style={{
                                width: "100%", height: "100%",
                                background: getGradient(article.id),
                              }}
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ padding: 20 }}>
                          {/* Tag */}
                          {article.tags?.[0] && (
                            <span style={{
                              display: "inline-block", fontSize: 11, fontWeight: 600,
                              letterSpacing: "0.05em", textTransform: "uppercase",
                              color: "#5b4fcf", background: "#f0eeff",
                              borderRadius: 20, padding: "3px 10px",
                              marginBottom: 10,
                            }}>
                              {article.tags[0]}
                            </span>
                          )}

                          {/* Title */}
                          <div
                            className="fraunces"
                            style={{
                              fontSize: 18, fontWeight: 700,
                              lineHeight: 1.3, color: "#111",
                              marginBottom: 8,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical" as any,
                              overflow: "hidden",
                            }}
                          >
                            {article.title}
                          </div>

                          {/* Excerpt */}
                          <div style={{
                            fontSize: 13, color: "#888", lineHeight: 1.6,
                            marginBottom: 14,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical" as any,
                            overflow: "hidden",
                          }}>
                            {getPreviewText(article)}
                          </div>

                          {/* Author + link */}
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: "50%",
                              background: "#e8e5de",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 700,
                              color: "#5b4fcf", flexShrink: 0, overflow: "hidden",
                            }}>
                              {article.authorAvatar ? (
                                <img
                                  src={article.authorAvatar}
                                  alt={article.author}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : initials(article.author)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontWeight: 600, color: "#111", fontSize: 12,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}>
                                {article.author}
                              </div>
                              <div style={{ fontSize: 11, color: "#aaa" }}>
                                {readTime(getPreviewText(article))}
                              </div>
                            </div>
                            <div
                              className="link-btn"
                              style={{
                                width: 28, height: 28, borderRadius: "50%",
                                border: "1.5px solid #e8e5de",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#111", flexShrink: 0,
                              }}
                            >
                              <ArrowUpRight size={13} />
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
