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
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary">Koperasi 4.0</h1>
              <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold">
                {role === "member" ? "Member" : role === "admin" ? "Admin" : "Writer"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Mode Switcher */}
              <div className="hidden sm:flex items-center gap-2 bg-muted p-1 rounded-full">
                <button
                  onClick={() => setRole("member")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                    role === "member"
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone size={18} />
                  <span className="hidden sm:inline">Member</span>
                </button>
                <button
                  onClick={() => setRole("admin")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                    role === "admin" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Monitor size={18} />
                  <span className="hidden sm:inline">Admin</span>
                </button>
                <button
                  onClick={() => setRole("writer")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                    role === "writer" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <PenTool size={18} />
                  <span className="hidden sm:inline">Writer</span>
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-semibold text-sm"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
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
