"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth, getUserProfile, setUserOnline, setUserOffline } from "@/lib/firebase" 

type AuthContextType = {
  user: User | null
  userProfile: any | null 
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, loading: true })

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for skip login user first (for development/testing)
    if (typeof window !== "undefined") {
      const skipLoginUser = localStorage.getItem("skipLoginUser")
      if (skipLoginUser) {
        try {
          const parsedUser = JSON.parse(skipLoginUser)
          setUser({
            uid: parsedUser.uid,
            email: parsedUser.email,
            displayName: parsedUser.displayName,
          } as any)
          setUserProfile({
            uid: parsedUser.uid,
            email: parsedUser.email,
            displayName: parsedUser.displayName,
            role: parsedUser.role || "member",
          })
          setLoading(false)
          return
        } catch (e) {
          console.error("Error parsing skip login user:", e)
          localStorage.removeItem("skipLoginUser")
        }
      }
    }

    // Only set up auth listener if auth is available
    if (!auth) {
      console.warn("Auth is not initialized - running in development mode")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser)
      if (authUser) {
        // Ambil data tambahan (Role) dari database
        const profile = await getUserProfile(authUser.uid)
        setUserProfile(profile)
        // Mark user online in Firestore presence
        try { await setUserOnline(authUser.uid) } catch (e) { /* ignore */ }
        // on unload / signout mark offline
        const handleVisibility = async () => {
          if (document.hidden) await setUserOffline(authUser.uid)
        }
        window.addEventListener("visibilitychange", handleVisibility)
        window.addEventListener("beforeunload", async () => { await setUserOffline(authUser.uid) })
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return () => {
      // cleanup presence listeners and set offline
      unsubscribe()
      if (user) {
        try { setUserOffline(user.uid) } catch (e) { /* ignore */ }
      }
      window.removeEventListener("visibilitychange", () => {})
      window.removeEventListener("beforeunload", () => {})
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
