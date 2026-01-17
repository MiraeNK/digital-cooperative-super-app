"use client"

import { useState, useRef, useEffect } from "react"
import { Send, ArrowLeft } from "lucide-react"

interface Message {
  id: string
  sender: string
  isOwn: boolean
  text: string
  timestamp: string
  read?: boolean
}

interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  unread: number
  online: boolean
}

interface MessagingPageProps {
  selectedChatId: string | null
  onBack: () => void
}

export default function MessagingPage({ selectedChatId, onBack }: MessagingPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "Admin Koperasi",
      isOwn: false,
      text: "Halo Tubagus, bagaimana kabar anda?",
      timestamp: "09:15",
      read: true,
    },
    {
      id: "2",
      sender: "Admin Koperasi",
      isOwn: false,
      text: "Ada pengumuman penting mengenai pembagian SHU bulan ini",
      timestamp: "09:16",
      read: true,
    },
    {
      id: "3",
      sender: "Tubagus",
      isOwn: true,
      text: "Baik Pak, terima kasih infonya. Kapan pembagiannya dilakukan?",
      timestamp: "10:20",
      read: true,
    },
    {
      id: "4",
      sender: "Admin Koperasi",
      isOwn: false,
      text: "Pembagian akan dilakukan tanggal 15 bulan depan setelah rapat anggota",
      timestamp: "10:25",
      read: true,
    },
  ])

  const [inputText, setInputText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [chats] = useState<Chat[]>([
    {
      id: "admin",
      name: "Admin Koperasi",
      avatar: "A",
      lastMessage: "Pembagian akan dilakukan tanggal 15...",
      unread: 2,
      online: true,
    },
    {
      id: "pelanggan",
      name: "Layanan Pelanggan",
      avatar: "L",
      lastMessage: "Transaksi pending sedang dicek...",
      unread: 1,
      online: false,
    },
    {
      id: "roni",
      name: "Roni Hermawan",
      avatar: "R",
      lastMessage: "Cabai rawit masih ada stok?",
      unread: 0,
      online: true,
    },
  ])

  const [selectedChatInternal, setSelectedChatInternal] = useState<string>(selectedChatId || "admin")

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: String(messages.length + 1),
        sender: "Tubagus",
        isOwn: true,
        text: inputText,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages([...messages, newMessage])
      setInputText("")
    }
  }

  const getCurrentChat = () => {
    return chats.find((c) => c.id === selectedChatInternal) || chats[0]
  }

  const currentChat = getCurrentChat()

  return (
    <div className="h-screen lg:h-[calc(100vh-80px)] bg-white flex flex-col lg:flex-row">
      {/* Desktop Chat List - Hidden on mobile */}
      <div className="hidden lg:flex w-80 border-r border-slate-200 flex-col bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Pesan</h2>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
          {chats.map((chat) => (
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
                    {chat.avatar}
                  </div>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm">{chat.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                </div>

                {chat.unread > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                    {chat.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-primary to-blue-700 text-white flex items-center justify-between border-b border-blue-600 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-blue-600 rounded transition lg:hidden">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center font-bold">
              {currentChat.avatar}
            </div>
            <div>
              <h3 className="font-semibold">{currentChat.name}</h3>
              <p className="text-xs text-blue-100">{currentChat.online ? "Online" : "Offline"}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-blue-600 rounded transition">⋮</button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
          {messages.map((message) => (
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
          ))}
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
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold text-sm"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
