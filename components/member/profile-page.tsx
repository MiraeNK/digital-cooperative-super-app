"use client"

import { User, Mail, Phone, MapPin, LogOut, Settings, ShieldCheck, AlertTriangle, Loader2, Save, Users, Search, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { updateUserProfileData, generateMemberId, auth, getAllMembers, searchUsers } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "members">("profile")
  const [members, setMembers] = useState<any[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<"all" | "writer" | "member">("all")
  
  // State Form Data
  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    address: "",
    nik: "", // Field khusus KYC
  })

  // --- 1. SINKRONISASI DATA & ADMIN AUTO-ID ---
  useEffect(() => {
    if (userProfile) {
      // Masukkan data firebase ke form
      setFormData({
        displayName: userProfile.displayName || "",
        phoneNumber: userProfile.phoneNumber || "",
        address: userProfile.address || "",
        nik: userProfile.nik || "",
      })

      // LOGIKA KHUSUS ADMIN:
      // Jika Admin belum punya Member ID, buatkan otomatis sekarang juga!
      if (userProfile.role === "admin" && !userProfile.memberId) {
        const newId = generateMemberId("admin");
        updateUserProfileData(user!.uid, { memberId: newId }); // Simpan di background
      }
    }
  }, [userProfile, user])

  // Fetch members when tab changes to members
  useEffect(() => {
    if (activeTab === "members") {
      fetchMembers()
    }
  }, [activeTab])

  const fetchMembers = async () => {
    setIsLoadingMembers(true)
    try {
      const allMembers = await getAllMembers()
      setMembers(allMembers)
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setIsLoadingMembers(false)
    }
  }

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
    if (selectedRole === "writer") return (member as any)?.role === "writer"
    if (selectedRole === "member") return (member as any)?.role === "member"
    return true
  })

  // --- 2. LOGIKA LOGOUT ---
  const handleLogout = async () => {
    await signOut(auth)
    router.push("/auth")
  }

  // --- 3. LOGIKA SIMPAN PROFIL ---
  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Data yang akan disimpan
      const updateData: any = {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      }

      // Jika sedang mode KYC (isi NIK), update status jadi pending
      if (formData.nik && formData.nik.length >= 16 && userProfile?.verificationStatus === 'unverified') {
        updateData.nik = formData.nik;
        updateData.verificationStatus = 'pending'; // Trigger verifikasi
      }

      await updateUserProfileData(user!.uid, updateData)
      setIsEditing(false)
      alert("Profil berhasil disimpan!")
      
      // Refresh halaman jika mengajukan verifikasi agar status berubah
      if (updateData.verificationStatus === 'pending') {
        window.location.reload()
      }

    } catch (error) {
      console.error(error)
      alert("Gagal menyimpan data.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!userProfile) return <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin" /></div>

  // Cek Status
  const role = userProfile.role || "member";
  const status = userProfile.verificationStatus || "unverified";
  const isVerified = status === "verified";
  const isPending = status === "pending";
  
  // Tentukan apakah ID boleh muncul
  // Admin -> Selalu Muncul
  // Member -> Hanya jika Verified
  const showMemberId = role === "admin" || isVerified;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-20 px-3 sm:px-4 md:px-0">
      
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Profil Saya</h2>
        
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md font-semibold text-xs sm:text-sm transition ${
              activeTab === "profile"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1 ${
              activeTab === "members"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Anggota</span>
            <span className="sm:hidden">Anggota</span>
          </button>
        </div>
      </div>

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
      <>
      {/* --- PROFILE CARD (UI ASLI ANDA) --- */}
      <div className="bg-gradient-to-br from-primary to-blue-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background Pattern Hiasan */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">{userProfile.displayName || "Pengguna"}</h3>
            
            {/* LOGIKA TAMPILAN ID */}
            {showMemberId ? (
              <p className="text-blue-100 font-mono tracking-wide opacity-90">
                Member ID: {userProfile.memberId || "Generating..."}
              </p>
            ) : (
              <div className="flex items-center gap-2 text-yellow-200 bg-white/10 px-2 py-1 rounded-md mt-1 text-xs sm:text-sm w-fit">
                <AlertTriangle size={14} />
                <span>Belum Terverifikasi (ID Tersembunyi)</span>
              </div>
            )}

            <div className="mt-1">
               <span className="text-xs uppercase bg-white/20 px-2 py-0.5 rounded text-white font-semibold tracking-wider">
                 {role}
               </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
          <div>
            <p className="text-xs sm:text-sm text-blue-100 mb-1">Saldo Tabungan</p>
            <p className="text-lg sm:text-xl font-bold">
              {/* Format Rupiah */}
              Rp {(userProfile.balance || 0).toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-blue-100 mb-1">Poin Reward</p>
            <p className="text-lg sm:text-xl font-bold">
              {(userProfile.points || 0).toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-blue-100 mb-1">Status Akun</p>
            <div className="flex items-center gap-1">
              {role === 'admin' || isVerified ? (
                 <>
                   <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                   <p className="text-lg sm:text-xl font-bold">Aktif</p>
                 </>
              ) : (
                 <p className="text-lg sm:text-xl font-bold text-yellow-300 capitalize">{status}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- KYC ALERT SECTION (JIKA BELUM VERIF) --- */}
      {role === 'member' && !isVerified && (
        <div className={`border rounded-xl p-4 flex items-start gap-4 ${isPending ? 'bg-yellow-50 border-yellow-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className={`p-2 rounded-full ${isPending ? 'bg-yellow-100 text-yellow-600' : 'bg-orange-100 text-orange-600'}`}>
            <ShieldCheck size={24} />
          </div>
          <div>
             <h4 className={`font-bold ${isPending ? 'text-yellow-800' : 'text-orange-800'}`}>
               {isPending ? "Verifikasi Sedang Diproses" : "Verifikasi Identitas Diperlukan"}
             </h4>
             <p className={`text-sm mt-1 ${isPending ? 'text-yellow-700' : 'text-orange-700'}`}>
               {isPending 
                 ? "Admin sedang meninjau data Anda. Mohon tunggu 1x24 Jam." 
                 : "Untuk mendapatkan Member ID dan membuka fitur Toko/Deposit, silakan lengkapi NIK pada formulir di bawah ini."}
             </p>
          </div>
        </div>
      )}

      {/* --- DETAILS FORM --- */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Informasi Pribadi</h3>
          
          {/* Tombol Toggle Edit/Simpan */}
          {isEditing ? (
             <button
               onClick={handleSave}
               disabled={isLoading}
               className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
             >
               {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <Save size={16}/>}
               Simpan
             </button>
          ) : (
             <button
               onClick={() => setIsEditing(true)}
               className="text-sm font-semibold text-primary hover:text-blue-700 transition"
             >
               Edit Profil
             </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Mail size={16} /> Email (Tidak dapat diubah)
            </label>
            <input
              type="email"
              value={userProfile.email || ""}
              disabled={true}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Phone size={16} /> No. HP
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              disabled={!isEditing}
              placeholder="08..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <MapPin size={16} /> Alamat
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              disabled={!isEditing}
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* FIELD KHUSUS KYC (HANYA MUNCUL JIKA MEMBER & BELUM VERIF) */}
          {role === 'member' && !isVerified && (
            <div className={`p-4 rounded-lg border-2 border-dashed ${isEditing ? 'border-primary/50 bg-blue-50' : 'border-slate-200'}`}>
              <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary"/> 
                Verifikasi Identitas (NIK KTP)
              </label>
              
              {isPending ? (
                 <p className="text-sm text-yellow-700 font-medium">NIK: {formData.nik} (Sedang Diverifikasi)</p>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Masukkan 16 Digit NIK KTP Asli"
                    value={formData.nik}
                    onChange={(e) => setFormData({...formData, nik: e.target.value})}
                    disabled={!isEditing}
                    maxLength={16}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                  />
                  {isEditing && (
                    <p className="text-xs text-slate-500">
                      *Mengisi NIK akan otomatis mengajukan verifikasi akun ke Admin.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Security */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Keamanan</h3>
        <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition text-slate-700 font-semibold">
          <Settings size={18} />
          Ubah Password (Kirim Reset Email)
        </button>
      </div>

      {/* Actions */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition text-red-700 font-semibold"
      >
        <LogOut size={18} />
        Keluar
      </button>
      </>
      )}

      {/* MEMBERS TAB */}
      {activeTab === "members" && (
      <>
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

      {/* Members Grid */}
      {isLoadingMembers ? (
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
      </>
      )}
    </div>
  )
}
