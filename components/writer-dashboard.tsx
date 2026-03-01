"use client"

import { useState } from "react"
import { PenTool, BarChart3, BookOpen, User, Menu, X, ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { auth } from "@/lib/firebase"
import WriterBottomNav from "./writer/writer-bottom-nav"
import WriterStats from "./writer/writer-stats"
import WriterArticleList from "./writer/writer-article-list"
import WriterEditor from "./writer/writer-editor"
import WriterProfile from "./writer/writer-profile"

export function WriterDashboard() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const [editingArticle, setEditingArticle] = useState<any | null>(null)
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(true)

  const triggerRefresh = () => setRefreshToken((prev) => prev + 1)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/auth")
    } catch (error) {
      console.error("Error logout writer:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:fixed lg:left-0 lg:top-20 lg:bottom-0 lg:bg-white lg:border-r lg:border-slate-200 lg:flex lg:flex-col lg:z-40 lg:transition-all lg:duration-300 ${desktopSidebarExpanded ? "lg:w-64" : "lg:w-20"}`}>
        <div className={`border-b border-slate-200 ${desktopSidebarExpanded ? "p-6" : "p-4"}`}>
          {desktopSidebarExpanded ? (
            <>
              <h1 className="text-2xl font-bold text-primary">WriterHub</h1>
              <p className="text-xs text-slate-500 mt-1">{userProfile?.displayName || "Content Management System"}</p>
            </>
          ) : (
            <h1 className="text-xl font-bold text-primary text-center">W</h1>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "articles", label: "Artikel Saya", icon: BookOpen },
            { id: "write", label: "Tulis Artikel", icon: PenTool },
            { id: "profile", label: "Profil", icon: User },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  if (item.id === "write") setEditingArticle(null)
                }}
                className={`w-full flex items-center ${desktopSidebarExpanded ? "gap-3 px-4 justify-start" : "justify-center px-2"} py-3 rounded-lg transition ${
                  activeTab === item.id
                    ? "bg-primary text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {desktopSidebarExpanded && <span className="font-semibold text-sm">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => setDesktopSidebarExpanded((prev) => !prev)}
            className="w-full mb-2 h-10 inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title={desktopSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {desktopSidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <button
            onClick={handleLogout}
            className="w-full h-10 inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 bg-white border-b border-slate-200 z-30">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold text-primary">WriterHub</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {sidebarOpen && (
          <div className="px-4 py-4 space-y-2 border-t border-slate-200">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "articles", label: "Artikel Saya", icon: BookOpen },
              { id: "write", label: "Tulis Artikel", icon: PenTool },
              { id: "profile", label: "Profil", icon: User },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    if (item.id === "write") setEditingArticle(null)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition justify-start ${
                    activeTab === item.id
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${desktopSidebarExpanded ? "lg:ml-64" : "lg:ml-20"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "dashboard" && <WriterStats refreshToken={refreshToken} />}
          {activeTab === "articles" && (
            <WriterArticleList
              refreshToken={refreshToken}
              onArticleChanged={triggerRefresh}
              onEditArticle={(article) => {
                setEditingArticle(article)
                setActiveTab("write")
              }}
            />
          )}
          {activeTab === "write" && (
            <WriterEditor
              initialArticle={editingArticle}
              onCancelEdit={() => setEditingArticle(null)}
              onArticleSaved={() => {
                triggerRefresh()
                setEditingArticle(null)
                setActiveTab("articles")
              }}
            />
          )}
          {activeTab === "profile" && <WriterProfile refreshToken={refreshToken} />}
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <WriterBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab === "write") setEditingArticle(null)
        }}
      />
    </div>
  )
}
