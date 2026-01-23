"use client"

import { BarChart3, TrendingUp, Package, Users, Settings, CheckCircle, FileText } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  activePage: string
  onPageChange: (page: string) => void
}

const pages = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "kyc", label: "Member Approval (KYC)", icon: CheckCircle },
  { id: "marketing", label: "Digital Marketing", icon: TrendingUp },
  { id: "content", label: "Content Manager", icon: FileText },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "members", label: "Data Anggota", icon: Users },
  { id: "settings", label: "Pengaturan", icon: Settings },
]

export default function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900"
        >
          {isOpen ? "Sembunyikan Menu" : "Buka Menu"}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`lg:w-64 bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${isOpen ? "block" : "hidden lg:block"} lg:h-fit lg:sticky lg:top-28`}
      >
        <h2 className="text-lg font-bold text-slate-900 mb-4">Menu Admin</h2>
        <nav className="space-y-2">
          {pages.map((page) => {
            const Icon = page.icon
            const isActive = activePage === page.id
            return (
              <button
                key={page.id}
                onClick={() => {
                  onPageChange(page.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-primary text-white shadow-md" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{page.label}</span>
                {page.id === "kyc" && isActive && (
                  <span className="ml-auto text-xs bg-yellow-300 text-slate-900 font-bold px-2 py-1 rounded">2</span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
