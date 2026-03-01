"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Users, FileText, Heart, ArrowRight } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { searchUsers, getAllMembers } from "@/lib/firebase"

export default function MembersDiscoveryPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [searchTerm, setSearchTerm] = useState("")
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<"all" | "writer" | "member">("all")

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true)
      try {
        const allMembers = await getAllMembers()
        setMembers(allMembers)
      } catch (error) {
        console.error("Error fetching members:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (term.trim() === "") {
      const allMembers = await getAllMembers()
      setMembers(allMembers)
    } else {
      const results = await searchUsers(term)
      setMembers(results)
    }
  }

  const filteredMembers = members.filter((member) => {
    if (selectedRole === "writer") return member.role === "writer"
    if (selectedRole === "member") return member.role === "member"
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Temukan Anggota</h1>
        <p className="text-slate-600">Jelajahi komunitas koperasi dan hubungkan dengan anggota lain</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 text-slate-900"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedRole("all")}
          className={`px-4 py-2 rounded-full font-semibold transition whitespace-nowrap ${
            selectedRole === "all"
              ? "bg-primary text-white"
              : "bg-white text-primary border-2 border-primary hover:bg-blue-50"
          }`}
        >
          Semua Anggota
        </button>
        <button
          onClick={() => setSelectedRole("writer")}
          className={`px-4 py-2 rounded-full font-semibold transition whitespace-nowrap ${
            selectedRole === "writer"
              ? "bg-primary text-white"
              : "bg-white text-primary border-2 border-primary hover:bg-blue-50"
          }`}
        >
          ✍️ Penulis
        </button>
        <button
          onClick={() => setSelectedRole("member")}
          className={`px-4 py-2 rounded-full font-semibold transition whitespace-nowrap ${
            selectedRole === "member"
              ? "bg-primary text-white"
              : "bg-white text-primary border-2 border-primary hover:bg-blue-50"
          }`}
        >
          👤 Anggota
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Tidak ada anggota ditemukan</p>
          <p className="text-slate-500 text-sm">Coba ubah filter pencarian Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => router.push(`/profile/${member.id}`)}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer border-l-4 border-primary"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {member.displayName?.charAt(0).toUpperCase() || "A"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 mb-1 truncate">{member.displayName || "Anggota"}</h3>
                    {member.role === "writer" && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-primary rounded text-xs font-semibold">
                        Penulis
                      </span>
                    )}
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
              </div>

              {/* Email */}
              <p className="text-sm text-slate-600 mb-4 truncate">{member.email}</p>

              {/* Bio */}
              {member.bio && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{member.bio}</p>
              )}

              {/* Stats Row */}
              <div className="flex gap-4 pt-4 border-t border-slate-200">
                <div className="flex-1">
                  <div className="text-lg font-bold text-primary">0</div>
                  <div className="text-xs text-slate-600">Teman</div>
                </div>
                {member.role === "writer" && (
                  <>
                    <div className="flex-1">
                      <div className="text-lg font-bold text-primary">0</div>
                      <div className="text-xs text-slate-600">Artikel</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-bold text-primary">0</div>
                      <div className="text-xs text-slate-600">Suka</div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Button */}
              {user?.uid !== member.id && (
                <button className="w-full mt-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm">
                  Lihat Profil
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
