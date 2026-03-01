"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Save,
  Send,
  Strikethrough,
  Underline,
  Undo2,
  Unlink2,
  Upload,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { createArticle, updateArticle } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Props = {
  initialArticle?: any | null
  onArticleSaved?: () => void
  onCancelEdit?: () => void
}

const categories = ["Keuangan & Bisnis", "Hasil Tani", "Kesehatan", "Teknologi"]

const isHtmlContent = (value?: string) => !!value && /<\/?[a-z][\s\S]*>/i.test(value)

const sanitizeHtml = (html: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  const blocked = new Set(["script", "style", "iframe", "object", "embed"])
  const allowed = new Set([
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "strong", "b", "em", "i", "u", "s", "span",
    "ul", "ol", "li", "blockquote", "pre", "code", "hr",
    "a", "img", "div",
  ])

  const walk = (node: Element) => {
    const tag = node.tagName.toLowerCase()
    if (blocked.has(tag)) {
      node.remove()
      return
    }

    if (!allowed.has(tag)) {
      const parent = node.parentNode
      while (node.firstChild) parent?.insertBefore(node.firstChild, node)
      parent?.removeChild(node)
      return
    }

    const attrs = Array.from(node.attributes)
    for (const attr of attrs) {
      const name = attr.name.toLowerCase()
      const val = attr.value || ""
      if (name.startsWith("on")) {
        node.removeAttribute(attr.name)
        continue
      }
      if (name === "href" || name === "src") {
        if (/^\s*javascript:/i.test(val)) node.removeAttribute(attr.name)
        continue
      }
      if (!["href", "src", "alt", "title", "style", "target", "rel", "class"].includes(name)) {
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

const markdownToHtml = (markdown: string) => {
  if (!markdown?.trim()) return "<p></p>"
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  const html: string[] = []
  let i = 0

  const parseInline = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+?)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i += 1
      continue
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = []
      i += 1
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i += 1
      }
      i += 1
      html.push(`<pre><code>${codeLines.join("\n").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`)
      continue
    }

    const img = line.match(/^!\[(.*?)\]\((.+?)\)$/)
    if (img) {
      html.push(`<p><img src="${img[2]}" alt="${img[1] || "Gambar"}" /></p>`)
      i += 1
      continue
    }

    if (line.startsWith("# ")) {
      html.push(`<h1>${parseInline(line.slice(2))}</h1>`)
      i += 1
      continue
    }
    if (line.startsWith("## ")) {
      html.push(`<h2>${parseInline(line.slice(3))}</h2>`)
      i += 1
      continue
    }
    if (line.startsWith("### ")) {
      html.push(`<h3>${parseInline(line.slice(4))}</h3>`)
      i += 1
      continue
    }
    if (line.startsWith("> ")) {
      const quote: string[] = []
      while (i < lines.length && lines[i].startsWith("> ")) {
        quote.push(parseInline(lines[i].slice(2)))
        i += 1
      }
      html.push(`<blockquote><p>${quote.join("<br/>")}</p></blockquote>`)
      continue
    }
    if (/^- /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(`<li>${parseInline(lines[i].replace(/^- /, ""))}</li>`)
        i += 1
      }
      html.push(`<ul>${items.join("")}</ul>`)
      continue
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${parseInline(lines[i].replace(/^\d+\.\s/, ""))}</li>`)
        i += 1
      }
      html.push(`<ol>${items.join("")}</ol>`)
      continue
    }

    html.push(`<p>${parseInline(line)}</p>`)
    i += 1
  }

  return html.join("")
}

const htmlToMarkdown = (html: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  const inline = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent || "").replace(/\u00a0/g, " ")
    if (node.nodeType !== Node.ELEMENT_NODE) return ""
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()
    const content = Array.from(el.childNodes).map(inline).join("")
    if (tag === "strong" || tag === "b") return `**${content}**`
    if (tag === "em" || tag === "i") return `*${content}*`
    if (tag === "u") return `<u>${content}</u>`
    if (tag === "s" || tag === "strike") return `~~${content}~~`
    if (tag === "code") return `\`${content}\``
    if (tag === "a") return `[${content || el.getAttribute("href") || ""}](${el.getAttribute("href") || ""})`
    if (tag === "br") return "\n"
    return content
  }

  const block = (node: Node, depth = 0): string => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent || "").trim()
    if (node.nodeType !== Node.ELEMENT_NODE) return ""
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()

    if (tag === "h1") return `# ${inline(el).trim()}`
    if (tag === "h2") return `## ${inline(el).trim()}`
    if (tag === "h3") return `### ${inline(el).trim()}`
    if (tag === "blockquote") {
      return inline(el)
        .split("\n")
        .map((x) => `> ${x.trim()}`)
        .join("\n")
    }
    if (tag === "ul") {
      return Array.from(el.children)
        .filter((x) => x.tagName.toLowerCase() === "li")
        .map((li) => `${"  ".repeat(depth)}- ${inline(li).trim()}`)
        .join("\n")
    }
    if (tag === "ol") {
      return Array.from(el.children)
        .filter((x) => x.tagName.toLowerCase() === "li")
        .map((li, idx) => `${"  ".repeat(depth)}${idx + 1}. ${inline(li).trim()}`)
        .join("\n")
    }
    if (tag === "pre") return `\`\`\`\n${(el.textContent || "").trim()}\n\`\`\``
    if (tag === "hr") return "---"
    if (tag === "img") return `![${el.getAttribute("alt") || "Gambar"}](${el.getAttribute("src") || ""})`
    if (tag === "p" || tag === "div") return inline(el).trim()

    const children = Array.from(el.childNodes).map((child) => block(child, depth)).filter(Boolean)
    return children.join("\n")
  }

  const md = Array.from(doc.body.childNodes).map((node) => block(node)).filter(Boolean).join("\n\n")
  return md.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
}

export default function WriterEditor({ initialArticle = null, onArticleSaved, onCancelEdit }: Props) {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const editorRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState<string[]>(categories)
  const [newCategory, setNewCategory] = useState("")
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [pendingLink, setPendingLink] = useState("")
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    category: "Keuangan & Bisnis",
    cover: "",
    labels: "",
    permalink: "",
    location: "",
    allowComments: true,
  })
  const [editorHtml, setEditorHtml] = useState("<p></p>")
  const isEditMode = Boolean(initialArticle?.id)

  useEffect(() => {
    if (!initialArticle?.id) {
      setFormData({
        title: "",
        category: "Keuangan & Bisnis",
        cover: "",
        labels: "",
        permalink: "",
        location: "",
        allowComments: true,
      })
      setEditorHtml("<p></p>")
      return
    }

    const raw = initialArticle.content || ""
    setFormData({
      title: initialArticle.title || "",
      category: initialArticle.category || "Keuangan & Bisnis",
      cover: initialArticle.cover || initialArticle.coverImage || "",
      labels: Array.isArray(initialArticle.tags) ? initialArticle.tags.join(", ") : "",
      permalink: initialArticle.slug || "",
      location: initialArticle.location || "",
      allowComments: initialArticle.allowComments !== false,
    })
    setEditorHtml(isHtmlContent(raw) ? sanitizeHtml(raw) : markdownToHtml(raw))
  }, [initialArticle?.id])

  useEffect(() => {
    const existing = (initialArticle?.category || "").trim()
    if (!existing) return
    setCategoryOptions((prev) => (prev.includes(existing) ? prev : [...prev, existing]))
  }, [initialArticle?.category])

  useEffect(() => {
    if (!editorRef.current) return
    if (editorRef.current.innerHTML !== editorHtml) editorRef.current.innerHTML = editorHtml
  }, [editorHtml])

  const plainTextCount = useMemo(() => {
    const temp = document.createElement("div")
    temp.innerHTML = editorHtml
    return (temp.textContent || "").trim()
  }, [editorHtml])

  const applyCommand = (command: string, value?: string) => {
    const el = editorRef.current
    if (!el) return
    el.focus()
    document.execCommand(command, false, value)
    setEditorHtml(sanitizeHtml(el.innerHTML))
  }

  const insertHtmlAtCursor = (html: string) => applyCommand("insertHTML", html)

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const html = e.clipboardData.getData("text/html")
    const plain = e.clipboardData.getData("text/plain")
    if (!html && !plain) return
    e.preventDefault()
    const next = html ? sanitizeHtml(html) : `<p>${plain.replace(/\n/g, "<br/>")}</p>`
    insertHtmlAtCursor(next)
  }

  const handleInlineImageUpload = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const src = String(event.target?.result || "")
      if (!src) return
      insertHtmlAtCursor(`<p><img src="${src}" alt="Gambar artikel" /></p>`)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (publish = false) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Akses ditolak",
        description: "Anda harus login terlebih dahulu.",
      })
      return
    }
    if (!formData.title.trim() || !plainTextCount.trim()) {
      toast({
        variant: "destructive",
        title: "Data belum lengkap",
        description: "Judul dan konten tidak boleh kosong.",
      })
      return
    }

    setIsSaving(true)
    try {
      const sanitized = sanitizeHtml(editorHtml)
      const markdown = htmlToMarkdown(sanitized)
      const labels = formData.labels
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
      const tags = Array.from(new Set([formData.category, ...labels]))

      const payload = {
        title: formData.title,
        category: formData.category,
        content: sanitized,
        contentMarkdown: markdown,
        excerpt: plainTextCount.length > 150 ? `${plainTextCount.slice(0, 150)}...` : plainTextCount,
        cover: formData.cover,
        author: userProfile?.displayName || "Penulis",
        status: publish ? "published" : "draft",
        tags,
        slug: formData.permalink.trim(),
        location: formData.location.trim(),
        allowComments: formData.allowComments,
      }

      if (isEditMode) await updateArticle(initialArticle.id, payload)
      else await createArticle(user.uid, payload)

      toast({
        title: publish ? "Artikel dipublikasikan" : "Draft tersimpan",
        description: publish
          ? "Artikel berhasil dipublikasikan."
          : "Perubahan artikel berhasil disimpan sebagai draft.",
      })
      setFormData({
        title: "",
        category: "Keuangan & Bisnis",
        cover: "",
        labels: "",
        permalink: "",
        location: "",
        allowComments: true,
      })
      setEditorHtml("<p></p>")
      onArticleSaved?.()
    } catch (error) {
      console.error("Error saving article:", error)
      toast({
        variant: "destructive",
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan saat menyimpan artikel.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddCategory = () => {
    const value = newCategory.trim()
    if (!value) return
    setCategoryOptions((prev) => (prev.includes(value) ? prev : [...prev, value]))
    setFormData((prev) => ({ ...prev, category: value }))
    setNewCategory("")
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="text-sm font-semibold text-slate-700">{isEditMode ? "Editor Artikel (Mode Edit)" : "Editor Artikel"}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSaving}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 disabled:opacity-50"
            >
              <Save className="w-4 h-4 inline mr-1" />
              {isEditMode ? "Update Draft" : "Simpan Draft"}
            </button>
            <button
              type="button"
              onClick={() => setIsPublishConfirmOpen(true)}
              disabled={isSaving}
              className="px-4 py-2 rounded-md bg-primary text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4 inline mr-1" />
              {isEditMode ? "Update & Publikasi" : "Publikasikan"}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 border-r border-slate-200">
            <div className="px-4 pt-4 pb-2">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Judul"
                className="w-full text-3xl font-semibold text-slate-900 placeholder:text-slate-400 border-0 border-b border-orange-300 focus:ring-0 focus:outline-none pb-2"
              />
            </div>

            <div className="px-4 py-2 border-y border-slate-200 bg-slate-50 flex flex-wrap items-center gap-1">
              <button type="button" onClick={() => applyCommand("undo")} className="p-2 rounded hover:bg-slate-200" title="Undo"><Undo2 className="w-4 h-4" /></button>
              <button type="button" onClick={() => applyCommand("redo")} className="p-2 rounded hover:bg-slate-200" title="Redo"><Redo2 className="w-4 h-4" /></button>
              <span className="w-px h-5 bg-slate-300 mx-1" />

              <select
                defaultValue="p"
                onChange={(e) => applyCommand("formatBlock", e.target.value)}
                className="px-2 py-1 rounded border border-slate-300 bg-white text-sm"
              >
                <option value="p">Normal</option>
                <option value="h1">Heading</option>
                <option value="h2">Subheading</option>
                <option value="h3">Minor heading</option>
                <option value="blockquote">Quote</option>
              </select>
              <span className="w-px h-5 bg-slate-300 mx-1" />

              <button type="button" onClick={() => applyCommand("bold")} className="p-2 rounded hover:bg-slate-200" title="Bold"><Bold className="w-4 h-4" /></button>
              <button type="button" onClick={() => applyCommand("italic")} className="p-2 rounded hover:bg-slate-200" title="Italic"><Italic className="w-4 h-4" /></button>
              <button type="button" onClick={() => applyCommand("underline")} className="p-2 rounded hover:bg-slate-200" title="Underline"><Underline className="w-4 h-4" /></button>
              <button type="button" onClick={() => applyCommand("strikeThrough")} className="p-2 rounded hover:bg-slate-200" title="Strike"><Strikethrough className="w-4 h-4" /></button>
              <button type="button" onClick={() => applyCommand("removeFormat")} className="p-2 rounded hover:bg-slate-200" title="Clear format"><Minus className="w-4 h-4" /></button>
              <span className="w-px h-5 bg-slate-300 mx-1" />

              <button type="button" onClick={() => applyCommand("insertUnorderedList")} className="p-2 rounded hover:bg-slate-200" title="Bullet list"><List className="w-4 h-4" /></button>
              <button type="button" onClick={() => applyCommand("insertOrderedList")} className="p-2 rounded hover:bg-slate-200" title="Numbered list"><ListOrdered className="w-4 h-4" /></button>
              <button type="button" onClick={() => applyCommand("formatBlock", "blockquote")} className="p-2 rounded hover:bg-slate-200" title="Quote"><Quote className="w-4 h-4" /></button>
              <span className="w-px h-5 bg-slate-300 mx-1" />

              <button type="button" onClick={() => applyCommand("justifyLeft")} className="p-2 rounded hover:bg-slate-200" title="Align left"><AlignLeft className="w-4 h-4" /></button>
              <button type="button" onClick={() => applyCommand("justifyCenter")} className="p-2 rounded hover:bg-slate-200" title="Align center"><AlignCenter className="w-4 h-4" /></button>
              <button type="button" onClick={() => applyCommand("justifyRight")} className="p-2 rounded hover:bg-slate-200" title="Align right"><AlignRight className="w-4 h-4" /></button>
              <button type="button" onClick={() => applyCommand("justifyFull")} className="p-2 rounded hover:bg-slate-200" title="Justify"><AlignJustify className="w-4 h-4" /></button>
              <span className="w-px h-5 bg-slate-300 mx-1" />

              <button
                type="button"
                onClick={() => {
                  setPendingLink("")
                  setIsLinkDialogOpen(true)
                }}
                className="p-2 rounded hover:bg-slate-200"
                title="Link"
              >
                <Link2 className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => applyCommand("unlink")} className="p-2 rounded hover:bg-slate-200" title="Unlink"><Unlink2 className="w-4 h-4" /></button>
              <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 rounded hover:bg-slate-200" title="Insert image"><ImagePlus className="w-4 h-4" /></button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleInlineImageUpload(e.target.files?.[0])}
              />
            </div>

            <div className="bg-slate-100 px-4 py-5">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setEditorHtml(sanitizeHtml((e.target as HTMLDivElement).innerHTML))}
                onPaste={handlePaste}
                className="mx-auto min-h-[680px] w-full max-w-[980px] bg-white border border-slate-200 rounded-md px-10 py-8 focus:outline-none"
                style={{ lineHeight: 1.75, fontSize: 18 }}
              />
            </div>
          </div>

          <aside className="bg-white p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-slate-700 font-semibold">Setelan postingan</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCategory()
                    }
                  }}
                  placeholder="Tambah kategori baru"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="h-9 px-2.5 rounded-md bg-primary text-white text-xs font-medium leading-none hover:bg-blue-700"
                >
                  Tambah
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Label</label>
              <input
                type="text"
                value={formData.labels}
                onChange={(e) => setFormData((prev) => ({ ...prev, labels: e.target.value }))}
                placeholder="Pisahkan dengan koma"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Permalink</label>
              <input
                type="text"
                value={formData.permalink}
                onChange={(e) => setFormData((prev) => ({ ...prev, permalink: e.target.value }))}
                placeholder="contoh: cara-mengelola-kas-koperasi"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Lokasi</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="contoh: Bandung"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Gambar Sampul</label>
              <label htmlFor="writer-cover-upload" className="block border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-primary transition cursor-pointer">
                {formData.cover ? (
                  <img src={formData.cover || "/placeholder.svg"} alt="Cover preview" className="w-full h-28 object-cover rounded-md" />
                ) : (
                  <div>
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Upload cover</p>
                  </div>
                )}
                <input
                  id="writer-cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (event) => setFormData((prev) => ({ ...prev, cover: event.target?.result as string }))
                    reader.readAsDataURL(file)
                  }}
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.allowComments}
                onChange={(e) => setFormData((prev) => ({ ...prev, allowComments: e.target.checked }))}
              />
              Izinkan komentar
            </label>

            <div className="text-xs text-slate-500 border-t border-slate-200 pt-3">
              {plainTextCount.length} karakter | {Math.max(1, Math.round(plainTextCount.split(/\s+/).filter(Boolean).length))} kata
            </div>

            {isEditMode && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="w-full px-4 py-2 rounded-md border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100"
              >
                Batal Edit
              </button>
            )}
          </aside>
        </div>
      </div>

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambahkan Tautan</DialogTitle>
            <DialogDescription>
              Masukkan URL untuk teks yang sedang dipilih di editor.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={pendingLink}
            onChange={(e) => setPendingLink(e.target.value)}
            placeholder="https://contoh.com"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                const href = pendingLink.trim()
                if (!href) {
                  toast({
                    variant: "destructive",
                    title: "URL kosong",
                    description: "Masukkan URL terlebih dahulu.",
                  })
                  return
                }
                applyCommand("createLink", href)
                setIsLinkDialogOpen(false)
              }}
            >
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isPublishConfirmOpen} onOpenChange={setIsPublishConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publikasikan artikel ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Artikel akan langsung tampil ke pembaca setelah dipublikasikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                setIsPublishConfirmOpen(false)
                void handleSubmit(true)
              }}
            >
              Ya, Publikasikan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
