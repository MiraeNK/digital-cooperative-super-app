"use client"

import React from "react"

import { useState } from "react"
import { Upload, Save, Send } from "lucide-react"

export default function WriterEditor() {
  const [formData, setFormData] = useState({
    title: "",
    category: "Keuangan & Bisnis",
    content: "",
    cover: "",
  })

  const categories = ["Keuangan & Bisnis", "Hasil Tani", "Kesehatan", "Teknologi"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting article:", formData)
    alert("Artikel berhasil disimpan!")
    setFormData({ title: "", category: "Keuangan & Bisnis", content: "", cover: "" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Tulis Artikel</h1>
        <p className="text-slate-600">Buat artikel berkualitas untuk komunitas Anda</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image Upload */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-4">Gambar Sampul (Cover)</label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary transition cursor-pointer">
            {formData.cover ? (
              <div>
                <img src={formData.cover || "/placeholder.svg"} alt="Cover preview" className="w-full h-32 object-cover rounded-lg mb-3" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, cover: "" })}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Ubah Gambar
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">
                  <span className="text-primary font-semibold">Klik untuk upload</span> atau drag file gambar
                </p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG (Max 5MB)</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    setFormData({ ...formData, cover: event.target?.result as string })
                  }
                  reader.readAsDataURL(file)
                }
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Title */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Artikel</label>
          <input
            type="text"
            placeholder="Masukkan judul artikel yang menarik..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg font-semibold"
            required
          />
        </div>

        {/* Category */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Isi Artikel</label>
          <textarea
            placeholder="Tulis konten artikel Anda di sini..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-48 sm:h-64 resize-none font-mono text-sm"
            required
          />
          <p className="text-xs text-slate-500 mt-2">
            {formData.content.length} karakter | {Math.ceil(formData.content.length / 5)} kata
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition active:scale-95"
          >
            <Save className="w-5 h-5" />
            Simpan sebagai Draft
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition active:scale-95"
          >
            <Send className="w-5 h-5" />
            Terbitkan Sekarang
          </button>
        </div>
      </form>
    </div>
  )
}
