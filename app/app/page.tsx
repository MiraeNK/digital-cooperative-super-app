"use client"

import { useState, useEffect } from "react"
import { Monitor, Smartphone, LogOut, PenTool, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"

// Import Dashboard Components
import { MemberApp } from "@/components/member-app"
import { AdminDashboard } from "@/components/admin-dashboard"
import { WriterDashboard } from "@/components/writer-dashboard"

export default function AppPage() {
  const router = useRouter()
  const { userProfile, loading, user } = useAuth()
  
  // State untuk mengontrol tampilan yang sedang aktif (bukan role user)
  // Default 'member' agar aman
  const [currentView, setCurrentView] = useState<"member" | "admin" | "writer">("member")

  // 1. Cek Login & Redirect
  useEffect(() => {
    // Redirect to auth only when auth check finished and there's no authenticated user
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [loading, user, router])

  // 2. Fungsi Logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/auth")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // 3. Loading State (Tampilkan spinner di tengah layar kosong)
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    )
  }

  // Ambil role dari profile jika tersedia, fallback ke 'member' saat profile belum ada
  const role = (userProfile && userProfile.role) ? userProfile.role : "member"

  return (
    <div className="min-h-screen bg-background">

      {/* Header with Mode Switcher (UI EXACT MATCH) */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        {/* FIX: Menggunakan h-20 sesuai request agar lega */}
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* KIRI: Logo & Badge Role */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                K
              </div>
              <h1 className="text-2xl font-bold text-foreground hidden sm:block">Koperasi 4.0</h1>
            </div>
            
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary uppercase">
              {role}
            </span>
          </div>

          {/* KANAN: Switcher & Logout */}
          <div className="flex items-center gap-4">
            
            {/* Mode Switcher (Tab Style) */}
            {/* Logic: Hanya tampilkan tombol jika user memiliki hak akses */}
            <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
              
              {/* 1. TOMBOL MEMBER (Semua role boleh akses) */}
              <button
                onClick={() => setCurrentView("member")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  currentView === "member"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Smartphone size={18} />
                <span>Member</span>
              </button>

              {/* 2. TOMBOL ADMIN (Hanya Role Admin) */}
              {role === "admin" && (
                <button
                  onClick={() => setCurrentView("admin")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    currentView === "admin"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Monitor size={18} />
                  <span>Admin</span>
                </button>
              )}

              {/* 3. TOMBOL WRITER (Role Writer DAN Admin boleh akses) */}
              {(role === "writer" || role === "admin") && (
                <button
                  onClick={() => setCurrentView("writer")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    currentView === "writer"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <PenTool size={18} />
                  <span>Writer</span>
                </button>
              )}
            </div>

            {/* Divider Vertical */}
            <div className="h-8 w-px bg-border hidden sm:block" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md transition font-medium text-sm"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="min-h-[calc(100vh-80px)]">
        {currentView === "member" && <MemberApp />}
        
        {/* Validasi render: Pastikan user berhak melihat view ini */}
        {currentView === "admin" && role === "admin" && <AdminDashboard />}
        {currentView === "writer" && (role === "writer" || role === "admin") && <WriterDashboard />}
      </div>
    </div>
  )
}