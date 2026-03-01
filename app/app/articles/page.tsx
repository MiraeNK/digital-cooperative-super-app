"use client"

import { useState, useEffect } from "react"
import { Search, ArrowLeft, ArrowUpRight, Eye, Heart, ChevronDown, BookOpen } from "lucide-react"
import { getArticlesWithAuthorData, getAllArticleTags } from "@/lib/firebase"
import { useRouter } from "next/navigation"

const GRADIENTS = [
  "linear-gradient(135deg, #c8a97e 0%, #8b6b4a 100%)",
  "linear-gradient(135deg, #a8d8a8 0%, #2d6a4f 100%)",
  "linear-gradient(135deg, #b8c8e8 0%, #1d4e89 100%)",
  "linear-gradient(135deg, #e8c8a8 0%, #c08060 100%)",
  "linear-gradient(135deg, #d8a8e8 0%, #7b4fa5 100%)",
  "linear-gradient(135deg, #f0e8c0 0%, #c8a020 100%)",
  "linear-gradient(135deg, #c0e8e8 0%, #1a7a8a 100%)",
  "linear-gradient(135deg, #e8a8b8 0%, #a03060 100%)",
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

const DUMMY_ARTICLES = [
  { id: "d1", title: "Cara Cerdas Mengembangkan Usaha Tani dengan Modal Koperasi", description: "Panduan lengkap memanfaatkan fasilitas pinjaman koperasi untuk meningkatkan hasil pertanian dan pendapatan keluarga petani.", content: "## Modal Koperasi untuk Tani\nMulai dari kebutuhan paling prioritas.\n\n### Tahapan\n- Hitung kebutuhan modal\n- Pisahkan biaya rutin\n- Evaluasi per musim\n\n:::quote theme=amber font=serif\nKemajuan usaha datang dari keputusan kecil yang konsisten.\n:::\n\n:::block theme=blue font=sans title=\"Praktik\"\nGunakan catatan pengeluaran harian agar arus kas lebih terkontrol.\n:::", tags: ["Pertanian"], author: "Tubagus Ahmad", views: 3240, likes: 210, coverImage: "", createdAt: { toDate: () => new Date("2024-11-15") } },
  { id: "d2", title: "Strategi UMKM Go Digital: Dari Pasar Tradisional ke Marketplace", description: "Transformasi usaha kecil menengah ke platform digital terbukti meningkatkan omzet hingga 3x lipat dalam 6 bulan pertama.", content: "## UMKM Go Digital\nOptimasi produk dan layanan pelanggan jadi kunci.\n\n### Langkah\n- Foto produk konsisten\n- Deskripsi jujur\n- Respon cepat\n\n:::quote theme=purple font=serif\nPelanggan membeli kepercayaan, bukan hanya produk.\n:::\n\n:::block theme=green font=sans title=\"Catatan\"\nSusun SOP chat admin agar kualitas layanan tetap stabil.\n:::", tags: ["Keuangan & Bisnis"], author: "Dewi Lestari", views: 2180, likes: 145, coverImage: "", createdAt: { toDate: () => new Date("2024-11-10") } },
  { id: "d3", title: "Kesehatan Jiwa Petani: Mengelola Tekanan di Musim Panen", description: "Bagaimana komunitas koperasi bisa saling mendukung kesehatan mental antar anggota di tengah tantangan agraris.", content: "## Kesehatan Mental Petani\nMusim panen menuntut fisik dan mental sekaligus.\n\n### Rekomendasi\n- Jadwal istirahat\n- Pembagian beban kerja\n- Forum evaluasi mingguan\n\n:::quote theme=blue font=serif\nTim sehat secara mental cenderung lebih tahan menghadapi tekanan pasar.\n:::\n\n:::block theme=slate font=sans title=\"Pengingat\"\nMasukkan aspek kesejahteraan mental di agenda rapat rutin koperasi.\n:::", tags: ["Kesehatan"], author: "dr. Wahyu Subagyo", views: 1870, likes: 98, coverImage: "", createdAt: { toDate: () => new Date("2024-11-05") } },
  { id: "d4", title: "IoT & Sensor Tanah: Teknologi Murah untuk Panen Maksimal", description: "Alat sensor tanah berbasis IoT kini bisa diakses UMKM dengan harga terjangkau dan hasil yang luar biasa.", content: "## Sensor Tanah IoT\nData real-time membantu keputusan lebih akurat.\n\n### Dampak\n- Efisiensi air\n- Pemupukan tepat\n- Risiko gagal panen turun\n\n:::quote theme=green font=serif\nData kecil yang konsisten bisa memberi dampak besar.\n:::\n\n:::block theme=amber font=mono title=\"Implementasi\"\nMulai dari lahan kecil sebelum diterapkan ke seluruh area produksi.\n:::", tags: ["Teknologi"], author: "Roni Hermawan", views: 1540, likes: 88, coverImage: "", createdAt: { toDate: () => new Date("2024-10-28") } },
  { id: "d5", title: "Hasil Ternak Sapi Potong: Menghitung Untung Bersih yang Realistis", description: "Analisis biaya produksi dan proyeksi keuntungan beternak sapi potong skala rumahan dengan dukungan koperasi.", content: "## Ternak Sapi Potong\nMargin usaha ditentukan kontrol biaya pakan.\n\n### Fokus\n- Konversi pakan\n- Jadwal kesehatan ternak\n- Kondisi kandang\n\n:::quote theme=blue font=serif\nKontrol biaya harian lebih penting daripada prediksi harga semata.\n:::\n\n:::block theme=slate font=sans title=\"Checklist\"\nGunakan catatan berat mingguan untuk memantau performa ternak.\n:::", tags: ["Peternakan"], author: "Hendra Wijaya", views: 2650, likes: 175, coverImage: "", createdAt: { toDate: () => new Date("2024-10-20") } },
  { id: "d6", title: "Raih Sertifikasi Halal UMKM: Langkah Demi Langkah", description: "Panduan praktis mengurus sertifikasi halal produk UMKM agar bisa menembus pasar modern dan ekspor.", content: "## Sertifikasi Halal UMKM\nDokumen yang rapi mempercepat proses audit.\n\n### Persiapan\n- Data bahan baku\n- SOP produksi\n- Bukti kebersihan\n\n:::quote theme=purple font=serif\nDokumentasi yang rapi mengurangi revisi dan biaya tambahan.\n:::\n\n:::block theme=green font=sans title=\"Tips\"\nBuat template dokumen agar produk baru lebih cepat tersertifikasi.\n:::", tags: ["Keuangan & Bisnis"], author: "Siti Rahayu", views: 1920, likes: 134, coverImage: "", createdAt: { toDate: () => new Date("2024-10-15") } },
  { id: "d7", title: "Tips Menjaga Kualitas Beras Organik Selama Penyimpanan", description: "Teknik penyimpanan pasca panen yang benar untuk mempertahankan kualitas dan nilai jual beras organik.", content: "## Penyimpanan Beras Organik\nKualitas pasca panen sangat menentukan harga jual.\n\n### Standar\n- Ventilasi baik\n- Rotasi FIFO\n- Pemeriksaan batch\n\n:::quote theme=amber font=serif\nMutu produk yang konsisten membangun loyalitas pasar.\n:::\n\n:::block theme=blue font=sans title=\"Kontrol\"\nGunakan label batch agar traceability produk tetap jelas.\n:::", tags: ["Pertanian"], author: "Agus Santoso", views: 1340, likes: 72, coverImage: "", createdAt: { toDate: () => new Date("2024-10-08") } },
]

function getGradient(id: string) {
  const idx = Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % GRADIENTS.length
  return GRADIENTS[idx]
}

function initials(name?: string) {
  if (!name) return "A"
  return name.split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? "").join("")
}

function formatDate(createdAt: any) {
  try {
    const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt)
    if (!date || isNaN(date.getTime())) return ""
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  } catch { return "" }
}

function readTime(text?: string) {
  if (!text) return "5 min baca"
  return `${Math.max(1, Math.round(text.split(" ").length / 200))} min baca`
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

export default function ArticleDiscoveryPage() {
  const router = useRouter()
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [activeCategory, setActiveCategory] = useState("Semua Kategori")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const dbArticles = await getArticlesWithAuthorData(30)
        const dbTags = await getAllArticleTags()
        const merged = dbArticles.length > 0
          ? [...dbArticles, ...DUMMY_ARTICLES.filter(d => !dbArticles.find((a: any) => a.id === d.id))]
          : DUMMY_ARTICLES
        setAllArticles(merged)
        setArticles(merged)
        if (dbTags.length > 0) {
          setCategories(Array.from(new Set(["Semua Kategori", ...DEFAULT_CATEGORIES.slice(1), ...dbTags])))
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

  useEffect(() => {
    let result = [...allArticles]
    if (activeCategory !== "Semua Kategori") {
      result = result.filter(a => a.tags?.includes(activeCategory))
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.author?.toLowerCase().includes(q)
      )
    }
    if (sortBy === "oldest") result.reverse()
    else if (sortBy === "popular") result.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    else result.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime?.() ?? 0
      const tb = b.createdAt?.toDate?.()?.getTime?.() ?? 0
      return tb - ta
    })
    setArticles(result)
  }, [activeCategory, searchTerm, sortBy, allArticles])

  const featured = articles[0] ?? null
  const grid = articles.slice(1)

  return (
    <div style={{ background: "#f9f8f5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        .fraunces { font-family: 'Fraunces', serif; }
        .art-card  { transition: box-shadow .22s, transform .22s; cursor: pointer; }
        .art-card:hover  { box-shadow: 0 12px 32px rgba(0,0,0,.09); transform: translateY(-2px); }
        .feat-card { transition: box-shadow .22s, transform .22s; cursor: pointer; }
        .feat-card:hover { box-shadow: 0 16px 40px rgba(0,0,0,.09); transform: translateY(-2px); }
        .img-wrap { overflow: hidden; }
        .thumb { transition: transform .6s; display: block; }
        .art-card:hover .thumb, .feat-card:hover .thumb { transform: scale(1.05); }
        .arrow-btn { transition: background .15s, border-color .15s, color .15s; }
        .arrow-btn:hover { background: #1e3a5f !important; border-color: #1e3a5f !important; color: #fff !important; }
        .cat-btn { border: none; background: transparent; cursor: pointer; text-align: left; font-family: inherit; transition: background .15s, color .15s; }
        .cat-btn:hover  { background: #e8f0fe; color: #1e3a5f; }
        .cat-btn.active { background: #e8f0fe; color: #1e3a5f; font-weight: 600; }
        .search-wrap:focus-within { border-color: #1e3a5f !important; }
        .sort-sel { appearance: none; cursor: pointer; }
        .sort-sel:focus { outline: none; border-color: #1e3a5f !important; }
        .back-btn { transition: border-color .15s, color .15s; cursor: pointer; }
        .back-btn:hover { border-color: #1e3a5f !important; color: #1e3a5f !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .fu  { animation: fadeUp .45s ease both; }
        .fu1 { animation: fadeUp .45s .05s ease both; }
        .fu2 { animation: fadeUp .45s .10s ease both; }
        .fu3 { animation: fadeUp .45s .15s ease both; }
        .fu4 { animation: fadeUp .45s .20s ease both; }
        .fu5 { animation: fadeUp .45s .25s ease both; }
        @media (max-width: 768px) {
          .body-grid  { grid-template-columns: 1fr !important; }
          .sidebar    { position: static !important; }
          .feat-inner { grid-template-columns: 1fr !important; }
          .feat-thumb { height: 220px !important; }
          .cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Back */}
        <div style={{ paddingTop: 28, marginBottom: 4 }}>
          <button
            className="back-btn"
            onClick={() => router.back()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#fff", border: "1.5px solid #e8e5de",
              borderRadius: 40, padding: "8px 18px 8px 12px",
              fontSize: 13, fontWeight: 500, color: "#555",
              boxShadow: "0 1px 4px rgba(0,0,0,.06)",
            }}
          >
            <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowLeft size={14} style={{ color: "#1e3a5f" }} />
            </span>
            Kembali
          </button>
        </div>

        {/* Hero */}
        <div style={{ padding: "44px 0 36px", textAlign: "center" }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, color: "#1e3a5f", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Baca &amp; Pelajari
          </span>
          <h1 className="fraunces" style={{ fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#111", marginBottom: 12 }}>
            Jelajahi Artikel Koperasi
          </h1>
          <p style={{ fontSize: 16, color: "#888", maxWidth: 400, margin: "0 auto" }}>
            Panduan, berita, dan wawasan dari komunitas untuk mengembangkan usaha bersama.
          </p>
        </div>

        {/* Body Grid */}
        <div className="body-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 40, alignItems: "start" }}>

          {/* Sidebar */}
          <aside className="sidebar" style={{ position: "sticky", top: 24 }}>
            {/* Search */}
            <div style={{ marginBottom: 28 }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 10 }}>Pencarian</span>
              <div className="search-wrap" style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #e8e5de", borderRadius: 10, padding: "10px 14px" }}>
                <Search size={16} style={{ color: "#aaa", flexShrink: 0 }} />
                <input type="text" placeholder="Cari artikel..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 14, width: "100%", color: "#111" }} />
              </div>
            </div>

            {/* Sort */}
            <div style={{ marginBottom: 28 }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 10 }}>Urutkan</span>
              <div style={{ position: "relative" }}>
                <select className="sort-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ width: "100%", background: "#fff", border: "1.5px solid #e8e5de", borderRadius: 10, padding: "10px 36px 10px 14px", fontFamily: "inherit", fontSize: 14, color: "#666" }}>
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="popular">Terpopuler</option>
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Categories */}
            <div>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 10 }}>Kategori</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
                    style={{ padding: "8px 12px", borderRadius: 8, fontSize: 14, width: "100%", color: activeCategory === cat ? "#1e3a5f" : "#444" }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {isLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ height: 320, borderRadius: 18, background: "#ece9e0", border: "1.5px solid #e8e5de" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {[0,1,2,3].map(i => <div key={i} style={{ height: 280, borderRadius: 16, background: "#ece9e0" }} />)}
                </div>
              </div>
            ) : articles.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 24px", background: "#fff", borderRadius: 18, border: "1.5px dashed #e8e5de" }}>
                <BookOpen size={48} style={{ color: "#ddd", margin: "0 auto 16px" }} />
                <p style={{ fontWeight: 600, color: "#666", marginBottom: 4 }}>Artikel tidak ditemukan</p>
                <p style={{ fontSize: 14, color: "#aaa" }}>Coba kata kunci atau kategori lain</p>
              </div>
            ) : (
              <>
                {/* Featured */}
                {featured && (
                  <div className="feat-card fu feat-inner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#fff", borderRadius: 18, overflow: "hidden", border: "1.5px solid #e8e5de" }}>
                    <div className="img-wrap feat-thumb" style={{ height: 300 }}>
                      {featured.coverImage
                        ? <img src={featured.coverImage} alt={featured.title} className="thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div className="thumb" style={{ width: "100%", height: "100%", background: getGradient(featured.id) }} />}
                    </div>
                    <div style={{ padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#e6a800", background: "#fff8e1", borderRadius: 20, padding: "3px 10px" }}>Utama</span>
                        {featured.tags?.[0] && <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#1e3a5f", background: "#e8f0fe", borderRadius: 20, padding: "3px 10px" }}>{featured.tags[0]}</span>}
                      </div>
                      <div className="fraunces" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25, color: "#111" }}>{featured.title}</div>
                      <div style={{ fontSize: 14, color: "#888", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{toPreviewText(featured.description || featured.excerpt || featured.content)}</div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#aaa" }}><Eye size={12} /> {featured.views ?? 0}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#aaa" }}><Heart size={12} /> {featured.likes ?? 0}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e8e5de", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1e3a5f", flexShrink: 0 }}>{initials(featured.author)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: "#111", fontSize: 13 }}>{featured.author}</div>
                          <div style={{ fontSize: 12, color: "#aaa" }}>{formatDate(featured.createdAt) || readTime(toPreviewText(featured.description || featured.excerpt || featured.content))}</div>
                        </div>
                        <div className="arrow-btn" style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid #e8e5de", display: "flex", alignItems: "center", justifyContent: "center", color: "#111" }}>
                          <ArrowUpRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid */}
                {grid.length > 0 && (
                  <div className="cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
                    {grid.map((article, idx) => (
                      <div key={article.id} className={`art-card fu${Math.min(idx + 1, 5)}`} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e8e5de", overflow: "hidden" }}>
                        <div className="img-wrap" style={{ height: 200 }}>
                          {article.coverImage
                            ? <img src={article.coverImage} alt={article.title} className="thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div className="thumb" style={{ width: "100%", height: "100%", background: getGradient(article.id) }} />}
                        </div>
                        <div style={{ padding: 20 }}>
                          {article.tags?.[0] && (
                            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#1e3a5f", background: "#e8f0fe", borderRadius: 20, padding: "3px 10px", marginBottom: 10 }}>{article.tags[0]}</span>
                          )}
                          <div className="fraunces" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, color: "#111", marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{article.title}</div>
                          <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{toPreviewText(article.description || article.excerpt || article.content)}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e8e5de", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#1e3a5f", flexShrink: 0 }}>{initials(article.author)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, color: "#111", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{article.author}</div>
                              <div style={{ fontSize: 11, color: "#aaa" }}>{formatDate(article.createdAt) || readTime(toPreviewText(article.description || article.excerpt || article.content))}</div>
                            </div>
                            <div className="arrow-btn" style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #e8e5de", display: "flex", alignItems: "center", justifyContent: "center", color: "#111", flexShrink: 0 }}>
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
