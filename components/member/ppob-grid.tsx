import { Smartphone, Zap, Droplets, Heart, Gift, Wifi, HandCoins, MoreHorizontal } from "lucide-react"

const services = [
  { icon: Smartphone, label: "Pulsa", color: "bg-blue-600" },
  { icon: Zap, label: "PLN", color: "bg-yellow-500" },
  { icon: Droplets, label: "PDAM", color: "bg-cyan-500" },
  { icon: Heart, label: "BPJS", color: "bg-red-500" },
  { icon: Gift, label: "Voucher", color: "bg-purple-500" },
  { icon: Wifi, label: "Internet", color: "bg-green-500" },
  { icon: HandCoins, label: "Zakat", color: "bg-orange-600" },
  { icon: MoreHorizontal, label: "Lainnya", color: "bg-slate-400" },
]

export default function PPOBGrid() {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6">
      {services.map((service, index) => {
        const Icon = service.icon
        return (
          <button
            key={index}
            className="flex flex-col items-center justify-center hover:scale-110 transition-transform active:scale-95"
          >
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 ${service.color} text-white rounded-full flex items-center justify-center mb-3 shadow-md hover:shadow-lg transition`}
            >
              <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 text-center">{service.label}</p>
          </button>
        )
      })}
    </div>
  )
}
