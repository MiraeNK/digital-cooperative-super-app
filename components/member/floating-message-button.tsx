"use client"

import { useState } from "react"
import { MessageSquare, X, ChevronRight } from "lucide-react"

interface UnreadMessage {
  id: string
  name: string
  avatar: string
  message: string
  timestamp: string
  unreadCount: number
}

interface FloatingMessageButtonProps {
  onOpenFullChat?: (chatId: string) => void
  unreadMessages?: UnreadMessage[]
}

export default function FloatingMessageButton({
  onOpenFullChat,
  unreadMessages = [
    {
      id: "admin",
      name: "Admin Koperasi",
      avatar: "A",
      message: "Info pembagian SHU & Notifikasi...",
      timestamp: "09:15",
      unreadCount: 2,
    },
    {
      id: "pelanggan",
      name: "Layanan Pelanggan",
      avatar: "L",
      message: "Transaksi pending sedang dicek...",
      timestamp: "13:45",
      unreadCount: 1,
    },
  ],
}: FloatingMessageButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const totalUnread = unreadMessages.reduce((sum, msg) => sum + msg.unreadCount, 0)

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-24 right-6 z-30 lg:bottom-6">
        <div className="relative inline-block">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              group relative w-16 h-16 rounded-full transition-all duration-500 ease-out
              ${isOpen ? "bg-white shadow-2xl scale-100" : "bg-primary hover:bg-blue-700 shadow-lg hover:shadow-xl"}
              flex items-center justify-center overflow-hidden
            `}
          >
            <div
              className={`
                absolute inset-0 rounded-full transition-all duration-500
                ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}
                flex items-center justify-center
              `}
            >
              <MessageSquare className="w-6 h-6 text-white" />
            </div>

            {/* Close Icon */}
            <div
              className={`
                absolute inset-0 rounded-full transition-all duration-500
                ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"}
                flex items-center justify-center
              `}
            >
              <X className="w-6 h-6 text-primary" />
            </div>
          </button>

          {totalUnread > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-50 shadow-lg">
              {totalUnread}
            </span>
          )}
        </div>

        {isOpen && (
          <div
            className={`
              absolute bottom-20 right-0 w-80 max-h-96 bg-white rounded-2xl shadow-2xl
              border border-slate-200 overflow-hidden
              animate-in fade-in zoom-in duration-300
            `}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-blue-700 text-white p-4">
              <h3 className="font-bold text-lg">Pesan Baru ({totalUnread})</h3>
              <p className="text-xs text-blue-100">Unread messages</p>
            </div>

            {/* Messages List */}
            <div className="divide-y divide-slate-200 max-h-64 overflow-y-auto">
              {unreadMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    onOpenFullChat?.(msg.id)
                    handleClose()
                  }}
                  className="w-full p-4 hover:bg-slate-50 transition text-left group"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {msg.avatar}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{msg.name}</h4>
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                          {msg.unreadCount}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{msg.timestamp}</p>
                      <p className="text-sm text-slate-600 truncate mt-1">{msg.message}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <button
                onClick={() => {
                  onOpenFullChat?.("all")
                  handleClose()
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
              >
                <span>Lihat Semua Pesan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-20" onClick={handleClose} aria-hidden="true" />}
    </>
  )
}
