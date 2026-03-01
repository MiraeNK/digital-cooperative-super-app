"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Mail, Users, FileText, Heart } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getUserById, getArticlesByAuthor, getUserFriends, sendFriendRequest, sendMessageWithFriendCheck } from "@/lib/firebase"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const userId = params.userId as string

  const [userData, setUserData] = useState<any>(null)
  const [userArticles, setUserArticles] = useState<any[]>([])
  const [userConnections, setUserConnections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const profile = await getUserById(userId)
        setUserData(profile)

        if ((profile as any)?.role === "writer") {
          const articles = await getArticlesByAuthor(userId)
          setUserArticles(articles)
        }

        // Get user's friends/connections
        const connections = await getUserFriends(userId)
        const hydratedConnections = await Promise.all(
          (connections || []).map(async (connection: any) => {
            const friendId =
              typeof connection === "string"
                ? connection
                : connection?.friendId || connection?.id || ""
            if (!friendId) return null
            const friendProfile = await getUserById(friendId)
            return {
              id: friendId,
              friendId,
              displayName: friendProfile?.displayName || "Anggota",
            }
          })
        )
        setUserConnections(hydratedConnections.filter(Boolean))
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchUserData()
    }
  }, [userId])

  const handleSendFriendRequest = async () => {
    if (!user?.uid) return

    setIsSendingRequest(true)
    try {
      await sendFriendRequest(user.uid, userId)
      setIsFollowing(true)
      alert("Friend request sent!")
    } catch (error) {
      console.error("Error sending friend request:", error)
      alert("Failed to send friend request")
    } finally {
      setIsSendingRequest(false)
    }
  }

  const handleSendMessage = async () => {
    if (!user?.uid) return
    // Navigate to messaging page with this user
    router.push(`/app?chat=${userId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>
        <div className="text-center">
          <p className="text-slate-600">Pengguna tidak ditemukan</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = user?.uid === userId
  const totalArticles = userArticles.length
  const totalConnections = userConnections.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 pb-24">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-primary hover:text-blue-700 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-primary to-blue-600" />

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-between items-start -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userData.displayName?.charAt(0).toUpperCase() || "A"}
            </div>
            {!isOwnProfile && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSendMessage}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Pesan
                </button>
                <button
                  onClick={handleSendFriendRequest}
                  disabled={isSendingRequest || isFollowing}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-blue-50 transition text-sm disabled:opacity-50"
                >
                  <Users className="w-4 h-4" />
                  {isFollowing ? "Diminta" : "Tambah Teman"}
                </button>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{userData.displayName || "Pengguna"}</h1>
            <p className="text-sm text-slate-600 mb-3">{userData.email}</p>
            {(userData as any)?.role === "writer" && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-primary rounded-full text-xs font-semibold">
                ✍️ Penulis
              </span>
            )}
            {(userData as any)?.role === "admin" && (
              <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                👑 Admin
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-slate-200">
            <div className="text-center">
              <div className="text-xl font-bold text-primary">{totalConnections}</div>
              <div className="text-xs text-slate-600">Teman</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">{totalArticles}</div>
              <div className="text-xs text-slate-600">Artikel</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">{userData.createdAt ? "Anggota" : ""}</div>
              <div className="text-xs text-slate-600">Status</div>
            </div>
          </div>

          {/* Bio */}
          {userData.bio && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">{userData.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Articles Section */}
      {userData.role === "writer" && userArticles.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Artikel ({totalArticles})
          </h2>

          <div className="space-y-4">
            {userArticles.map((article) => (
              <div key={article.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <h3 className="font-semibold text-slate-900 mb-2">{article.title}</h3>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{article.description}</p>
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(article.createdAt).toLocaleDateString("id-ID")}</span>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    {article.likes || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends Section */}
      {userConnections.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Teman ({totalConnections})
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {userConnections.slice(0, 4).map((connection) => (
              <div
                key={connection.id}
                className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg cursor-pointer hover:shadow-md transition"
                onClick={() => router.push(`/profile/${connection.friendId}`)}
              >
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-2">
                  {connection.displayName?.charAt(0).toUpperCase() || "A"}
                </div>
                <p className="font-semibold text-sm text-slate-900">{connection.displayName}</p>
              </div>
            ))}
          </div>

          {totalConnections > 4 && (
            <button className="mt-4 w-full py-2 text-primary font-semibold hover:underline text-sm">
              Lihat Semua Teman
            </button>
          )}
        </div>
      )}
    </div>
  )
}
