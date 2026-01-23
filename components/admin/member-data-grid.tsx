import { Mail, Phone } from "lucide-react"

const members = [
  {
    id: 1,
    name: "Ahmad Rizki",
    email: "ahmad.rizki@email.com",
    phone: "08123456789",
    joinDate: "2023-05-15",
    status: "active",
    savings: 5250000,
  },
  {
    id: 2,
    name: "Siti Fatimah",
    email: "siti.fatimah@email.com",
    phone: "08234567890",
    joinDate: "2023-07-22",
    status: "active",
    savings: 3450000,
  },
  {
    id: 3,
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    phone: "08345678901",
    joinDate: "2023-03-10",
    status: "inactive",
    savings: 7800000,
  },
  {
    id: 4,
    name: "Dewi Lestari",
    email: "dewi.lestari@email.com",
    phone: "08456789012",
    joinDate: "2023-09-05",
    status: "active",
    savings: 2100000,
  },
]

export default function MemberDataGrid() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-slate-600 text-sm mb-2">Total Member</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">2.456</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-slate-600 text-sm mb-2">Member Aktif</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">1.893</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-slate-600 text-sm mb-2">Member Baru (Bulan Ini)</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">156</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-slate-600 text-sm mb-2">Total Simpanan</p>
          <p className="text-lg sm:text-xl font-bold text-slate-900">Rp 15.2M</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Nama</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm hidden sm:table-cell">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm hidden md:table-cell">
                  No. HP
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm hidden lg:table-cell">
                  Simpanan
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 text-sm">{member.name}</div>
                    <div className="text-xs text-slate-500 sm:hidden">{member.joinDate}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      {member.email}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      {member.phone}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        member.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {member.status === "active" ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-900 hidden lg:table-cell">
                    Rp {(member.savings / 1000000).toFixed(1)}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
