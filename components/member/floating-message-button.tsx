"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, Loader2, MessageSquare, Minimize2, Send, X, ChevronRight } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import {
  clearPendingMessagesFromSender,
  getConversation,
  getPendingMessages,
  getUserChats,
  markChatAsRead,
  markMessageAsRead,
  sendMessageWithFriendCheck,
} from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const { items: internalUnread, refresh: refreshUnread } = useUnreadMessages(user?.uid)
  const [activeMiniChat, setActiveMiniChat] = useState<UnreadMessage | null>(null)
  const [miniMessages, setMiniMessages] = useState<any[]>([])
  const [miniInput, setMiniInput] = useState("")
  const [isMiniLoading, setIsMiniLoading] = useState(false)
  const [isMiniSending, setIsMiniSending] = useState(false)

  const totalUnread = (unreadMessages || internalUnread).reduce((sum, msg) => sum + msg.unreadCount, 0)
  const unreadSource = unreadMessages || internalUnread

  const handleClose = () => setIsOpen(false)

  const loadMiniMessages = async (chatId: string) => {
    if (!user?.uid || !chatId) return
    setIsMiniLoading(true)
    try {
      const rows = await getConversation(user.uid, chatId)
      const unreadRows = rows.filter((row: any) => row.receiverId === user.uid && !row.read)
      await Promise.all(unreadRows.map((row: any) => markMessageAsRead(row.id).catch(() => null)))
      await Promise.all([
        markChatAsRead(user.uid, chatId).catch(() => null),
        clearPendingMessagesFromSender(user.uid, chatId).catch(() => null),
      ])
      setMiniMessages(rows)
      await refreshUnread()
    } catch (error) {
      console.error("Error loading mini chat:", error)
    } finally {
      setIsMiniLoading(false)
    }
  }

  useEffect(() => {
    if (!activeMiniChat?.id) return
    void loadMiniMessages(activeMiniChat.id)
    const intervalId = setInterval(() => {
      void loadMiniMessages(activeMiniChat.id)
    }, 10000)
    return () => clearInterval(intervalId)
  }, [activeMiniChat?.id, user?.uid])

  const handleMiniSend = async () => {
    const text = miniInput.trim()
    if (!text || !user?.uid || !activeMiniChat?.id || isMiniSending) return
    const tempId = `mini-${Date.now()}`
    setMiniMessages((prev) => [
      ...prev,
      {
        id: tempId,
        senderId: user.uid,
        receiverId: activeMiniChat.id,
        text,
        timestamp: new Date(),
        read: false,
        __status: "sending",
      },
    ])
    setMiniInput("")
    setIsMiniSending(true)
    try {
      await sendMessageWithFriendCheck(user.uid, activeMiniChat.id, text)
      await loadMiniMessages(activeMiniChat.id)
    } catch (error) {
      console.error("Error sending mini chat:", error)
      setMiniMessages((prev) =>
        prev.map((row: any) => (row.id === tempId ? { ...row, __status: "failed" } : row))
      )
      toast({
        variant: "destructive",
        title: "Gagal mengirim",
        description: "Pesan belum terkirim.",
      })
    } finally {
      setIsMiniSending(false)
    }
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
              {unreadSource.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setActiveMiniChat(msg)
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

      {/* Mini Chat Box */}
      {activeMiniChat && (
        <div className="fixed bottom-24 right-6 z-40 w-80 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden lg:bottom-6">
          <div className="px-3 py-2 bg-gradient-to-r from-primary to-blue-700 text-white flex items-center justify-between">
            <button
              className="flex items-center gap-2 text-left min-w-0"
              onClick={() => onOpenFullChat?.(activeMiniChat.id)}
              title="Buka chat penuh"
            >
              <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">
                {activeMiniChat.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{activeMiniChat.name}</p>
                <p className="text-[11px] text-blue-100 truncate">Quick Reply</p>
              </div>
              <ArrowUpRight className="w-4 h-4 ml-1 shrink-0" />
            </button>

            <button
              onClick={() => setActiveMiniChat(null)}
              className="w-8 h-8 rounded-md hover:bg-white/15 inline-flex items-center justify-center"
              title="Tutup mini chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-72 overflow-y-auto bg-slate-50 p-3 space-y-2">
            {isMiniLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : miniMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Belum ada pesan. Mulai percakapan.
              </div>
            ) : (
              miniMessages.map((msg: any) => {
                const isOwn = msg.senderId === user?.uid
                return (
                  <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-lg px-3 py-2 text-sm ${isOwn ? "bg-primary text-white" : "bg-white text-slate-900 border border-slate-200"}`}>
                      <p className="break-words">{msg.text}</p>
                      {isOwn && (
                        <p className={`text-[10px] mt-1 ${msg.__status === "failed" ? "text-red-200" : "text-blue-100"}`}>
                          {msg.__status === "sending" ? "Mengirim..." : msg.__status === "failed" ? "Gagal" : msg.read ? "Dibaca" : "Terkirim"}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="p-2 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={miniInput}
              onChange={(e) => setMiniInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  void handleMiniSend()
                }
              }}
              placeholder="Balas cepat..."
              className="flex-1 h-9 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => void handleMiniSend()}
              disabled={!miniInput.trim() || isMiniSending}
              className="h-9 w-9 rounded-md bg-primary text-white inline-flex items-center justify-center disabled:opacity-50"
              title="Kirim"
            >
              {isMiniSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// Helper hook: fetch unread/pending messages for floating button
function useUnreadMessages(userId?: string) {
  const [items, setItems] = useState<UnreadMessage[]>([])

  const fetchUnread = async (mountedRef?: { current: boolean }) => {
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

      if (!mountedRef || mountedRef.current) setItems(combined)
    } catch (err) {
      console.error("Error fetching unread messages:", err)
    }
  }

  useEffect(() => {
    const mountedRef = { current: true }
    let intervalId: any = null
    void fetchUnread(mountedRef)
    if (userId) intervalId = setInterval(() => void fetchUnread(mountedRef), 15000)
    return () => {
      mountedRef.current = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [userId])

  return {
    items,
    refresh: async () => {
      await fetchUnread()
    },
  }
}
