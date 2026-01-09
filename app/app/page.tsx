"use client"

import { useState } from "react"
import { Monitor, Smartphone } from "lucide-react"
import { MemberApp } from "@/components/member-app"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AppPage() {
  const [viewMode, setViewMode] = useState<"member" | "admin">("member")

  return (
    <div className="min-h-screen bg-background">
      {/* Mode Switcher */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Koperasi 4.0</h1>
            <div className="flex items-center gap-2 bg-muted p-1 rounded-full">
              <button
                onClick={() => setViewMode("member")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                  viewMode === "member"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Smartphone size={18} />
                <span className="hidden sm:inline">Member App</span>
              </button>
              <button
                onClick={() => setViewMode("admin")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                  viewMode === "admin"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor size={18} />
                <span className="hidden sm:inline">Admin Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="min-h-[calc(100vh-80px)]">{viewMode === "member" ? <MemberApp /> : <AdminDashboard />}</div>
    </div>
  )
}
