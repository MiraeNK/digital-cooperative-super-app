"use client"

import { useEffect, useState } from "react"
import { Loader2, Mail, MapPin, User, Edit2, Save } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getWriterStats, updateUserProfileData } from "@/lib/firebase"

type Props = {
  refreshToken?: number
}

export default function WriterProfile({ refreshToken = 0 }: Props) {
  const { user, userProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [stats, setStats] = useState({ totalArticles: 0, totalViews: 0, totalLikes: 0, averageViewsPerArticle: 0 })
  const [formData, setFormData] = useState({
    displayName: "",
    address: "",
    expertise: "",
    bio: "",
  })

  useEffect(() => {
    setFormData({
      displayName: userProfile?.displayName || "",
      address: userProfile?.address || "",
      expertise: userProfile?.expertise || "",
      bio: userProfile?.bio || "",
    })
  }, [userProfile])

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.uid) {
        setStats({ totalArticles: 0, totalViews: 0, totalLikes: 0, averageViewsPerArticle: 0 })
        setIsLoadingStats(false)
        return
      }
      setIsLoadingStats(true)
      try {
        const writerStats = await getWriterStats(user.uid)
        setStats(writerStats)
      } catch (error) {
        console.error("Error loading writer stats:", error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    loadStats()
  }, [user?.uid, refreshToken])

  const handleSave = async () => {
    if (!user?.uid) return
    setIsSaving(true)
    try {
      await updateUserProfileData(user.uid, {
        displayName: formData.displayName.trim(),
        address: formData.address.trim(),
        expertise: formData.expertise.trim(),
        bio: formData.bio.trim(),
      })
      setIsEditing(false)
      alert("Profil penulis berhasil diperbarui.")
    } catch (error) {
      console.error("Error updating writer profile:", error)
      alert("Gagal memperbarui profil.")
    } finally {
      setIsSaving(false)
    }
  }

  const initials = (formData.displayName || userProfile?.displayName || "W").charAt(0).toUpperCase()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Profil Penulis</h1>
        <p className="text-slate-600">Kelola informasi profil penulis Anda</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white font-bold text-4xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">{userProfile?.displayName || "Penulis"}</h2>
            <p className="text-slate-600 mb-4 capitalize">{userProfile?.role || "writer"}</p>
            {isEditing ? (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Profil
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profil
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-slate-400" />
              <label className="text-sm font-semibold text-slate-700">Email</label>
            </div>
            <p className="text-slate-900">{userProfile?.email || "-"}</p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-slate-400" />
              <label className="text-sm font-semibold text-slate-700">Nama Tampilan</label>
            </div>
            {isEditing ? (
              <input
                value={formData.displayName}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <p className="text-slate-900">{formData.displayName || "-"}</p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-slate-400" />
              <label className="text-sm font-semibold text-slate-700">Lokasi</label>
            </div>
            {isEditing ? (
              <input
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <p className="text-slate-900">{formData.address || "-"}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Bidang Keahlian</label>
            {isEditing ? (
              <input
                value={formData.expertise}
                onChange={(e) => setFormData((prev) => ({ ...prev, expertise: e.target.value }))}
                placeholder="Contoh: Keuangan, Pertanian, Teknologi"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <p className="text-slate-900">{formData.expertise || "-"}</p>
            )}
          </div>
        </div>

        <div className="pt-6">
          <label className="text-sm font-semibold text-slate-700 block mb-2">Bio</label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <p className="text-slate-700">{formData.bio || "Belum ada bio."}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Statistik Penulis</h3>
        {isLoadingStats ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat statistik...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary mb-1">{stats.totalArticles}</p>
              <p className="text-sm text-slate-600">Total Artikel</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary mb-1">{(stats.totalViews || 0).toLocaleString("id-ID")}</p>
              <p className="text-sm text-slate-600">Total Dibaca</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary mb-1">{stats.averageViewsPerArticle}</p>
              <p className="text-sm text-slate-600">Rata-rata Dibaca/Artikel</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
