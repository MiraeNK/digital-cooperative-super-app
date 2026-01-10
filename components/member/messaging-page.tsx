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

  const chatName = selectedChatId === "admin" ? "Admin Koperasi" : "Budi Santoso"

  return (
    <div className="h-screen lg:h-[calc(100vh-80px)] bg-white flex flex-col">
      {/* Chat Header */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-primary to-blue-700 text-white flex items-center justify-between border-b border-blue-600 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-blue-600 rounded transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center font-bold">
            {chatName.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold">{chatName}</h3>
            <p className="text-xs text-blue-100">Online</p>
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
                message.isOwn ? "bg-primary text-white rounded-br-none" : "bg-slate-200 text-slate-900 rounded-bl-none"
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
  )
}
