"use client"

import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft, Heart, Share2, Eye, Clock, Calendar,
  BookOpen, ArrowUpRight, CheckCheck, ChevronUp
} from "lucide-react"
import { getArticleById, getArticlesWithAuthorData, getUserProfile } from "@/lib/firebase"

// ── Gradients placeholder ─────────────────────────────────────────────────────
const GRADIENTS = [
  "linear-gradient(135deg,#1d4e89 0%,#3b82f6 100%)",
  "linear-gradient(135deg,#065f46 0%,#34d399 100%)",
  "linear-gradient(135deg,#7c2d12 0%,#fb923c 100%)",
  "linear-gradient(135deg,#4c1d95 0%,#a78bfa 100%)",
  "linear-gradient(135deg,#164e63 0%,#22d3ee 100%)",
  "linear-gradient(135deg,#713f12 0%,#fbbf24 100%)",
  "linear-gradient(135deg,#1e3a5f 0%,#60a5fa 100%)",
  "linear-gradient(135deg,#134e4a 0%,#5eead4 100%)",
]

function getGradient(id: string) {
  const idx = Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % GRADIENTS.length
  return GRADIENTS[idx]
}

function initials(name?: string) {
  if (!name) return "A"
  return name.split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? "").join("")
}

function formatDate(v: any) {
  try {
    const d = v?.toDate ? v.toDate() : new Date(v)
    if (!d || isNaN(d.getTime())) return ""
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  } catch { return "" }
}

function readTime(text?: string) {
  if (!text) return "5 menit"
  return `${Math.max(1, Math.round(text.split(" ").length / 200))} menit`
}

function toLeadText(raw?: string) {
  if (!raw) return ""
  return raw
    .replace(/<!doctype[^>]*>/gi, " ")
    .replace(/<!doctype[^<]*/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<html[^>]*>/gi, " ")
    .replace(/<\/html>/gi, " ")
    .replace(/<meta[^>]*>/gi, " ")
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
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
    .replace(/:::[\s\S]*?:::/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function parseBold(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} style={{ fontWeight: 700, color: "#0f172a" }}>{p.slice(2, -2)}</strong>
      : p
  )
}

function sanitizeReaderHtml(html: string) {
  if (typeof window === "undefined") return html
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  const blocked = new Set(["script", "style", "iframe", "object", "embed"])

  const walk = (node: Element) => {
    const tag = node.tagName.toLowerCase()
    if (blocked.has(tag)) {
      node.remove()
      return
    }
    for (const attr of Array.from(node.attributes)) {
      const name = attr.name.toLowerCase()
      const value = attr.value || ""
      if (name.startsWith("on")) {
        node.removeAttribute(attr.name)
        continue
      }
      if ((name === "href" || name === "src") && /^\s*javascript:/i.test(value)) {
        node.removeAttribute(attr.name)
      }
    }
    if (tag === "a") {
      node.setAttribute("target", "_blank")
      node.setAttribute("rel", "noopener noreferrer")
    }
    Array.from(node.children).forEach((child) => walk(child))
  }

  Array.from(doc.body.children).forEach((child) => walk(child))
  return doc.body.innerHTML
}

function parseDirective(line: string) {
  const meta: Record<string, string> = {}
  const matches = line.matchAll(/(\w+)=(".*?"|[^\s]+)/g)
  for (const m of matches) {
    meta[m[1]] = m[2].replace(/^"|"$/g, "")
  }
  return meta
}

function resolveTheme(theme?: string) {
  const key = (theme || "blue").toLowerCase()
  if (key === "green") return { bg: "#ecfdf5", border: "#10b981", text: "#065f46" }
  if (key === "amber") return { bg: "#fffbeb", border: "#f59e0b", text: "#92400e" }
  if (key === "purple") return { bg: "#f5f3ff", border: "#8b5cf6", text: "#5b21b6" }
  if (key === "slate") return { bg: "#f8fafc", border: "#64748b", text: "#334155" }
  return { bg: "#eff6ff", border: "#2563eb", text: "#1e40af" }
}

function resolveFont(font?: string) {
  const key = (font || "sans").toLowerCase()
  if (key === "serif") return "'Fraunces', serif"
  if (key === "mono") return "'JetBrains Mono', 'Consolas', monospace"
  return "'DM Sans', sans-serif"
}

function RenderContent({ content }: { content: string }) {
  if (!content) return null

  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content)
  if (isHtml) {
    return (
      <div
        className="ar-html-content"
        style={{ color: "#334155", fontSize: 18, lineHeight: 1.9 }}
        dangerouslySetInnerHTML={{ __html: sanitizeReaderHtml(content) }}
      />
    )
  }

  const blocks = content.split("\n\n")

  return (
    <>
      {blocks.map((block, i) => {
        if (!block.trim()) return null

        if (block.startsWith(":::quote") || block.startsWith(":::block")) {
          const lines = block.split("\n")
          const header = lines[0] || ""
          const meta = parseDirective(header)
          const isQuote = header.startsWith(":::quote")
          const bodyLines = lines.slice(1).filter((line) => line.trim() !== ":::")
          const body = bodyLines.join("\n")
          const theme = resolveTheme(meta.theme)
          const fontFamily = resolveFont(meta.font)

          return (
            <div
              key={i}
              style={{
                margin: "24px 0",
                padding: "18px 20px",
                borderLeft: `4px solid ${theme.border}`,
                background: theme.bg,
                borderRadius: "0 12px 12px 0",
              }}
            >
              {!isQuote && meta.title && (
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: theme.text, fontWeight: 700, marginBottom: 8 }}>
                  {meta.title}
                </div>
              )}
              <div style={{ fontFamily, fontSize: 18, lineHeight: 1.8, color: theme.text, fontStyle: isQuote ? "italic" : "normal" }}>
                {parseBold(body)}
              </div>
            </div>
          )
        }

        if (block.startsWith("```") && block.endsWith("```")) {
          const code = block.replace(/^```/, "").replace(/```$/, "").trim()
          return (
            <pre
              key={i}
              style={{
                margin: "20px 0",
                padding: "16px 18px",
                borderRadius: 12,
                background: "#0f172a",
                color: "#e2e8f0",
                overflowX: "auto",
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: "'JetBrains Mono', 'Consolas', monospace",
              }}
            >
              <code>{code}</code>
            </pre>
          )
        }

        const imageMatch = block.match(/^!\[(.*?)\]\((.+?)\)$/)
        if (imageMatch) {
          const alt = imageMatch[1] || "Gambar artikel"
          const src = imageMatch[2]
          return (
            <figure key={i} style={{ margin: "28px 0" }}>
              <img
                src={src}
                alt={alt}
                style={{
                  width: "100%",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px rgba(15,23,42,.08)",
                }}
              />
              {alt && (
                <figcaption style={{ marginTop: 8, color: "#64748b", fontSize: 13 }}>
                  {alt}
                </figcaption>
              )}
            </figure>
          )
        }

        if (block.startsWith("# "))
          return <h1 key={i} style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "40px 0 16px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>{block.slice(2)}</h1>

        if (block.startsWith("## "))
          return <h2 key={i} style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "36px 0 12px", lineHeight: 1.3 }}>{block.slice(3)}</h2>

        if (block.startsWith("### "))
          return <h3 key={i} style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 700, color: "#1e293b", margin: "28px 0 10px", lineHeight: 1.35 }}>{block.slice(4)}</h3>

        if (block.startsWith("> "))
          return (
            <blockquote key={i} style={{ margin: "28px 0", padding: "20px 24px", background: "#eff6ff", borderLeft: "4px solid #2563eb", borderRadius: "0 12px 12px 0" }}>
              <p style={{ fontFamily: "'Fraunces',serif", fontSize: 20, color: "#1d4ed8", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
                {parseBold(block.slice(2))}
              </p>
            </blockquote>
          )

        const lines = block.split("\n")
        if (lines.every(l => l.trim().startsWith("- ")))
          return (
            <ul key={i} style={{ margin: "20px 0", paddingLeft: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {lines.map((l, j) => (
                <li key={j} style={{ fontSize: 18, color: "#334155", lineHeight: 1.8, listStyleType: "disc" }}>
                  {parseBold(l.replace(/^- /, ""))}
                </li>
              ))}
            </ul>
          )

        if (lines.every(l => /^\d+\.\s/.test(l.trim())))
          return (
            <ol key={i} style={{ margin: "20px 0", paddingLeft: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {lines.map((l, j) => (
                <li key={j} style={{ fontSize: 18, color: "#334155", lineHeight: 1.8, listStyleType: "decimal" }}>
                  {parseBold(l.replace(/^\d+\.\s/, ""))}
                </li>
              ))}
            </ol>
          )

        return (
          <p key={i} style={{ fontSize: 18, color: "#334155", lineHeight: 1.9, margin: "0 0 24px" }}>
            {parseBold(block)}
          </p>
        )
      })}
    </>
  )
}

// ── Interface ─────────────────────────────────────────────────────────────────
interface ArticleReaderProps {
  article: {
    id: string
    title: string
    category?: string
    author?: string
    authorId?: string
    authorAvatar?: string
    views?: number
    likes?: number
    cover?: string
    coverImage?: string
    excerpt?: string
    description?: string
    content?: string
    tags?: string[]
    createdAt?: any
  }
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ArticleReader({ article: init, onClose }: ArticleReaderProps) {
  const [article, setArticle] = useState<any>(init)
  const [author, setAuthor] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [liked, setLiked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [readProgress, setReadProgress] = useState(0)
  const [showBackTop, setShowBackTop] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch full article
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const full = await getArticleById(init.id)
        if (full) setArticle(full)
        const authorId = full?.authorId || init.authorId
        if (authorId) setAuthor(await getUserProfile(authorId))
        const all = await getArticlesWithAuthorData(10)
        const tags = full?.tags || init.tags || []
        const rel = all.filter((a: any) => a.id !== init.id && a.tags?.some((t: string) => tags.includes(t))).slice(0, 4)
        setRelated(rel.length > 0 ? rel : all.filter((a: any) => a.id !== init.id).slice(0, 4))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [init.id])

  // Scroll progress + back-to-top
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const pct = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0
      setReadProgress(Math.round(pct))
      setShowBackTop(scrollTop > 600)
    }
    el.addEventListener("scroll", onScroll)
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const scrollTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })

  const coverImage = article.coverImage || article.cover || ""
  const authorName = author?.displayName || article.author || "Penulis"
  const body = article.content || ""
  const lead = toLeadText(article.description || article.excerpt || "")
  const tags: string[] = article.tags || (article.category ? [article.category] : [])
  const likeCount = (article.likes ?? 0) + (liked ? 1 : 0)

  return (
    <div
      ref={scrollRef}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "#f8fafc",
        overflowY: "auto",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* Progress bar */
        .ar-progress {
          position: fixed; top: 0; left: 0; height: 3px;
          background: linear-gradient(90deg, #2563eb, #60a5fa);
          z-index: 210; transition: width .15s ease; border-radius: 0 2px 2px 0;
        }

        /* Top bar */
        .ar-topbar {
          position: sticky; top: 0; z-index: 205;
          background: rgba(248,250,252,0.95);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 24px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .ar-back {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; border: 1.5px solid #e2e8f0;
          border-radius: 40px; padding: 7px 16px 7px 10px;
          font-family: inherit; font-size: 13px; font-weight: 500;
          color: #475569; cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,.06);
          transition: border-color .15s, color .15s;
        }
        .ar-back:hover { border-color: #2563eb; color: #2563eb; }

        .ar-icon-wrap {
          width: 24px; height: 24px; border-radius: 50%;
          background: #dbeafe; display: flex; align-items: center; justify-content: center;
        }

        .ar-action {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fff; border: 1.5px solid #e2e8f0;
          border-radius: 40px; padding: 7px 14px;
          font-family: inherit; font-size: 13px; font-weight: 500;
          color: #475569; cursor: pointer;
          transition: background .15s, border-color .15s, color .15s;
        }
        .ar-action:hover { background: #2563eb; border-color: #2563eb; color: #fff; }
        .ar-action.ar-liked { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }
        .ar-action.ar-liked:hover { background: #dc2626; border-color: #dc2626; color: #fff; }
        .ar-action.ar-copied { background: #eff6ff; border-color: #2563eb; color: #2563eb; }

        /* Cover */
        .ar-cover-wrap {
          width: 100%; border-radius: 20px; overflow: hidden;
          margin-bottom: 36px;
          box-shadow: 0 20px 60px rgba(0,0,0,.12);
        }

        /* Tag pill */
        .ar-tag {
          display: inline-block; font-size: 11px; font-weight: 700;
          letter-spacing: .07em; text-transform: uppercase;
          color: #2563eb; background: #dbeafe;
          border-radius: 20px; padding: 4px 12px;
        }

        /* Meta row */
        .ar-meta {
          display: flex; align-items: center; flex-wrap: wrap; gap: 16px;
          padding: 20px 0; border-top: 1.5px solid #e2e8f0;
          border-bottom: 1.5px solid #e2e8f0; margin-bottom: 40px;
        }
        .ar-meta-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #94a3b8;
        }
        .ar-divider { width: 1px; height: 28px; background: #e2e8f0; }

        /* Author */
        .ar-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: #dbeafe; overflow: hidden; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; color: #2563eb;
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(37,99,235,.15);
        }

        /* Lead paragraph */
        .ar-lead {
          font-family: 'Fraunces', serif;
          font-size: 21px; font-weight: 400; font-style: italic;
          color: #1e40af; line-height: 1.7;
          padding: 20px 24px; margin-bottom: 36px;
          background: #eff6ff;
          border-left: 4px solid #2563eb;
          border-radius: 0 12px 12px 0;
        }

        /* Bottom strip */
        .ar-bottom-strip {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
          padding: 28px 0; margin-top: 48px;
          border-top: 1.5px solid #e2e8f0;
          border-bottom: 1.5px solid #e2e8f0;
        }

        .ar-like-big {
          display: inline-flex; align-items: center; gap: 10px;
          background: #2563eb; border: none; border-radius: 40px;
          padding: 12px 28px; font-family: inherit; font-size: 15px;
          font-weight: 600; color: #fff; cursor: pointer;
          transition: background .15s, transform .1s;
          box-shadow: 0 4px 14px rgba(37,99,235,.3);
        }
        .ar-like-big:hover { background: #1d4ed8; transform: translateY(-1px); }
        .ar-like-big.ar-liked-big { background: #dc2626; box-shadow: 0 4px 14px rgba(220,38,38,.3); }
        .ar-like-big.ar-liked-big:hover { background: #b91c1c; }

        .ar-share-big {
          display: inline-flex; align-items: center; gap: 10px;
          background: #fff; border: 1.5px solid #e2e8f0;
          border-radius: 40px; padding: 12px 24px;
          font-family: inherit; font-size: 15px; font-weight: 600;
          color: #475569; cursor: pointer;
          transition: border-color .15s, color .15s;
        }
        .ar-share-big:hover { border-color: #2563eb; color: #2563eb; }

        /* Related */
        .ar-rel-card {
          background: #fff; border-radius: 16px;
          border: 1.5px solid #e2e8f0; overflow: hidden; cursor: pointer;
          transition: box-shadow .22s, transform .22s;
        }
        .ar-rel-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,.09); transform: translateY(-2px); }
        .ar-rel-card .ar-thumb { transition: transform .6s; display: block; }
        .ar-rel-card:hover .ar-thumb { transform: scale(1.05); }
        .ar-rel-img { overflow: hidden; }

        .ar-arrow {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1.5px solid #e2e8f0; display: flex;
          align-items: center; justify-content: center; color: #334155;
          transition: background .15s, border-color .15s, color .15s;
          flex-shrink: 0;
        }
        .ar-arrow:hover { background: #2563eb; border-color: #2563eb; color: #fff; }

        /* Back to top */
        .ar-backtop {
          position: fixed; bottom: 28px; right: 28px; z-index: 210;
          width: 44px; height: 44px; border-radius: 50%;
          background: #2563eb; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(37,99,235,.4);
          transition: transform .15s, opacity .2s;
        }
        .ar-backtop:hover { transform: translateY(-2px); }

        /* Skeleton */
        .ar-skel { background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%); background-size: 200% 100%; animation: arSkel 1.4s infinite; border-radius: 8px; }
        @keyframes arSkel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        @keyframes arFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .ar-fu { animation: arFadeUp .5s ease both; }
        .ar-fu2 { animation: arFadeUp .5s .08s ease both; }
        .ar-fu3 { animation: arFadeUp .5s .16s ease both; }
        .ar-fu4 { animation: arFadeUp .5s .24s ease both; }

        @media (max-width: 768px) {
          .ar-rel-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .ar-rel-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <style>{`
        .ar-html-content h1 {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          line-height: 1.2;
          margin: 40px 0 16px;
          color: #0f172a;
        }
        .ar-html-content h2 {
          font-family: 'Fraunces', serif;
          font-size: 24px;
          line-height: 1.3;
          margin: 32px 0 12px;
          color: #0f172a;
        }
        .ar-html-content h3 {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          line-height: 1.35;
          margin: 24px 0 10px;
          color: #1e293b;
        }
        .ar-html-content p {
          margin: 0 0 20px;
        }
        .ar-html-content ul, .ar-html-content ol {
          margin: 16px 0 22px 24px;
        }
        .ar-html-content li {
          margin: 6px 0;
        }
        .ar-html-content blockquote {
          margin: 24px 0;
          padding: 16px 20px;
          background: #eff6ff;
          border-left: 4px solid #2563eb;
          border-radius: 0 12px 12px 0;
          color: #1d4ed8;
          font-style: italic;
        }
        .ar-html-content pre {
          margin: 20px 0;
          padding: 16px 18px;
          border-radius: 12px;
          background: #0f172a;
          color: #e2e8f0;
          overflow-x: auto;
          font-size: 14px;
          line-height: 1.6;
          font-family: 'JetBrains Mono', 'Consolas', monospace;
        }
        .ar-html-content img {
          width: 100%;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          margin: 20px 0;
          box-shadow: 0 8px 24px rgba(15,23,42,.08);
        }
      `}</style>

      {/* ── READING PROGRESS BAR ── */}
      <div className="ar-progress" style={{ width: `${readProgress}%` }} />

      {/* ── TOP BAR ── */}
      <div className="ar-topbar">
        <button className="ar-back" onClick={onClose}>
          <span className="ar-icon-wrap">
            <ArrowLeft size={13} style={{ color: "#2563eb" }} />
          </span>
          Kembali
        </button>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className={`ar-action ${liked ? "ar-liked" : ""}`}
            onClick={() => setLiked(!liked)}
          >
            <Heart size={14} fill={liked ? "#dc2626" : "none"} />
            <span>{likeCount}</span>
          </button>
          <button
            className={`ar-action ${copied ? "ar-copied" : ""}`}
            onClick={share}
          >
            {copied ? <CheckCheck size={14} /> : <Share2 size={14} />}
            <span>{copied ? "Tersalin!" : "Bagikan"}</span>
          </button>
        </div>
      </div>

      {/* ── ARTICLE BODY ── */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "48px 32px 0" }}>

        {/* Tags */}
        <div className="ar-fu" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {tags.map(t => <span key={t} className="ar-tag">{t}</span>)}
        </div>

        {/* Title */}
        <h1 className="ar-fu2" style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "clamp(28px, 4.5vw, 48px)",
          fontWeight: 900, lineHeight: 1.1,
          letterSpacing: "-0.025em",
          color: "#0f172a", marginBottom: 28,
        }}>
          {article.title}
        </h1>

        {/* Meta */}
        <div className="ar-meta ar-fu3">
          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="ar-avatar">
              {author?.photoURL
                ? <img src={author.photoURL} alt={authorName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials(authorName)
              }
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{authorName}</div>
              {author?.role && (
                <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
                  {author.role === "writer" ? "Penulis" : author.role === "admin" ? "Admin" : "Member"}
                </div>
              )}
            </div>
          </div>

          <div className="ar-divider" />

          <div className="ar-meta-item">
            <Calendar size={14} />
            {formatDate(article.createdAt) || "—"}
          </div>

          <div className="ar-meta-item">
            <Clock size={14} />
            {readTime(body)} baca
          </div>

          <div className="ar-meta-item" style={{ marginLeft: "auto" }}>
            <Eye size={14} />
            {article.views ?? 0} dibaca
          </div>
        </div>

        {/* Cover Image */}
        <div className="ar-cover-wrap ar-fu4" style={{ height: "clamp(320px, 48vw, 560px)" }}>
          {coverImage
            ? <img src={coverImage} alt={article.title} className="ar-thumb" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div className="ar-thumb" style={{ width: "100%", height: "100%", background: getGradient(article.id) }} />
          }
        </div>

        {/* Lead / description */}
        {lead && lead !== body && (
          <p className="ar-lead">{lead}</p>
        )}

        {/* Body Content */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
            {[100, 95, 88, 100, 75, 92, 85, 60].map((w, i) => (
              <div key={i} className="ar-skel" style={{ height: 20, width: `${w}%` }} />
            ))}
          </div>
        ) : body ? (
          <div style={{ marginBottom: 16 }}>
            <RenderContent content={body} />
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <BookOpen size={48} style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: 16 }}>Konten artikel belum tersedia.</p>
          </div>
        )}

        {/* ── BOTTOM ACTION STRIP ── */}
        <div className="ar-bottom-strip">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="ar-avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
              {author?.photoURL
                ? <img src={author.photoURL} alt={authorName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials(authorName)
              }
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>Ditulis oleh</div>
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 16 }}>{authorName}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className={`ar-like-big ${liked ? "ar-liked-big" : ""}`}
              onClick={() => setLiked(!liked)}
            >
              <Heart size={18} fill={liked ? "#fff" : "none"} />
              {liked ? "Disukai" : "Suka Artikel"}
            </button>
            <button className="ar-share-big" onClick={share}>
              <Share2 size={16} />
              Bagikan
            </button>
          </div>
        </div>
      </div>

      {/* ── RELATED ARTICLES ── */}
      {related.length > 0 && (
        <div style={{ maxWidth: 1140, margin: "64px auto 80px", padding: "0 32px" }}>

          {/* Divider with label */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: 13, fontWeight: 700, color: "#94a3b8", letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Artikel Terkait
            </span>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          </div>

          <div className="ar-rel-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
            {related.map((rel) => (
              <div key={rel.id} className="ar-rel-card">
                <div className="ar-rel-img" style={{ height: 160 }}>
                  {rel.coverImage
                    ? <img src={rel.coverImage} alt={rel.title} className="ar-thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div className="ar-thumb" style={{ width: "100%", height: "100%", background: getGradient(rel.id) }} />
                  }
                </div>
                <div style={{ padding: 16 }}>
                  {rel.tags?.[0] && (
                    <span className="ar-tag" style={{ marginBottom: 8, display: "inline-block" }}>{rel.tags[0]}</span>
                  )}
                  <div style={{
                    fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 700,
                    lineHeight: 1.35, color: "#0f172a", marginTop: 8, marginBottom: 12,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as any, overflow: "hidden",
                  }}>
                    {rel.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#2563eb" }}>
                        {initials(rel.author)}
                      </div>
                      <span style={{ fontSize: 12, color: "#64748b", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {rel.author}
                      </span>
                    </div>
                    <div className="ar-arrow">
                      <ArrowUpRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BACK TO TOP BUTTON ── */}
      {showBackTop && (
        <button className="ar-backtop" onClick={scrollTop} title="Kembali ke atas">
          <ChevronUp size={20} style={{ color: "#fff" }} />
        </button>
      )}
    </div>
  )
}
