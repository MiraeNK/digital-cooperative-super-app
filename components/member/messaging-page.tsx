"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Loader2, MessageSquare, Search, Send, User, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import {
  acceptFriendRequest,
  getConversation,
  getPendingFriendRequests,
  getUserChats,
  markMessageAsRead,
  rejectFriendRequest,
  searchUsers,
  sendMessageWithFriendCheck,
} from "@/lib/firebase"

type MessagingPageProps = {
  selectedChatId: string | null
  onBack: () => void
}

type ChatItem = {
  id: string
  displayName: string
  email: string
  lastMessage: string
  unread: number
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

const formatTime = (value: any) => {
  const date = toDate(value)
  if (!date) return "-"
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

export default function MessagingPage({ selectedChatId, onBack }: MessagingPageProps) {
  const router = useRouter()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<"chats" | "requests">("chats")
  const [selectedChatInternal, setSelectedChatInternal] = useState(selectedChatId ?? "")
  const [chats, setChats] = useState<ChatItem[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingLists, setIsLoadingLists] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isActingRequestId, setIsActingRequestId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelectedChatInternal(selectedChatId ?? "")
  }, [selectedChatId])

  const loadLists = async () => {
    if (!user?.uid) return
    setIsLoadingLists(true)
    try {
      const [chatData, requestData] = await Promise.all([
        getUserChats(user.uid),
        getPendingFriendRequests(user.uid),
      ])

      const mappedChats: ChatItem[] = (chatData || []).map((chat: any) => ({
        id: chat.userId,
        displayName: chat.displayName || "Anggota",
        email: chat.email || "",
        lastMessage: chat.lastMessage || "Mulai percakapan",
        unread: chat.read ? 0 : 1,
      }))

      setChats(mappedChats)
      setPendingRequests(requestData || [])
    } catch (error) {
      console.error("Error loading messaging lists:", error)
      setChats([])
      setPendingRequests([])
    } finally {
      setIsLoadingLists(false)
    }
  }

  const loadMessages = async () => {
    if (!user?.uid || !selectedChatInternal) {
      setMessages([])
      return
    }

    setIsLoadingMessages(true)
    try {
      const rows = await getConversation(user.uid, selectedChatInternal)
      const incomingUnread = rows.filter((row: any) => row.receiverId === user.uid && !row.read)
      await Promise.all(incomingUnread.map((row: any) => markMessageAsRead(row.id).catch(() => null)))

      setMessages(rows)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
    } catch (error) {
      console.error("Error loading messages:", error)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }

  useEffect(() => {
    loadLists()
  }, [user?.uid])

  useEffect(() => {
    loadMessages()
  }, [user?.uid, selectedChatInternal])

  useEffect(() => {
    if (!user?.uid) return
    const intervalId = setInterval(() => {
      loadLists()
      if (selectedChatInternal) loadMessages()
    }, 10000)
    return () => clearInterval(intervalId)
  }, [user?.uid, selectedChatInternal])

  const currentChat = useMemo(
    () => chats.find((chat) => chat.id === selectedChatInternal) || null,
    [chats, selectedChatInternal]
  )

  const handleSendMessage = async () => {
    const message = inputText.trim()
    if (!message || !user?.uid || !selectedChatInternal || isSending) return

    setIsSending(true)
    try {
      await sendMessageWithFriendCheck(user.uid, selectedChatInternal, message)
      setInputText("")
      await Promise.all([loadMessages(), loadLists()])
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Gagal mengirim pesan.")
    } finally {
      setIsSending(false)
    }
  }

  const handleSearch = async (queryValue: string) => {
    setSearchQuery(queryValue)
    if (!queryValue.trim()) {
      setSearchResults([])
      return
    }

    try {
      const results = await searchUsers(queryValue)
      setSearchResults((results || []).filter((row: any) => row.id !== user?.uid))
    } catch (error) {
      console.error("Error searching users:", error)
      setSearchResults([])
    }
  }

  const handleRequestAction = async (requestUserId: string, action: "accept" | "reject") => {
    if (!user?.uid) return
    setIsActingRequestId(requestUserId)
    try {
      if (action === "accept") {
        await acceptFriendRequest(user.uid, requestUserId)
      } else {
        await rejectFriendRequest(user.uid, requestUserId)
      }
      await loadLists()
    } catch (error) {
      console.error("Error updating request:", error)
      alert(action === "accept" ? "Gagal menerima permintaan." : "Gagal menolak permintaan.")
    } finally {
      setIsActingRequestId(null)
    }
  }

  const handleOpenProfile = () => {
    if (!currentChat?.id) return
    router.push(`/profile/${currentChat.id}`)
  }

  const handleBackFromDetail = () => {
    if (selectedChatInternal) {
      setSelectedChatInternal("")
      return
    }
    onBack()
  }

  return (
    <div className="flex h-full bg-white">
      <div
        className={`w-full sm:w-80 bg-white border-r border-slate-200 flex-col max-h-full overflow-hidden ${
          selectedChatInternal ? "hidden sm:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Pesan</h2>
            <button
              onClick={onBack}
              className="sm:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 150)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition ${
                activeTab === "chats" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Teman ({chats.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition ${
                activeTab === "requests" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Permintaan ({pendingRequests.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showSearch && searchResults.length > 0 && (
            <div className="p-4 border-b border-slate-200">
              <p className="text-xs text-slate-500 font-semibold mb-3">HASIL PENCARIAN</p>
              {searchResults.map((result: any) => (
                <button
                  key={result.id}
                  onClick={() => {
                    setSelectedChatInternal(result.id)
                    setActiveTab("chats")
                    setShowSearch(false)
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition mb-2"
                >
                  <p className="font-semibold text-slate-900">{result.displayName || "Anggota"}</p>
                  <p className="text-xs text-slate-500">{result.email || "-"}</p>
                </button>
              ))}
            </div>
          )}

          {activeTab === "chats" && (
            <>
              {isLoadingLists ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold">Belum ada percakapan</p>
                  <p className="text-slate-500 text-sm">Cari pengguna untuk mulai chat</p>
                </div>
              ) : (
                <div className="p-2">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChatInternal(chat.id)}
                      className={`w-full text-left p-3 rounded-xl transition mb-2 ${
                        selectedChatInternal === chat.id
                          ? "bg-blue-100 border-2 border-primary"
                          : "hover:bg-slate-50 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                          {(chat.displayName || "A").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <p className="font-semibold text-slate-900">{chat.displayName}</p>
                            {chat.unread > 0 && (
                              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{chat.unread}</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 truncate">{chat.lastMessage}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "requests" && (
            <>
              {isLoadingLists ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold">Tidak ada permintaan pertemanan</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {pendingRequests.map((req: any) => (
                    <div key={req.id} className="p-4 bg-white rounded-xl border-2 border-yellow-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {(req.displayName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{req.displayName || "Pengguna"}</p>
                          <p className="text-xs text-slate-500 truncate">{req.email || "-"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestAction(req.id, "accept")}
                          disabled={isActingRequestId === req.id}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition flex items-center justify-center gap-1 disabled:opacity-60"
                        >
                          {isActingRequestId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Terima
                        </button>
                        <button
                          onClick={() => handleRequestAction(req.id, "reject")}
                          disabled={isActingRequestId === req.id}
                          className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition flex items-center justify-center gap-1 disabled:opacity-60"
                        >
                          {isActingRequestId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          Tolak
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className={`flex-1 flex-col bg-white ${selectedChatInternal ? "flex" : "hidden sm:flex"}`}>
        {currentChat ? (
          <>
            <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-primary to-blue-700 text-white flex items-center justify-between border-b border-blue-600 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={handleBackFromDetail} className="p-2 hover:bg-blue-600 rounded transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button onClick={handleOpenProfile} className="flex items-center gap-3 hover:opacity-90 transition">
                  <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center font-bold">
                    {(currentChat.displayName || "A").charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">{currentChat.displayName}</h3>
                    <p className="text-xs text-blue-100">{currentChat.email}</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
              <div className="p-4 sm:p-6 space-y-4 h-full flex flex-col">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <p className="text-sm">Mulai percakapan dengan mengirim pesan.</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message: any) => {
                      const isOwn = message.senderId === user?.uid
                      return (
                        <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                              isOwn ? "bg-primary text-white rounded-br-none" : "bg-slate-200 text-slate-900 rounded-bl-none"
                            }`}
                          >
                            <p className="text-sm sm:text-base break-words">{message.text}</p>
                            <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-slate-600"}`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik pesan..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !inputText.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold text-sm disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 hidden sm:flex items-center justify-center bg-white">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-semibold">Pilih percakapan untuk memulai</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
