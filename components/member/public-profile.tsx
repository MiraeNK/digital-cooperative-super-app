"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Mail, Phone, MapPin, UserPlus, Check, Clock } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getUserProfile, sendFriendRequest } from "@/lib/firebase"

interface PublicProfileProps {
  userId: string
  onBack?: () => void
  onMessage?: (userId: string) => void
}

export default function PublicProfile({ userId, onBack, onMessage }: PublicProfileProps) {
  const { user, userProfile } = useAuth()
  const [publicUser, setPublicUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "friend">("none")
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const userData = await getUserProfile(userId)
        if (userData) {
          setPublicUser(userData)
          
          // Check friend status
          if (userData.friends?.includes(user?.uid)) {
            setFriendStatus("friend")
          } else if (userData.pendingFriendRequests?.includes(user?.uid)) {
            setFriendStatus("pending")
          } else {
            setFriendStatus("none")
          }
        }
      } catch (error) {
        console.error("Error fetching public profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId, user?.uid])

  const handleSendFriendRequest = async () => {
    if (!user?.uid) {
      alert("Silakan login terlebih dahulu")
      return
    }

    setIsRequesting(true)
    try {
      await sendFriendRequest(user.uid, userId)
      setFriendStatus("pending")
      alert("Friend request dikirim!")
    } catch (error: any) {
      console.error("Error sending friend request:", error)
      alert(error.message || "Gagal mengirim friend request")
    } finally {
      setIsRequesting(false)
    }
  }

  const handleMessage = () => {
    if (!user?.uid) {
      alert("Silakan login terlebih dahulu")
      return
    }
    onMessage?.(userId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!publicUser) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 font-semibold">User tidak ditemukan</p>
        {onBack && (
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition">
            Kembali
          </button>
        )}
      </div>
    )
  }

  const isOwnProfile = user?.uid === userId

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-slate-200">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        )}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex-1">{publicUser.displayName || "User"}</h3>
      </div>

      {/* Profile Content */}
      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center text-4xl font-bold">
            {publicUser.displayName?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3">
          {publicUser.email && (
            <div className="flex items-center gap-3 text-slate-700">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-sm">{publicUser.email}</p>
              </div>
            </div>
          )}

          {publicUser.phoneNumber && (
            <div className="flex items-center gap-3 text-slate-700">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Nomor Telepon</p>
                <p className="font-medium text-sm">{publicUser.phoneNumber}</p>
              </div>
            </div>
          )}

          {publicUser.address && (
            <div className="flex items-center gap-3 text-slate-700">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Alamat</p>
                <p className="font-medium text-sm">{publicUser.address}</p>
              </div>
            </div>
          )}

          {publicUser.memberId && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 font-semibold">✓ Member Terverifikasi</p>
              <p className="text-sm font-bold text-green-900">ID: {publicUser.memberId}</p>
            </div>
          )}
        </div>

        {/* Role Badge */}
        {publicUser.role && (
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              publicUser.role === "admin"
                ? "bg-red-100 text-red-700"
                : publicUser.role === "writer"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {publicUser.role === "admin" ? "Admin" : publicUser.role === "writer" ? "Penulis" : "Member"}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {!isOwnProfile && user?.uid && (
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            {/* Message Button */}
            <button
              onClick={handleMessage}
              className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Pesan
            </button>

            {/* Friend Request Button */}
            {friendStatus === "none" && (
              <button
                onClick={handleSendFriendRequest}
                disabled={isRequesting}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {isRequesting ? "Mengirim..." : "Add Friend"}
              </button>
            )}

            {/* Pending Request Status */}
            {friendStatus === "pending" && (
              <button disabled className="flex-1 px-4 py-3 bg-yellow-100 text-yellow-700 font-semibold rounded-lg flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Menunggu
              </button>
            )}

            {/* Friend Badge */}
            {friendStatus === "friend" && (
              <button disabled className="flex-1 px-4 py-3 bg-green-100 text-green-700 font-semibold rounded-lg flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Teman
              </button>
            )}
          </div>
        )}

        {isOwnProfile && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">Ini adalah profil Anda</p>
          </div>
        )}
      </div>
    </div>
  )
}
