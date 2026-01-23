"use client"

import { Download } from "lucide-react"
import { useState } from "react"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

const transactions = [
  { id: 1, type: "Top Up", amount: 500000, status: "success", date: "2024-01-08 14:32" },
  { id: 2, type: "Transfer ke Ani", amount: -150000, status: "success", date: "2024-01-08 13:45" },
  { id: 3, type: "Belanja - Beras", amount: -47000, status: "success", date: "2024-01-08 13:12" },
  { id: 4, type: "Bayar PLN", amount: -300000, status: "success", date: "2024-01-08 12:58" },
  { id: 5, type: "Live Shopping - Promo", amount: -62000, status: "pending", date: "2024-01-08 12:30" },
  { id: 6, type: "Bonus Referral", amount: 100000, status: "success", date: "2024-01-07 16:20" },
  { id: 7, type: "Cashback", amount: 25000, status: "success", date: "2024-01-07 10:15" },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case "pending":
      return <Clock className="w-5 h-5 text-yellow-600 animate-spin" />
    case "failed":
      return <AlertCircle className="w-5 h-5 text-red-600" />
    default:
      return null
  }
}

export default function TransactionsPage() {
  const [filter, setFilter] = useState("semua")

  const filteredTransactions =
    filter === "semua"
      ? transactions
      : transactions.filter((t) => {
          if (filter === "in") return t.amount > 0
          if (filter === "out") return t.amount < 0
          return true
        })

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Riwayat Transaksi</h2>
      </div>

      {/* Filter */}
      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={() => setFilter("semua")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            filter === "semua" ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter("in")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            filter === "in" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Masuk
        </button>
        <button
          onClick={() => setFilter("out")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            filter === "out" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Keluar
        </button>
        <button className="ml-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition flex items-center gap-2">
          <Download size={16} />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-shrink-0">{getStatusIcon(transaction.status)}</div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm sm:text-base">{transaction.type}</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">{transaction.date}</p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`font-bold text-sm sm:text-base ${transaction.amount > 0 ? "text-green-600" : "text-slate-900"}`}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  Rp {Math.abs(transaction.amount).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
