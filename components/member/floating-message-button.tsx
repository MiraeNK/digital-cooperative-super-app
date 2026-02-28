"use client"

import { useState, useEffect } from "react"
import { MessageSquare, X, ChevronRight } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getPendingMessages, getUserChats } from "@/lib/firebase"

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

const toDate = (value: any): Date | null => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === "function") return value.toDate()
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

export default function FloatingMessageButton({ onOpenFullChat, unreadMessages }: FloatingMessageButtonProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const internalUnread = useUnreadMessages(user?.uid)

  const totalUnread = (unreadMessages || internalUnread).reduce((sum, msg) => sum + msg.unreadCount, 0)

  const handleClose = () => setIsOpen(false)

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
              {(unreadMessages || internalUnread).map((msg) => (
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

  // Helper hook: fetch unread/pending messages for floating button
  function useUnreadMessages(userId?: string) {
    const [items, setItems] = useState<UnreadMessage[]>([])

    useEffect(() => {
      let mounted = true
      let intervalId: any = null

      const fetchMessages = async () => {
        if (!userId) return
        try {
          const pending = await getPendingMessages(userId)
          const chats = await getUserChats(userId)

          const pendingMapped: UnreadMessage[] = pending.map((p: any) => ({
            id: p.senderId,
            name: p.senderData?.displayName || "User",
            avatar: p.senderData?.displayName?.charAt(0).toUpperCase() || "U",
            message: p.text || "",
            timestamp: toDate(p.timestamp)?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) || "",
            unreadCount: 1,
          }))

          const chatsMapped: UnreadMessage[] = chats
            .filter((c: any) => !c.read)
            .map((c: any) => ({
              id: c.userId,
              name: c.displayName || c.email || "User",
              avatar: (c.displayName?.charAt(0) || "U").toUpperCase(),
              message: c.lastMessage || "",
              timestamp: toDate(c.lastMessageTime)?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) || "",
              unreadCount: c.read ? 0 : 1,
          }))

          const dedupedMap = new Map<string, UnreadMessage>()
          ;[...pendingMapped, ...chatsMapped].forEach((row) => {
            if (!dedupedMap.has(row.id)) dedupedMap.set(row.id, row)
          })
          const combined = Array.from(dedupedMap.values()).slice(0, 10)

          if (mounted) setItems(combined)
        } catch (err) {
          console.error("Error fetching unread messages:", err)
        }
      }

      fetchMessages()
      if (userId) intervalId = setInterval(fetchMessages, 15000)

      return () => {
        mounted = false
        if (intervalId) clearInterval(intervalId)
      }
    }, [userId])

    return items
  }
