import { CheckCircle, Clock, AlertCircle } from "lucide-react"

const transactions = [
  {
    id: 1,
    member: "Ahmad Rizki",
    type: "PPOB - PLN",
    amount: "Rp 300.000",
    status: "success",
    timestamp: "2024-01-08 14:32",
  },
  {
    id: 2,
    member: "Siti Fatimah",
    type: "Product - Beras",
    amount: "Rp 125.000",
    status: "success",
    timestamp: "2024-01-08 13:45",
  },
  {
    id: 3,
    member: "Budi Santoso",
    type: "Live Stream - Top Up",
    amount: "Rp 500.000",
    status: "pending",
    timestamp: "2024-01-08 13:12",
  },
  {
    id: 4,
    member: "Dewi Lestari",
    type: "PPOB - PDAM",
    amount: "Rp 175.000",
    status: "success",
    timestamp: "2024-01-08 12:58",
  },
  {
    id: 5,
    member: "Hendra Wijaya",
    type: "Product - Minyak",
    amount: "Rp 96.000",
    status: "failed",
    timestamp: "2024-01-08 12:30",
  },
]

export default function TransactionsTable() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600 animate-spin" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      success: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
    }
    return badges[status as keyof typeof badges] || ""
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Nama Anggota</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm hidden sm:table-cell">
              Tipe Transaksi
            </th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Nominal</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm hidden md:table-cell">Waktu</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
              <td className="py-3 px-4 text-sm text-slate-900 font-medium">{transaction.member}</td>
              <td className="py-3 px-4 text-sm text-slate-600 hidden sm:table-cell">{transaction.type}</td>
              <td className="py-3 px-4 text-sm font-semibold text-slate-900">{transaction.amount}</td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(transaction.status)}`}
                >
                  {getStatusIcon(transaction.status)}
                  <span className="hidden sm:inline">
                    {transaction.status === "success" && "Berhasil"}
                    {transaction.status === "pending" && "Pending"}
                    {transaction.status === "failed" && "Gagal"}
                  </span>
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-slate-500 hidden md:table-cell">{transaction.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
