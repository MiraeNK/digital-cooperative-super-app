"use client"

import { useEffect, useState } from "react"
import { Mail, Phone } from "lucide-react"
import { getAllMembers, getMemberStats } from "@/lib/firebase"

const dummyMembers = [
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
]

export default function MemberDataGrid() {
  const [members, setMembers] = useState<any[]>(dummyMembers)
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, totalWriters: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [dbMembers, dbStats] = await Promise.all([
          getAllMembers(),
          getMemberStats()
        ])
        
        // Combine Firebase members dengan dummy members
        const combinedMembers = [...(dbMembers as any[]), ...dummyMembers]
        setMembers(combinedMembers.slice(0, 10))
        setStats(dbStats)
      } catch (error) {
        console.error("Error fetching member data:", error)
        setMembers(dummyMembers)
        setStats({ totalMembers: dummyMembers.length, activeMembers: 2, totalWriters: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-slate-600 text-sm mb-2">Total Member</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{isLoading ? "-" : stats.totalMembers}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-slate-600 text-sm mb-2">Member Aktif</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{isLoading ? "-" : stats.activeMembers}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-slate-600 text-sm mb-2">Total Writer</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{isLoading ? "-" : stats.totalWriters}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-slate-600 text-sm mb-2">Total Simpanan</p>
          <p className="text-lg sm:text-xl font-bold text-slate-900">
            Rp {(members.reduce((sum, m) => sum + (m.savings || 0), 0) / 1000000).toFixed(1)}M
          </p>
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
                <tr key={member.id || member.uid} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 text-sm">{member.name || member.displayName}</div>
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
                      {member.phone || "N/A"}
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
                    Rp {((member.savings || 0) / 1000000).toFixed(1)}M
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
