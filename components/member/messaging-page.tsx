"use client"

import { useState, useRef, useEffect } from "react"
import { Send, ArrowLeft, Search, Check, X, MessageSquare, User } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { 
  getConversation, 
  markMessageAsRead,
  sendMessageWithFriendCheck, 
  getUserChats, 
  getPendingMessages,
  getPendingFriendRequests,
  getUserFriends,
  acceptFriendRequest,
  rejectFriendRequest,
  searchUsers,
  getUserProfile
} from "@/lib/firebase"
import PublicProfile from "./public-profile"

interface Message {
  id: string
  sender: string
  authorId: string
  isOwn: boolean
  text: string
  timestamp: string
  read?: boolean
}

interface Chat {
  id: string
  displayName: string
  email: string
  avatar?: string
  lastMessage: string
  lastMessageTime?: Date
  unread: number
  online: boolean
}

interface MessagingPageProps {
  selectedChatId: string | null
  onBack: () => void
}

export default function MessagingPage({ selectedChatId, onBack }: MessagingPageProps) {
  const { user, userProfile } = useAuth()
  const [isSending, setIsSending] = useState(false)
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingPending, setIsLoadingPending] = useState(true)

  // Tab states
  const [activeTab, setActiveTab] = useState<"chats" | "requests">("chats")
  const [inputText, setInputText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearch, setShowSearch] = useState(false)

  // Profile view state
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Data states
  const [chats, setChats] = useState<Chat[]>([])
  const [pendingMessages, setPendingMessages] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [selectedChatInternal, setSelectedChatInternal] = useState<string>(selectedChatId || "")
  const [messages, setMessages] = useState<Message[]>([])
  const [friends, setFriends] = useState<any[]>([])

  // Fetch chats & friends from Firebase
  useEffect(() => {
    const fetchChatsAndFriends = async () => {
      if (!user?.uid) return
      setIsLoadingChats(true)
      try {
        const [userChats, userFriends] = await Promise.all([
          getUserChats(user.uid),
          getUserFriends(user.uid)
        ])
        
        const formattedChats = userChats.map(chat => ({
          id: chat.userId,
          displayName: chat.displayName || "Anggota",
          email: chat.email || "",
          lastMessage: chat.lastMessage || "Tidak ada pesan",
          lastMessageTime: chat.lastMessageTime,
          unread: chat.read ? 0 : 1,
          online: true,
        }))

        setChats(formattedChats)
        setFriends(userFriends)

        if (!selectedChatInternal && formattedChats.length > 0) {
          setSelectedChatInternal(formattedChats[0].id)
        }
      } catch (error) {
        console.error("Error fetching chats:", error)
      } finally {
        setIsLoadingChats(false)
      }
    }

    fetchChatsAndFriends()
  }, [user?.uid])

  // Fetch pending messages
  useEffect(() => {
    const fetchPendingMessages = async () => {
      if (!user?.uid) return
      setIsLoadingPending(true)
      try {
        const [pendingMsgs, pendingReqs] = await Promise.all([
          getPendingMessages(user.uid),
          getPendingFriendRequests(user.uid),
        ])

        setPendingMessages(pendingMsgs)
        setPendingRequests(pendingReqs)
      } catch (error) {
        console.error("Error fetching pending messages:", error)
      } finally {
        setIsLoadingPending(false)
      }
    }

    fetchPendingMessages()
  }, [user?.uid])

  // Fetch messages for selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.uid || !selectedChatInternal) return
      
      setIsLoadingMessages(true)
      try {
        const messagesData = await getConversation(user.uid, selectedChatInternal)
        if (messagesData && messagesData.length > 0) {
          // mark incoming messages as read on load
          for (const m of (messagesData as any[])) {
            try {
              if (!m.read && m.receiverId === user.uid) {
                await markMessageAsRead(m.id)
              }
            } catch (err) {
              console.error("Error marking message read:", err)
            }
          }

          const formattedMessages = messagesData.map((msg: any) => ({
            id: msg.id,
            sender: msg.sender || "User",
            authorId: msg.senderId,
            isOwn: msg.senderId === user.uid,
            text: msg.text,
            timestamp: msg.timestamp?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) || "",
            read: msg.read,
          }))
          setMessages(formattedMessages)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [selectedChatInternal, user?.uid])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Search users
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length === 0) {
      setSearchResults([])
      return
    }

    try {
      const results = await searchUsers(query)
      // Filter out current user
      setSearchResults(results.filter(r => r.id !== user?.uid))
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!user || !inputText.trim() || !selectedChatInternal) return
    
    setIsSending(true)
    try {
      await sendMessageWithFriendCheck(user.uid, selectedChatInternal, inputText)
      
      const newMessage: Message = {
        id: String(messages.length + 1),
        sender: userProfile?.displayName || "User",
        authorId: user.uid,
        isOwn: true,
        text: inputText,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages([...messages, newMessage])
      setInputText("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Gagal mengirim pesan")
    } finally {
      setIsSending(false)
    }
  }

  const handleAcceptRequest = async (senderId: string) => {
    if (!user?.uid) return
    try {
      await acceptFriendRequest(user.uid, senderId)
      // Remove from pending messages
      setPendingMessages(pending => pending.filter(p => p.senderId !== senderId))
      // Add to chats
      const senderData = await getUserProfile(senderId)
      if (senderData) {
        setChats(prev => [...prev, {
          id: senderId,
          displayName: senderData.displayName || "Anggota",
          email: senderData.email || "",
          lastMessage: "Percakapan dimulai",
          lastMessageTime: new Date(),
          unread: 0,
          online: true,
        }])
      }
      alert("Friend request diterima!")
    } catch (error) {
      console.error("Error accepting request:", error)
    }
  }

  const handleRejectRequest = async (senderId: string) => {
    if (!user?.uid) return
    try {
      await rejectFriendRequest(user.uid, senderId)
      setPendingMessages(pending => pending.filter(p => p.senderId !== senderId))
      alert("Friend request ditolak")
    } catch (error) {
      console.error("Error rejecting request:", error)
    }
  }

  const handleStartChat = (userId: string) => {
    setSelectedChatInternal(userId)
    setActiveTab("chats")
    setShowSearch(false)
    setSearchQuery("")
    setSearchResults([])
  }

  const getCurrentChat = () => {
    return chats.find((c) => c.id === selectedChatInternal) || chats[0]
  }

  const currentChat = getCurrentChat()

  // Show public profile if viewing
  if (viewingProfileId) {
    return (
      <div className="h-screen lg:h-[calc(100vh-80px)] bg-white p-4 sm:p-6 overflow-y-auto">
        <PublicProfile
          userId={viewingProfileId}
          onBack={() => setViewingProfileId(null)}
          onMessage={handleStartChat}
        />
      </div>
    )
  }

  return (
    <div className="h-screen lg:h-[calc(100vh-80px)] bg-white flex flex-col lg:flex-row">
      {/* Desktop Chat List - Hidden on mobile */}
      <div className="hidden lg:flex w-96 border-r border-slate-200 flex-col bg-white">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 px-4 py-3 font-semibold transition ${
              activeTab === "chats"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Pesan
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 px-4 py-3 font-semibold transition relative ${
              activeTab === "requests"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Permintaan
            {pendingRequests.length + pendingMessages.length > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {pendingRequests.length + pendingMessages.length}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        {activeTab === "chats" && (
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari user atau pesan..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSearch(true)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
        )}

        {/* Chat List or Pending Requests */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
          {activeTab === "chats" ? (
            // CHATS TAB
            <>
              {showSearch && searchResults.length > 0 ? (
                // Search Results
                <div>
                  <p className="text-xs text-slate-500 px-4 py-2 font-semibold">Hasil Pencarian</p>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleStartChat(result.id)}
                      className="w-full p-4 text-left hover:bg-slate-50 transition flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {result.displayName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900">{result.displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{result.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // Regular chat list
                <>
                  {isLoadingChats ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : chats.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">
                      <p className="text-sm">Tidak ada percakapan</p>
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedChatInternal(chat.id)}
                        className={`w-full p-4 text-left hover:bg-slate-50 transition ${
                          selectedChatInternal === chat.id ? "bg-blue-50 border-l-4 border-primary" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center font-bold text-sm">
                              {chat.displayName?.charAt(0).toUpperCase() || "A"}
                            </div>
                            {chat.online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm">{chat.displayName}</h3>
                            <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                          </div>

                          {chat.unread > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                              {chat.unread}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </>
              )}
            </>
          ) : (
            // REQUESTS TAB
            <>
              {isLoadingPending ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
                </div>
                ) : pendingRequests.length === 0 && pendingMessages.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <p className="text-sm">Tidak ada permintaan pesan</p>
                </div>
                ) : (
                  <>
                    {pendingRequests.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 px-4 py-2 font-semibold">Permintaan Pertemanan</p>
                        {pendingRequests.map((req) => (
                          <div key={req.id} className="p-4 border-b border-slate-200 hover:bg-slate-50 transition">
                            <div className="flex items-start gap-3 mb-3">
                              <button
                                onClick={() => setViewingProfileId(req.id)}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 hover:opacity-80 transition"
                              >
                                {req.displayName?.charAt(0).toUpperCase() || "U"}
                              </button>
                              <div className="flex-1 min-w-0">
                                <button
                                  onClick={() => setViewingProfileId(req.id)}
                                  className="font-semibold text-slate-900 text-sm hover:text-primary transition"
                                >
                                  {req.displayName || "User"}
                                </button>
                                <p className="text-xs text-slate-500">{req.email}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  if (!user?.uid) return
                                  try {
                                    await acceptFriendRequest(user.uid, req.id)
                                    setPendingRequests(prev => prev.filter(p => p.id !== req.id))
                                    const senderData = await getUserProfile(req.id)
                                    if (senderData) {
                                      setChats(prev => [...prev, {
                                        id: req.id,
                                        displayName: senderData.displayName || "Anggota",
                                        email: senderData.email || "",
                                        lastMessage: "Percakapan dimulai",
                                        lastMessageTime: new Date(),
                                        unread: 0,
                                        online: true,
                                      }])
                                    }
                                    alert("Permintaan pertemanan diterima")
                                  } catch (err) {
                                    console.error(err)
                                  }
                                }}
                                className="flex-1 px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-semibold hover:bg-green-200 transition flex items-center justify-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Terima
                              </button>
                              <button
                                onClick={async () => {
                                  if (!user?.uid) return
                                  try {
                                    await rejectFriendRequest(user.uid, req.id)
                                    setPendingRequests(prev => prev.filter(p => p.id !== req.id))
                                    alert("Permintaan pertemanan ditolak")
                                  } catch (err) {
                                    console.error(err)
                                  }
                                }}
                                className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition flex items-center justify-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                Tolak
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {pendingMessages.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 px-4 py-2 font-semibold">Pesan dari Non-Teman</p>
                        {pendingMessages.map((msg) => (
                          <div key={msg.id} className="p-4 border-b border-slate-200 hover:bg-slate-50 transition">
                            <div className="flex items-start gap-3 mb-3">
                              <button
                                onClick={() => setViewingProfileId(msg.senderId)}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 hover:opacity-80 transition"
                              >
                                {msg.senderData?.displayName?.charAt(0).toUpperCase() || "U"}
                              </button>
                              <div className="flex-1 min-w-0">
                                <button
                                  onClick={() => setViewingProfileId(msg.senderId)}
                                  className="font-semibold text-slate-900 text-sm hover:text-primary transition"
                                >
                                  {msg.senderData?.displayName || "User"}
                                </button>
                                <p className="text-xs text-slate-500">{msg.senderData?.email}</p>
                                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{msg.text}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptRequest(msg.senderId)}
                                className="flex-1 px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-semibold hover:bg-green-200 transition flex items-center justify-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Terima
                              </button>
                              <button
                                onClick={() => handleRejectRequest(msg.senderId)}
                                className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition flex items-center justify-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                Tolak
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {currentChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-primary to-blue-700 text-white flex items-center justify-between border-b border-blue-600 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-blue-600 rounded transition lg:hidden">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewingProfileId(selectedChatInternal)}
                className="flex items-center gap-3 hover:opacity-80 transition"
              >
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center font-bold">
                  {currentChat.displayName?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">{currentChat.displayName}</h3>
                  <p className="text-xs text-blue-100">{currentChat.online ? "Online" : "Offline"}</p>
                </div>
              </button>
            </div>
            <button className="p-2 hover:bg-blue-600 rounded transition">⋮</button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {isLoadingMessages ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                <p className="text-sm">Mulai percakapan dengan mengirim pesan 👋</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                      message.isOwn
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-slate-200 text-slate-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm sm:text-base break-words">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.isOwn ? "text-blue-100" : "text-slate-600"}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik pesan..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold text-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{isSending ? "..." : "Kirim"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <p className="text-sm">Pilih percakapan atau cari user untuk mulai chat</p>
        </div>
      )}
    </div>
  )
}
