"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth, getUserProfile } from "@/lib/firebase" 

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
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser)
      if (authUser) {
        // Ambil data tambahan (Role) dari database
        const profile = await getUserProfile(authUser.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}