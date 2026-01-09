"use client"

import { useState } from "react"
import Sidebar from "./admin/sidebar"
import TopMetrics from "./admin/top-metrics"
import DigitalMarketingChart from "./admin/digital-marketing-chart"
import TransactionsTable from "./admin/transactions-table"
import InventoryManagement from "./admin/inventory-management"
import MemberDataGrid from "./admin/member-data-grid"

export function AdminDashboard() {
  const [activePage, setActivePage] = useState("overview")

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="hidden lg:block lg:w-64">
          <Sidebar activePage={activePage} onPageChange={setActivePage} />
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-6">
          <Sidebar activePage={activePage} onPageChange={setActivePage} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activePage === "overview" && (
            <div className="space-y-6 sm:space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Dashboard Overview</h1>
                <p className="text-slate-600">Real-time analytics dan insights untuk Koperasi Anda</p>
              </div>

              {/* Top Metrics */}
              <TopMetrics />

              {/* Charts */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6">Digital Marketing Intelligence</h2>
                <DigitalMarketingChart />
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Transaksi Terbaru</h2>
                  <button className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition active:scale-95">
                    Download Report
                  </button>
                </div>
                <TransactionsTable />
              </div>
            </div>
          )}

          {activePage === "marketing" && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Digital Marketing</h1>
                <p className="text-slate-600">Kelola kampanye dan analytics marketing Anda</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Campaign Performance</h3>
                  <div className="space-y-4">
                    {[
                      { name: "Live Shopping Ramadan", reach: 52500, engagement: 8.5 },
                      { name: "Promo Member Baru", reach: 38200, engagement: 12.3 },
                      { name: "Product Highlight Organic", reach: 91200, engagement: 6.8 },
                    ].map((campaign, idx) => (
                      <div key={idx} className="border-b border-slate-200 pb-4">
                        <p className="font-semibold text-slate-900 mb-2">{campaign.name}</p>
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Reach: {campaign.reach.toLocaleString()}</span>
                          <span>Engagement: {campaign.engagement}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Top Performing Content</h3>
                  <div className="space-y-4">
                    {[
                      { title: "Live Shopping Beras", views: 2504, likes: 342 },
                      { title: "Flash Sale Batik", views: 1856, likes: 298 },
                      { title: "Member Testimonial", views: 1204, likes: 156 },
                    ].map((content, idx) => (
                      <div key={idx} className="border-b border-slate-200 pb-4">
                        <p className="font-semibold text-slate-900 mb-2">{content.title}</p>
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Views: {content.views}</span>
                          <span>Likes: {content.likes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === "inventory" && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Inventory Management</h1>
                <p className="text-slate-600">Kelola stok produk dan supplier Anda</p>
              </div>

              <InventoryManagement />
            </div>
          )}

          {activePage === "members" && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Data Anggota</h1>
                <p className="text-slate-600">Informasi lengkap anggota koperasi</p>
              </div>

              <MemberDataGrid />
            </div>
          )}

          {activePage === "settings" && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Pengaturan</h1>
                <p className="text-slate-600">Konfigurasi sistem dan preferensi</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Pengaturan Umum</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Koperasi</label>
                      <input
                        type="text"
                        defaultValue="Koperasi Simpan Pinjam Sejahtera"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Admin</label>
                      <input
                        type="email"
                        defaultValue="admin@koperasi4.id"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button className="w-full px-4 py-2 bg-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition active:scale-95">
                      Simpan Perubahan
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Notifikasi</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      <span className="text-slate-700">Notifikasi Transaksi</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      <span className="text-slate-700">Notifikasi Member Baru</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-slate-700">Notifikasi Live Shopping</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
