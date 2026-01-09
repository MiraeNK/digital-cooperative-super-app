import { ArrowUpRight, ArrowRightLeft, QrCode } from "lucide-react"

export default function ActionButtons() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <button className="flex flex-col items-center justify-center py-4 px-3 sm:px-4 bg-blue-50 hover:bg-blue-100 rounded-xl sm:rounded-2xl transition-all active:scale-95">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center mb-3">
          <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-700">Top Up</p>
      </button>

      <button className="flex flex-col items-center justify-center py-4 px-3 sm:px-4 bg-blue-50 hover:bg-blue-100 rounded-xl sm:rounded-2xl transition-all active:scale-95">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center mb-3">
          <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-700">Transfer</p>
      </button>

      <button className="flex flex-col items-center justify-center py-4 px-3 sm:px-4 bg-orange-50 hover:bg-orange-100 rounded-xl sm:rounded-2xl transition-all active:scale-95 relative">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent text-white rounded-full flex items-center justify-center mb-3 animate-pulse">
          <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-700">Scan QRIS</p>
        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      </button>
    </div>
  )
}
