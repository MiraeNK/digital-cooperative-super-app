"use client"

import { useState, useRef, useEffect } from "react"
<<<<<<< Updated upstream
import { Send, ArrowLeft, Search, Check, X, MessageSquare, User, BookOpen, Eye, Heart, Phone, Mail, MapPin, Clock } from "lucide-react"
=======
import { Send, ArrowLeft, Search, Check, X, MessageSquare, User } from "lucide-react"
>>>>>>> Stashed changes
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
  searchUsers
} from "@/lib/firebase"

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

interface PendingMessage {
  id: string
  senderId: string
  receiverId: string
  text: string
  timestamp?: Date
  read: boolean
  senderData?: any
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

  // Tab states for Sidebar
  const [activeTab, setActiveTab] = useState<"chats" | "requests">("chats")
  const [inputText, setInputText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearch, setShowSearch] = useState(false)

<<<<<<< Updated upstream
  // Articles state
  const [partnerArticles, setPartnerArticles] = useState<any[]>([])
  const [isLoadingArticles, setIsLoadingArticles] = useState(false)
  
  // Partner profile state
  const [partnerProfile, setPartnerProfile] = useState<any | null>(null)
=======
  // Profile view state
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null)
>>>>>>> Stashed changes

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Data states
  const [chats, setChats] = useState<Chat[]>([])
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [selectedChatInternal, setSelectedChatInternal] = useState<string>(selectedChatId || "")
  const [messages, setMessages] = useState<Message[]>([])
  const [friends, setFriends] = useState<any[]>([])

  // Get current chat
  const currentChat = chats.find(c => c.id === selectedChatInternal)

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
  }, [user?.uid, selectedChatInternal])

  // Fetch pending messages
  useEffect(() => {
    const fetchPending = async () => {
      if (!user?.uid) return
      setIsLoadingPending(true)
      try {
        const [pending, requests] = await Promise.all([
          getPendingMessages(user.uid),
          getPendingFriendRequests(user.uid)
        ])
        setPendingMessages(pending || [])
        setPendingRequests(requests || [])
      } catch (error) {
        console.error("Error fetching pending:", error)
      } finally {
        setIsLoadingPending(false)
      }
    }

    fetchPending()
  }, [user?.uid])

<<<<<<< Updated upstream
  // Fetch partner articles when tab changes
  useEffect(() => {
    const fetchPartnerArticles = async () => {
      if (chatDetailTab !== "articles" || !selectedChatInternal) return
      
      setIsLoadingArticles(true)
      try {
        const articles = await getArticlesByAuthor(selectedChatInternal)
        setPartnerArticles(articles || [])
      } catch (error) {
        console.error("Error fetching partner articles:", error)
        setPartnerArticles([])
      } finally {
        setIsLoadingArticles(false)
      }
    }

    fetchPartnerArticles()
  }, [chatDetailTab, selectedChatInternal])

  // Fetch partner profile when profile tab opens
  useEffect(() => {
    const fetchPartnerProfile = async () => {
      if (chatDetailTab !== "profile" || !selectedChatInternal) return
      
      try {
        const profile = await getUserProfile(selectedChatInternal)
        setPartnerProfile(profile)
      } catch (error) {
        console.error("Error fetching partner profile:", error)
      }
    }

    fetchPartnerProfile()
  }, [chatDetailTab, selectedChatInternal])

=======
>>>>>>> Stashed changes
  // Fetch messages for selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.uid || !selectedChatInternal) return
      
      setIsLoadingMessages(true)
      try {
        const messagesData = await getConversation(user.uid, selectedChatInternal)
        if (messagesData && messagesData.length > 0) {
          for (const m of (messagesData as any[])) {
            try {
              if (!m.read && m.receiverId === user.uid) {
                await markMessageAsRead(m.id)
              }
            } catch (err) {
              console.error("Error marking message read:", err)
            }
          }
          
          const formattedMessages: Message[] = messagesData.map(msg => ({
            id: msg.id,
            sender: msg.senderName || msg.senderId,
            authorId: msg.senderId,
            isOwn: msg.senderId === user.uid,
            text: msg.text,
            timestamp: msg.timestamp instanceof Date 
              ? msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
              : new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            read: msg.read,
          }))
          
          setMessages(formattedMessages)
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [user?.uid, selectedChatInternal])

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user?.uid || !selectedChatInternal) return

    setIsSending(true)
    try {
      await sendMessageWithFriendCheck(user.uid, selectedChatInternal, inputText)
      setInputText("")
      
      // Refresh messages
      const messagesData = await getConversation(user.uid, selectedChatInternal)
      if (messagesData) {
        const formattedMessages: Message[] = messagesData.map(msg => ({
          id: msg.id,
          sender: msg.senderName || msg.senderId,
          authorId: msg.senderId,
          isOwn: msg.senderId === user.uid,
          text: msg.text,
          timestamp: msg.timestamp instanceof Date 
            ? msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            : new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          read: msg.read,
        }))
        setMessages(formattedMessages)
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
      }
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
      
      setPendingRequests(prev => prev.filter(p => p.id !== senderId))
      setPendingMessages(prev => prev.filter(p => p.senderId !== senderId))
      
      // Refresh chats list
      const updatedChats = await getUserChats(user.uid)
      if (updatedChats && updatedChats.length > 0) {
        const formattedChats = updatedChats.map(chat => ({
          id: chat.userId,
          displayName: chat.displayName || "Anggota",
          email: chat.email || "",
          lastMessage: chat.lastMessage || "Percakapan dimulai",
          lastMessageTime: chat.lastMessageTime,
          unread: chat.read ? 0 : 1,
          online: true,
        }))
        setChats(formattedChats)
      }
      
      alert("Friend request diterima!")
    } catch (error) {
      console.error("Error accepting request:", error)
      alert("Gagal menerima friend request")
    }
  }

  const handleRejectRequest = async (senderId: string) => {
    if (!user?.uid) return
    try {
      await rejectFriendRequest(user.uid, senderId)
      setPendingRequests(prev => prev.filter(p => p.id !== senderId))
      alert("Permintaan pertemanan ditolak")
    } catch (error) {
      console.error("Error rejecting request:", error)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const results = await searchUsers(query)
      setSearchResults(results || [])
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  // Group pending messages by sender to show latest per sender
  const groupedPending = new Map<string, PendingMessage>()
  pendingMessages.forEach(msg => {
    if (!groupedPending.has(msg.senderId)) {
      groupedPending.set(msg.senderId, msg)
    }
  })

  return (
    <div className="flex h-full bg-white">
      {/* Left Sidebar - Chat List */}
      <div className="w-full sm:w-80 bg-white border-r border-slate-200 flex flex-col max-h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Pesan</h2>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari percakapan..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition ${
                activeTab === "chats"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Teman ({chats.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition ${
                activeTab === "requests"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Permintaan ({pendingRequests.length})
            </button>
          </div>
        </div>

        {/* Chat List or Requests List */}
        <div className="flex-1 overflow-y-auto">
          {/* Search Results */}
          {showSearch && searchResults.length > 0 && (
            <div className="p-4 border-b border-slate-200">
              <p className="text-xs text-slate-500 font-semibold mb-3">HASIL PENCARIAN</p>
              {searchResults.map(result => (
                <button
                  key={result.id}
                  onClick={() => setSelectedChatInternal(result.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition mb-2"
                >
                  <p className="font-semibold text-slate-900">{result.displayName}</p>
                  <p className="text-xs text-slate-500">{result.email}</p>
                </button>
              ))}
            </div>
          )}

          {/* Chats Tab */}
          {activeTab === "chats" && (
            <>
              {isLoadingChats ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold">Belum ada percakapan</p>
                  <p className="text-slate-500 text-sm">Mulai percakapan baru</p>
                </div>
              ) : (
                <div className="p-2">
                  {chats.map(chat => (
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
                          {chat.displayName?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <p className="font-semibold text-slate-900">{chat.displayName}</p>
                            {chat.unread > 0 && (
                              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                {chat.unread}
                              </span>
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

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <>
              {isLoadingPending ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold">Tidak ada permintaan</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="p-4 bg-white rounded-xl border-2 border-yellow-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {req.displayName?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{req.displayName}</p>
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
                              setPendingMessages(prev => prev.filter(p => p.senderId !== req.id))
                              
                              const updatedChats = await getUserChats(user.uid)
                              if (updatedChats && updatedChats.length > 0) {
                                const formattedChats = updatedChats.map(chat => ({
                                  id: chat.userId,
                                  displayName: chat.displayName || "Anggota",
                                  email: chat.email || "",
                                  lastMessage: chat.lastMessage || "Percakapan dimulai",
                                  lastMessageTime: chat.lastMessageTime,
                                  unread: chat.read ? 0 : 1,
                                  online: true,
                                }))
                                setChats(formattedChats)
                              }
                              alert("Permintaan pertemanan diterima")
                            } catch (err) {
                              console.error(err)
                              alert("Gagal menerima permintaan pertemanan")
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Terima
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4" />
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

      {/* Right Side - Chat Detail */}
      {currentChat ? (
        <div className="hidden sm:flex flex-1 flex-col bg-white">
          {/* Chat Header */}
<<<<<<< Updated upstream
          <div className="px-6 py-4 bg-gradient-to-r from-primary to-blue-700 text-white flex items-center justify-between border-b border-blue-600 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-30 flex items-center justify-center font-bold text-lg">
                {currentChat.displayName?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{currentChat.displayName}</h3>
                <p className="text-xs text-blue-100">{currentChat.online ? "Online" : "Offline"}</p>
              </div>
=======
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-primary to-blue-700 text-white flex items-center justify-between border-b border-blue-600 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-blue-600 rounded transition lg:hidden">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                // Tombol di header sekarang langsung membuka Profil di halaman full, bukan tab!
                onClick={() => setViewingProfileId(currentChat.id)}
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
>>>>>>> Stashed changes
            </div>
            <button onClick={onBack} className="p-2 hover:bg-blue-600 rounded-lg transition hidden">⋮</button>
          </div>

<<<<<<< Updated upstream
          {/* Chat Detail Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setChatDetailTab("messages")}
              className={`flex-1 px-4 py-3 font-semibold text-sm transition border-b-2 ${
                chatDetailTab === "messages"
                  ? "text-primary border-primary bg-white"
                  : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Pesan
            </button>
            <button
              onClick={() => setChatDetailTab("articles")}
              className={`flex-1 px-4 py-3 font-semibold text-sm transition border-b-2 ${
                chatDetailTab === "articles"
                  ? "text-primary border-primary bg-white"
                  : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Artikel
            </button>
            <button
              onClick={() => setChatDetailTab("profile")}
              className={`flex-1 px-4 py-3 font-semibold text-sm transition border-b-2 ${
                chatDetailTab === "profile"
                  ? "text-primary border-primary bg-white"
                  : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profil
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto bg-white">
            {/* Messages Tab */}
            {chatDetailTab === "messages" && (
              <div className="p-6 space-y-4 h-full flex flex-col">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <p className="text-sm">Mulai percakapan dengan mengirim pesan 👋</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs px-4 py-3 rounded-2xl ${
                            message.isOwn
                              ? "bg-primary text-white rounded-br-none"
                              : "bg-slate-100 text-slate-900 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm break-words">{message.text}</p>
                          <p className={`text-xs mt-1 ${message.isOwn ? "text-blue-100" : "text-slate-500"}`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            )}

            {/* Articles Tab */}
            {chatDetailTab === "articles" && (
              <div className="p-6">
                {isLoadingArticles ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : partnerArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-semibold">{currentChat.displayName} belum memiliki artikel</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {partnerArticles.map((article) => (
=======
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
            <div className="p-4 sm:p-6 space-y-4 h-full flex flex-col">
              {isLoadingMessages ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <p className="text-sm">Mulai percakapan dengan mengirim pesan 👋</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {chatDetailTab === "profile" && (
              <div className="p-6">
                {!partnerProfile ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center text-4xl font-bold">
                        {currentChat.displayName?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900">{currentChat.displayName}</h3>
                      {partnerProfile?.role && (
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-primary rounded-full text-xs font-semibold">
                          {partnerProfile.role === "admin" ? "Admin" : partnerProfile.role === "writer" ? "Penulis" : "Member"}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-3">
                      {currentChat.email && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-semibold">EMAIL</p>
                            <p className="text-sm text-slate-900 break-all">{currentChat.email}</p>
                          </div>
                        </div>
                      )}
                      {partnerProfile?.phoneNumber && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-semibold">TELEPON</p>
                            <p className="text-sm text-slate-900">{partnerProfile.phoneNumber}</p>
                          </div>
                        </div>
                      )}
                      {partnerProfile?.address && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-semibold">ALAMAT</p>
                            <p className="text-sm text-slate-900">{partnerProfile.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message Input - Only show on messages tab */}
          {chatDetailTab === "messages" && (
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex-shrink-0">
              <div className="flex gap-3">
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
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !inputText.trim()}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? "..." : "Kirim"}
                </button>
              </div>
=======
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
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
                disabled={isSending || !inputText.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold text-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{isSending ? "..." : "Kirim"}</span>
              </button>
>>>>>>> Stashed changes
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden lg:flex items-center justify-center bg-white">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-semibold">Pilih percakapan untuk memulai</p>
          </div>
        </div>
      )}
    </div>
  )
}