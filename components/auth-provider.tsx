"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth, setUserOnline, setUserOffline, subscribeUserProfile } from "@/lib/firebase" 

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

    let unsubscribeProfile: (() => void) | null = null
    let visibilityHandler: (() => void) | null = null
    let beforeUnloadHandler: (() => void) | null = null

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser)
      if (authUser) {
        if (unsubscribeProfile) unsubscribeProfile()
        unsubscribeProfile = subscribeUserProfile(authUser.uid, (profile) => {
          setUserProfile(profile)
        })

        // Mark user online in Firestore presence
        try { await setUserOnline(authUser.uid) } catch (e) { /* ignore */ }
        // on unload / signout mark offline
        if (visibilityHandler) window.removeEventListener("visibilitychange", visibilityHandler)
        if (beforeUnloadHandler) window.removeEventListener("beforeunload", beforeUnloadHandler)
        visibilityHandler = async () => {
          if (document.hidden) await setUserOffline(authUser.uid)
        }
        beforeUnloadHandler = async () => { await setUserOffline(authUser.uid) }
        window.addEventListener("visibilitychange", visibilityHandler)
        window.addEventListener("beforeunload", beforeUnloadHandler)
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile()
          unsubscribeProfile = null
        }
        setUserProfile(null)
      }
      setLoading(false)
    })
    return () => {
      // cleanup presence listeners and set offline
      unsubscribe()
      if (unsubscribeProfile) unsubscribeProfile()
      if (auth?.currentUser?.uid) {
        try { setUserOffline(auth.currentUser.uid) } catch (e) { /* ignore */ }
      }
      if (visibilityHandler) window.removeEventListener("visibilitychange", visibilityHandler)
      if (beforeUnloadHandler) window.removeEventListener("beforeunload", beforeUnloadHandler)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
