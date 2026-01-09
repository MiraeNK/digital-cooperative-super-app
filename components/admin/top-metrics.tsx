import { TrendingUp, Users, Zap } from "lucide-react"

const metrics = [
  {
    label: "Total Volume Transaksi",
    value: "Rp 2.450.000.000",
    change: "+12.5%",
    icon: TrendingUp,
    color: "from-primary to-blue-700",
  },
  {
    label: "Anggota Aktif Hari Ini",
    value: "1.234",
    change: "+5.2%",
    icon: Users,
    color: "from-green-600 to-green-700",
  },
  {
    label: "Live Stream Conversion Rate",
    value: "23.5%",
    change: "+8.9%",
    icon: Zap,
    color: "from-accent to-orange-600",
  },
]

export default function TopMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <div key={index} className={`bg-gradient-to-br ${metric.color} text-white rounded-xl shadow-md p-6`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-90 font-medium">{metric.label}</p>
                <p className="text-2xl sm:text-3xl font-bold mt-3">{metric.value}</p>
                <p className="text-sm opacity-80 mt-3">
                  <span className="font-semibold">{metric.change}</span> vs bulan lalu
                </p>
              </div>
              <Icon className="w-8 h-8 opacity-80 flex-shrink-0" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
