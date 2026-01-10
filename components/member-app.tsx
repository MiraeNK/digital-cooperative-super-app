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
import CommunityPage from "./member/community-page"
import MessagingPage from "./member/messaging-page"

export function MemberApp() {
  const [activeTab, setActiveTab] = useState("home")
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [navigationHistory, setNavigationHistory] = useState<string[]>(["home"])

  const handleTabChange = (tab: string) => {
    setNavigationHistory([...navigationHistory, tab])
    setActiveTab(tab)
  }

  const handleBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1)
      setNavigationHistory(newHistory)
      setActiveTab(newHistory[newHistory.length - 1])
    }
  }

  const showBackButton = activeTab === "messaging"

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col lg:flex-row">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex fixed left-0 top-20 bottom-0 w-72 bg-white border-r border-slate-200 flex-col z-40">
        {/* Header */}
        <div className="px-6 py-8 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <div>
              <p className="font-bold text-slate-900">Tubagus Ahmad</p>
              <p className="text-sm text-slate-500">Member ID: KOP-001</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <button className="w-full px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition text-sm font-semibold">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col">
        {/* Desktop Header - Hide for messaging page */}
        {!showBackButton && (
          <div className="hidden lg:block bg-white border-b border-slate-200 sticky top-20 z-30">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {activeTab === "home" && "Beranda"}
                    {activeTab === "shop" && "Toko"}
                    {activeTab === "transactions" && "Riwayat Transaksi"}
                    {activeTab === "community" && "Komunitas"}
                    {activeTab === "profile" && "Profil Saya"}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "messaging" ? (
            <MessagingPage selectedChatId={selectedChat} onBack={handleBack} />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activeTab === "home" && (
                <div className="space-y-8">
                  <div className="max-w-md">
                    <BalanceCard
                      visible={balanceVisible}
                      onToggleVisibility={() => setBalanceVisible(!balanceVisible)}
                    />
                  </div>

                  <div className="max-w-md">
                    <ActionButtons />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-6">Layanan Cepat</h3>
                    <PPOBGrid />
                  </div>

                  <div>
                    <LiveShoppingSection />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-6">Marketplace Lokal</h3>
                    <MarketplaceGrid />
                  </div>
                </div>
              )}

              {activeTab === "shop" && <ShopPage />}

              {activeTab === "transactions" && <TransactionsPage />}

              {activeTab === "community" && (
                <CommunityPage
                  onChatSelect={(chatId) => {
                    setSelectedChat(chatId)
                    handleTabChange("messaging")
                  }}
                />
              )}

              {activeTab === "profile" && <ProfilePage />}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden z-40">
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Spacer untuk mobile */}
      <div className="h-20 lg:hidden" />
    </div>
  )
}
