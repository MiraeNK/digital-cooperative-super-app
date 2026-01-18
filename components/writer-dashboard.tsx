"use client"

import { useState } from "react"
import { PenTool, BarChart3, BookOpen, User, Menu, X } from "lucide-react"
import WriterBottomNav from "./writer/writer-bottom-nav"
import WriterStats from "./writer/writer-stats"
import WriterArticleList from "./writer/writer-article-list"
import WriterEditor from "./writer/writer-editor"
import WriterProfile from "./writer/writer-profile"

export function WriterDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-64 lg:bg-white lg:border-r lg:border-slate-200 lg:flex lg:flex-col lg:z-40">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-primary">WriterHub</h1>
          <p className="text-xs text-slate-500 mt-1">Content Management System</p>
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
                onClick={() => setActiveTab(item.id)}
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
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button className="w-full px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition text-sm font-semibold">
            Logout
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
      <div className="lg:ml-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "dashboard" && <WriterStats />}
          {activeTab === "articles" && <WriterArticleList />}
          {activeTab === "write" && <WriterEditor />}
          {activeTab === "profile" && <WriterProfile />}
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <WriterBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
