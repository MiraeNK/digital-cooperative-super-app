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
import MerchantCenter from "./member/merchant-center"
import ArticlesSection from "./member/articles-section"
import ArticleReader from "./member/article-reader"
import PharmacySection from "./member/pharmacy-section"
import HealthServiceSection from "./member/health-service-section"
import MarketplaceWithMap from "./member/marketplace-with-map"
import FloatingMessageButton from "./member/floating-message-button"

interface Article {
  id: string
  title: string
  category: string
  author: string
  views: number
  cover: string
  excerpt: string
}

export function MemberApp() {
  const [activeTab, setActiveTab] = useState("home")
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [navigationHistory, setNavigationHistory] = useState<string[]>(["home"])
  const [isSeller] = useState(true)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

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

  const isMessagingOpen = activeTab === "messaging" || selectedChat !== null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      
      {/* --- SIDEBAR --- */}
      <div
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 flex-col z-40 transition-all duration-300 ${
          sidebarExpanded ? "w-72" : "w-24"
        }`}
      >
        <div className={`px-6 py-12 border-b border-slate-200 transition-all duration-300 ${!sidebarExpanded && "px-3"}`}>
          <div className="flex items-center gap-3 h-12">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              T
            </div>
            {sidebarExpanded && (
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 truncate text-base">Tubagus Ahmad</p>
                <p className="text-sm text-slate-500 truncate">ID: KOP-001</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} sidebarExpanded={sidebarExpanded} />
          {isSeller && (
            <button
              onClick={() => handleTabChange("merchant")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition justify-start ${
                activeTab === "merchant" ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-lg flex-shrink-0">🏪</span>
              {sidebarExpanded && <span className="font-semibold text-sm">Toko Saya</span>}
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition text-sm font-semibold"
          >
            <span className="text-lg flex-shrink-0">{sidebarExpanded ? "‹" : "›"}</span>
            {sidebarExpanded && <span>Collapse</span>}
          </button>
          <button className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition text-sm font-semibold">
            <span className="text-lg flex-shrink-0">←</span>
            {sidebarExpanded && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarExpanded ? "lg:ml-72" : "lg:ml-24"}`}>
        
        {/* Desktop Header */}
        {!isMessagingOpen && (
          <div className="hidden lg:block bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="px-8 py-12">
              <div className="flex items-center justify-between h-12">
                <h1 className="text-3xl font-bold text-slate-900">
                  {activeTab === "home" && "Beranda"}
                  {activeTab === "shop" && "Toko"}
                  {activeTab === "transactions" && "Riwayat Transaksi"}
                  {activeTab === "community" && "Komunitas"}
                  {activeTab === "profile" && "Profil Saya"}
                  {activeTab === "merchant" && "Pusat Penjualan"}
                </h1>
                <div className="flex items-center gap-4"></div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {isMessagingOpen ? (
            <MessagingPage selectedChatId={selectedChat} onBack={handleBack} />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

                  {/* UPDATE POSISI: PPOB (Layanan Cepat) Naik ke atas */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Layanan Cepat</h3>
                    <PPOBGrid />
                  </div>

                  {/* UPDATE POSISI: Berita (Articles) */}
                  <div>
                    <ArticlesSection onArticleClick={setSelectedArticle} />
                  </div>

                  {/* UPDATE POSISI: Health Service Section PINDAH KE SINI (Di bawah Berita) */}
                  <div>
                    <HealthServiceSection />
                  </div>

                  {/* Pharmacy Section mengikuti Layanan Kesehatan */}
                  <div>
                    <PharmacySection />
                  </div>

                  <div>
                    <LiveShoppingSection />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Marketplace Lokal</h3>
                    <MarketplaceWithMap />
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
              {activeTab === "merchant" && <MerchantCenter />}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden z-40">
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      <div className="h-20 lg:hidden" />

      {/* Modals */}
      {selectedArticle && (
        <ArticleReader 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
        />
      )}

      {!isMessagingOpen && (
        <FloatingMessageButton
          onOpenFullChat={(chatId) => {
            if (chatId === "all") {
              handleTabChange("messaging")
              setSelectedChat(null)
            } else {
              handleTabChange("messaging")
              setSelectedChat(chatId)
            }
          }}
        />
      )}
    </div>
  )
}