"use client"

import { BarChart3, BookOpen, PenTool, User } from "lucide-react"

interface WriterBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function WriterBottomNav({ activeTab, onTabChange }: WriterBottomNavProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "articles", label: "Artikel", icon: BookOpen },
    { id: "write", label: "Tulis", icon: PenTool },
    { id: "profile", label: "Profil", icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden z-40">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                isActive
                  ? "text-primary bg-blue-50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />
              <span className="text-xs font-semibold mt-1">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
