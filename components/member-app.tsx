"use client"

import { useState } from "react"
import BalanceCard from "./member/balance-card"
import ActionButtons from "./member/action-buttons"
import PPOBGrid from "./member/ppob-grid"
import LiveShoppingSection from "./member/live-shopping-section"
import MarketplaceGrid from "./member/marketplace-grid"
import BottomNavigation from "./member/bottom-navigation"
import ShopPage from "./member/shop-page"
import TransactionsPage from "./member/transactions-page"
import ProfilePage from "./member/profile-page"

export function MemberApp() {
  const [activeTab, setActiveTab] = useState("home")
  const [balanceVisible, setBalanceVisible] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-700 text-white sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Hello</p>
              <p className="text-3xl font-bold">David</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-blue-600 rounded-lg transition hidden sm:block">🔍</button>
              <button className="p-2 hover:bg-blue-600 rounded-lg transition">🔔</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "home" && (
          <div className="space-y-8">
            {/* Balance Card */}
            <div className="max-w-md">
              <BalanceCard visible={balanceVisible} onToggleVisibility={() => setBalanceVisible(!balanceVisible)} />
            </div>

            {/* Action Buttons */}
            <div className="max-w-md">
              <ActionButtons />
            </div>

            {/* PPOB Services */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Layanan Cepat</h3>
              <PPOBGrid />
            </div>

            {/* Live Shopping */}
            <div>
              <LiveShoppingSection />
            </div>

            {/* Marketplace */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Marketplace Lokal</h3>
              <MarketplaceGrid />
            </div>
          </div>
        )}

        {activeTab === "shop" && <ShopPage />}

        {activeTab === "transactions" && <TransactionsPage />}

        {activeTab === "profile" && <ProfilePage />}
      </div>

      {/* Bottom Navigation - Responsive */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden z-40">
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex fixed left-0 bottom-0 top-20 w-64 bg-white border-r border-slate-200 p-6 flex-col gap-4">
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Spacer untuk mobile */}
      <div className="h-20 lg:hidden" />
    </div>
  )
}
