"use client"

import { Home, ShoppingBag, ArrowRightLeft, User, Users, BookOpen, Search } from "lucide-react"
import { useRouter } from "next/navigation"

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  sidebarExpanded?: boolean
}

export default function BottomNavigation({ activeTab, onTabChange, sidebarExpanded = true }: BottomNavigationProps) {
  const router = useRouter()
  
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "shop", label: "Toko", icon: ShoppingBag },
    { id: "transactions", label: "Transaksi", icon: ArrowRightLeft },
    { id: "community", label: "Komunitas", icon: Users },
    { id: "profile", label: "Profil", icon: User },
  ]

  const externalLinks = [
    { id: "articles", label: "Artikel", icon: BookOpen, href: "/app/articles" },
    { id: "members", label: "Anggota", icon: Users, href: "/app/members" },
  ]

  return (
    <nav className="flex items-center justify-around lg:flex-col lg:gap-2 w-full">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex lg:w-full flex-col lg:flex-row lg:items-center lg:gap-3 items-center justify-center lg:justify-start py-3 lg:px-4 lg:py-3 transition-colors rounded-lg ${
              isActive
                ? "text-white bg-primary lg:bg-primary lg:text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 lg:text-slate-700 lg:hover:bg-slate-100"
            }`}
          >
            <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? "text-white" : "text-current"}`} />
            {(typeof window === "undefined" || window.innerWidth >= 1024) && sidebarExpanded ? (
              <span className="text-xs lg:text-sm font-semibold mt-1 lg:mt-0">{tab.label}</span>
            ) : (
              <span className="text-xs lg:hidden font-semibold mt-1">{tab.label}</span>
            )}
          </button>
        )
      })}
      
      {/* External Navigation Links - Only on Desktop */}
      <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:mt-4 lg:pt-4 lg:border-t lg:border-slate-200 w-full">
        {externalLinks.map((link) => {
          const Icon = link.icon
          return (
            <button
              key={link.id}
              onClick={() => router.push(link.href)}
              className="flex lg:w-full flex-col lg:flex-row lg:items-center lg:gap-3 items-center justify-center lg:justify-start py-3 lg:px-4 lg:py-3 transition-colors rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <Icon className="w-6 h-6 flex-shrink-0 text-slate-600" />
              {sidebarExpanded && <span className="text-xs lg:text-sm font-semibold mt-1 lg:mt-0">{link.label}</span>}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
