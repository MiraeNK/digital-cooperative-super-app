import { Plus, Minus } from "lucide-react"

const inventory = [
  { id: 1, name: "Beras Premium 5kg", sku: "BR-001", stock: 245, price: 52000, status: "available" },
  { id: 2, name: "Minyak Goreng 2L", sku: "MG-002", stock: 12, price: 28000, status: "low" },
  { id: 3, name: "Batik Lokal L", sku: "BT-003", stock: 0, price: 75000, status: "outofstock" },
  { id: 4, name: "Kopi Arabika 250g", sku: "KF-004", stock: 156, price: 85000, status: "available" },
  { id: 5, name: "Gula Pasir 1kg", sku: "GP-005", stock: 8, price: 14000, status: "low" },
]

const getStatusBadge = (status: string) => {
  const badges = {
    available: "bg-green-100 text-green-700",
    low: "bg-yellow-100 text-yellow-700",
    outofstock: "bg-red-100 text-red-700",
  }
  return badges[status as keyof typeof badges] || ""
}

const getStatusLabel = (status: string) => {
  const labels = {
    available: "Tersedia",
    low: "Stok Rendah",
    outofstock: "Habis",
  }
  return labels[status as keyof typeof labels] || ""
}

export default function InventoryManagement() {
  return (
    <div className="space-y-6">
      <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition active:scale-95">
        <Plus size={18} />
        Tambah Produk
      </button>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Nama Produk</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm hidden sm:table-cell">SKU</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Stok</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm hidden md:table-cell">Harga</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="py-3 px-4 text-sm font-semibold text-slate-900">{item.name}</td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden sm:table-cell">{item.sku}</td>
                <td className="py-3 px-4 text-sm font-semibold text-slate-900">{item.stock}</td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  Rp {item.price.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-200 rounded-lg transition">
                      <Minus size={16} className="text-slate-600" />
                    </button>
                    <button className="p-2 hover:bg-slate-200 rounded-lg transition">
                      <Plus size={16} className="text-slate-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
