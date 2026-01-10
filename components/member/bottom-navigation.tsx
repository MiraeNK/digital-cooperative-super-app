"use client"

import { Home, ShoppingBag, ArrowRightLeft, User, Users } from "lucide-react"

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "shop", label: "Toko", icon: ShoppingBag },
    { id: "transactions", label: "Transaksi", icon: ArrowRightLeft },
    { id: "community", label: "Komunitas", icon: Users },
    { id: "profile", label: "Profil", icon: User },
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
            className={`flex lg:w-full flex-col lg:flex-row lg:items-center lg:gap-3 items-center justify-center py-3 lg:px-4 lg:py-3 transition-colors rounded-lg ${
              isActive
                ? "text-primary bg-blue-50 lg:bg-primary lg:text-white"
                : "text-slate-600 hover:text-slate-900 lg:text-slate-700 lg:hover:bg-slate-100"
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />
            <span className="text-xs lg:text-sm font-semibold mt-1 lg:mt-0">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
