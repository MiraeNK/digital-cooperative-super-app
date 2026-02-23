"use client"

import { BarChart3, TrendingUp, Package, Users, Settings, CheckCircle, FileText, UserCircle, MessageSquare } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  activePage: string
  onPageChange: (page: string) => void
}

const adminPages = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "kyc", label: "Member Approval (KYC)", icon: CheckCircle },
  { id: "community", label: "Community Posts", icon: MessageSquare },
  { id: "marketing", label: "Digital Marketing", icon: TrendingUp },
  { id: "content", label: "Content Manager", icon: FileText },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "members", label: "Data Anggota", icon: Users },
  { id: "settings", label: "Pengaturan", icon: Settings },
]

// Opsional: Jika member juga punya menu sidebar di masa depan
const memberPages = [
  { id: "profile", label: "Profil Saya", icon: UserCircle },
  { id: "settings", label: "Pengaturan Akun", icon: Settings },
]

export default function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { userProfile, user } = useAuth() // Ambil data user yang login

  // Tentukan menu berdasarkan role
  // Jika admin -> pakai menu admin, jika member -> pakai menu member (atau kosong jika belum ada)
  const menuItems = userProfile?.role === "admin" ? adminPages : memberPages

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900 shadow-sm"
        >
          {isOpen ? "Sembunyikan Menu" : "Buka Menu"}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`lg:w-64 bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${isOpen ? "block" : "hidden lg:block"} lg:h-fit lg:sticky lg:top-28`}
      >
        {/* --- USER PROFILE SECTION (BARU) --- */}
        <div className="mb-6 flex items-center gap-3 pb-6 border-b border-slate-100">
          <Avatar className="h-10 w-10 border border-slate-100">
            <AvatarImage src={user?.photoURL || ""} />
            <AvatarFallback className="bg-primary text-white font-bold">
              {userProfile?.displayName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">
              {userProfile?.displayName || "Pengguna"}
            </p>
            <p className="text-xs text-slate-500 font-medium capitalize truncate">
              {userProfile?.role || "Member"}
            </p>
          </div>
        </div>

        {/* --- NAVIGATION MENU --- */}
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Menu {userProfile?.role === "admin" ? "Admin" : "Anggota"}
        </h2>
        
        <nav className="space-y-1">
          {menuItems.map((page) => {
            const Icon = page.icon
            const isActive = activePage === page.id
            return (
              <button
                key={page.id}
                onClick={() => {
                  onPageChange(page.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-blue-200 font-medium" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className="text-sm">{page.label}</span>
                
                {/* Badge Notifikasi Khusus Admin (KYC) */}
                {page.id === "kyc" && userProfile?.role === "admin" && (
                   <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-yellow-400 text-yellow-900' : 'bg-red-100 text-red-600'}`}>
                     2
                   </span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}