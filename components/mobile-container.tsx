import type React from "react"
export default function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden h-[812px] md:h-[812px] border-8 border-slate-800">
      {children}
    </div>
  )
}
