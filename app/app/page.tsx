"use client"

import { useState, useEffect } from "react"
import { Monitor, Smartphone, LogOut, PenTool } from "lucide-react"
import { MemberApp } from "@/components/member-app"
import { AdminDashboard } from "@/components/admin-dashboard"
import { WriterDashboard } from "@/components/writer-dashboard"
import { useRouter } from "next/navigation"

export default function AppPage() {
  const router = useRouter()
  const [role, setRole] = useState<"member" | "admin" | "writer">("member")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const params = new URLSearchParams(window.location.search)
    const roleParam = params.get("role")
    if (roleParam === "admin") {
      setRole("admin")
    } else if (roleParam === "writer") {
      setRole("writer")
    }
  }, [])

  if (!isClient) return null

  const handleLogout = () => {
    router.push("/auth")
  }

  return (
    <div className="min-h-screen bg-background">

 {/* Header with Mode Switcher */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        {/* FIX: Ubah h-16 menjadi h-20 agar lebih tinggi dan lega */}
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* KIRI: Logo & Badge Role */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                K
              </div>
              <h1 className="text-2xl font-bold text-foreground hidden sm:block">Koperasi 4.0</h1>
            </div>
            
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
              {role === "member" ? "Member View" : role === "admin" ? "Admin View" : "Writer View"}
            </span>
          </div>

          {/* KANAN: Switcher & Logout */}
          <div className="flex items-center gap-4">
            {/* Mode Switcher (Tab Style) */}
            <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
              <button
                onClick={() => setRole("member")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  role === "member"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Smartphone size={18} />
                <span>Member</span>
              </button>
              <button
                onClick={() => setRole("admin")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  role === "admin"
                     ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Monitor size={18} />
                <span>Admin</span>
              </button>
              <button
                onClick={() => setRole("writer")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  role === "writer"
                     ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <PenTool size={18} />
                <span>Writer</span>
              </button>
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
        {role === "member" ? <MemberApp /> : role === "admin" ? <AdminDashboard /> : <WriterDashboard />}
      </div>
    </div>
  )
}
