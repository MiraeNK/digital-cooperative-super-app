"use client"

import { useState } from "react"
import { ShoppingBag, Plus, TrendingUp, Package, Truck, CheckCircle, AlertCircle } from "lucide-react"

export default function MerchantCenter() {
  const [activeTab, setActiveTab] = useState<"new" | "process" | "completed">("new")
  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      customer: "Budi Santoso",
      date: "2024-01-17",
      amount: 250000,
      items: "Beras Premium 5kg x2",
      status: "new",
    },
    {
      id: "ORD-002",
      customer: "Siti Nurhaliza",
      date: "2024-01-17",
      amount: 450000,
      items: "Telur Ayam Organik 10kg, Sayuran Segar",
      status: "new",
    },
  ])

  const [products] = useState([
    {
      id: 1,
      name: "Beras Premium",
      price: 85000,
      stock: 25,
      sold: 145,
      image: "🍚",
    },
    {
      id: 2,
      name: "Telur Ayam Organik",
      price: 45000,
      stock: 50,
      sold: 320,
      image: "🥚",
    },
    {
      id: 3,
      name: "Sayuran Segar",
      price: 35000,
      stock: 0,
      sold: 210,
      image: "🥬",
    },
  ])

  const handleAcceptOrder = (orderId: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: "process" } : order)))
  }

  const newOrders = orders.filter((o) => o.status === "new")
  const processOrders = orders.filter((o) => o.status === "process")
  const completedOrders = orders.filter((o) => o.status === "completed")

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Pusat Penjualan Saya</h2>
      </div>

      {/* Shop Profile Card */}
      <div className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold">Toko Tubagus Ahmad</h3>
            <p className="text-blue-100">Purwakarta, Jawa Barat</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">4.8</div>
            <div className="text-sm text-blue-100">Rating</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Saldo Tersedia</p>
            <p className="text-xl sm:text-2xl font-bold">Rp 2.150.000</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Penjualan Hari Ini</p>
            <p className="text-xl sm:text-2xl font-bold">6 Pesanan</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Terjual</p>
            <p className="text-xl sm:text-2xl font-bold">675</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Follower</p>
            <p className="text-xl sm:text-2xl font-bold">1.240</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="flex items-center gap-3 px-6 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition active:scale-95">
          <Plus size={20} />
          Tambah Produk
        </button>
        <button className="flex items-center gap-3 px-6 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition active:scale-95">
          <TrendingUp size={20} />
          Tarik Saldo
        </button>
      </div>

      {/* Order Management Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 px-4 py-4 font-semibold transition ${
              activeTab === "new"
                ? "text-primary border-b-2 border-primary bg-slate-50"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertCircle size={18} />
              Pesanan Baru ({newOrders.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("process")}
            className={`flex-1 px-4 py-4 font-semibold transition ${
              activeTab === "process"
                ? "text-primary border-b-2 border-primary bg-slate-50"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Truck size={18} />
              Dalam Proses ({processOrders.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 px-4 py-4 font-semibold transition ${
              activeTab === "completed"
                ? "text-primary border-b-2 border-primary bg-slate-50"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={18} />
              Selesai ({completedOrders.length})
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === "new" && (
            <div className="space-y-4">
              {newOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">Tidak ada pesanan baru</p>
                </div>
              ) : (
                newOrders.map((order) => (
                  <div key={order.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900">{order.customer}</p>
                        <p className="text-sm text-slate-600">
                          {order.id} • {order.date}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-primary">Rp {order.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 mb-4 text-sm">{order.items}</p>
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition active:scale-95"
                    >
                      Terima Pesanan
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "process" && (
            <div className="space-y-4">
              {processOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">Tidak ada pesanan dalam proses</p>
                </div>
              ) : (
                processOrders.map((order) => (
                  <div key={order.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900">{order.customer}</p>
                        <p className="text-sm text-slate-600">
                          {order.id} • {order.date}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-slate-900">Rp {order.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 mb-4 text-sm">{order.items}</p>
                    <button className="w-full px-4 py-2 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition active:scale-95">
                      Input Resi
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "completed" && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Belum ada pesanan selesai</p>
            </div>
          )}
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Daftar Produk Saya</h3>

        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:shadow-md transition"
            >
              <div className="text-3xl">{product.image}</div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{product.name}</p>
                <p className="text-sm text-slate-600">
                  {product.sold} terjual • Stock: {product.stock}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">Rp {product.price.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 text-primary hover:bg-primary/10 rounded-lg transition text-sm font-semibold">
                  Edit
                </button>
                <button className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-semibold">
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
