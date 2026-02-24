"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Mail, Phone, MapPin, UserPlus, Check, Clock, Award } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getUserProfile, sendFriendRequest } from "@/lib/firebase"

interface PublicProfileProps {
  userId: string
  onBack?: () => void
  onMessage?: (userId: string) => void
  inlineView?: boolean
}

export default function PublicProfile({ userId, onBack, onMessage, inlineView }: PublicProfileProps) {
  const { user, userProfile } = useAuth()
  const [publicUser, setPublicUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "friend">("none")
  const [isRequesting, setIsRequesting] = useState(false)

  const isOwnProfile = user?.uid === userId

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!publicUser) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 font-semibold">User tidak ditemukan</p>
        {onBack && (
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition">
            Kembali
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`${!inlineView ? "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4" : ""}`}>
      <div className={!inlineView ? "max-w-2xl mx-auto" : ""}>
        {/* Header - Only show if not inline */}
        {!inlineView && onBack && (
          <div className="mb-6">
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition font-semibold mb-4">
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden border-l-4 border-primary">
          {/* Cover Background */}
          <div className="h-40 bg-gradient-to-r from-primary to-blue-700 opacity-90"></div>

          {/* Profile Content */}
          <div className="px-6 sm:px-8 py-8 -mt-20 relative z-10">
            {/* Avatar - Positioned over cover */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center text-5xl font-bold shadow-lg border-4 border-white">
                {publicUser.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              
              {/* Role Badge */}
              {publicUser.role && (
                <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                  publicUser.role === "admin"
                    ? "bg-red-100 text-red-700"
                    : publicUser.role === "writer"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-primary"
                }`}>
                  {publicUser.role === "admin" ? "Admin" : publicUser.role === "writer" ? "Penulis" : "Member"}
                </span>
              )}
            </div>

            {/* Name and Status */}
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {publicUser.displayName || "User"}
            </h2>

            {/* Verified Badge */}
            {publicUser.memberId && (
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-green-50 rounded-lg border-2 border-green-200">
                <Award className="w-4 h-4 text-green-700" />
                <div>
                  <p className="text-xs text-green-700 font-bold">Member Terverifikasi</p>
                  <p className="text-xs text-green-600">{publicUser.memberId}</p>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="my-6 border-t border-slate-200"></div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              {publicUser.email && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 transition">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Email</p>
                    <p className="font-semibold text-slate-900 text-sm break-all">{publicUser.email}</p>
                  </div>
                </div>
              )}

              {publicUser.phoneNumber && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 transition">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Telepon</p>
                    <p className="font-semibold text-slate-900 text-sm">{publicUser.phoneNumber}</p>
                  </div>
                </div>
              )}

              {publicUser.address && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 transition">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Alamat</p>
                    <p className="font-semibold text-slate-900 text-sm">{publicUser.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-slate-200"></div>

            {/* Action Buttons */}
            {!isOwnProfile && user?.uid && (
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Message Button */}
                <button
                  onClick={handleMessage}
                  className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Mail className="w-5 h-5" />
                  Pesan
                </button>

                {/* Friend Request Button */}
                {friendStatus === "none" && (
                  <button
                    onClick={handleSendFriendRequest}
                    disabled={isRequesting}
                    className="flex-1 px-6 py-3 bg-blue-50 text-primary font-bold rounded-xl hover:bg-blue-100 border-2 border-primary transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UserPlus className="w-5 h-5" />
                    {isRequesting ? "Mengirim..." : "Tambah Teman"}
                  </button>
                )}

                {/* Pending Request Status */}
                {friendStatus === "pending" && (
                  <button disabled className="flex-1 px-6 py-3 bg-yellow-50 text-yellow-700 font-bold rounded-xl border-2 border-yellow-300 flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    Menunggu
                  </button>
                )}

                {/* Friend Badge */}
                {friendStatus === "friend" && (
                  <button disabled className="flex-1 px-6 py-3 bg-green-50 text-green-700 font-bold rounded-xl border-2 border-green-300 flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Teman
                  </button>
                )}
              </div>
            )}

            {isOwnProfile && (
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-primary text-center">
                <p className="text-sm font-bold text-primary">Ini adalah profil Anda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
