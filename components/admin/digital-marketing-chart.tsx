"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { AlertCircle, X } from "lucide-react"
import { useState } from "react"

const data = [
  { month: "Jan", organic: 2400, direct: 1200, referral: 800, social: 1600 },
  { month: "Feb", organic: 2600, direct: 1100, referral: 900, social: 1700 },
  { month: "Mar", organic: 2800, direct: 1400, referral: 850, social: 1900 },
  { month: "Apr", organic: 3200, direct: 1300, referral: 1000, social: 2100 },
  { month: "May", organic: 3600, direct: 1500, referral: 1100, social: 2300 },
]

export default function DigitalMarketingChart() {
  const [showAlert, setShowAlert] = useState(true)

  return (
    <div className="space-y-6">
      {/* Insight Alert */}
      {showAlert && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Insight: Traffic Organik Meningkat</h3>
            <p className="text-sm text-slate-700 mt-1">
              Traffic dari Organic Search meningkat 8.9% bulan ini. Rekomendasi: Tingkatkan SEO untuk konten "Beras
              Organik".
            </p>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="text-slate-500 hover:text-slate-700 transition flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Chart */}
      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
              cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar dataKey="organic" stackId="a" fill="#3b82f6" name="Organic Search" radius={[8, 8, 0, 0]} />
            <Bar dataKey="direct" stackId="a" fill="#10b981" name="Direct" radius={[8, 8, 0, 0]} />
            <Bar dataKey="referral" stackId="a" fill="#f59e0b" name="Referral" radius={[8, 8, 0, 0]} />
            <Bar dataKey="social" stackId="a" fill="#8b5cf6" name="Social Media" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
