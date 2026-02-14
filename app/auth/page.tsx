"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, User, Mail, Loader2 } from "lucide-react"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup // Import untuk Popup Google
} from "firebase/auth"
import { auth, googleProvider, createUserProfile } from "@/lib/firebase" // Import googleProvider
import { useToast } from "@/components/ui/use-toast" // Pastikan import ini ada jika pakai toast

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  // const { toast } = useToast() // Aktifkan jika sudah fix path toast

  // --- FUNGSI LOGIN GOOGLE ---
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Simpan data user Google ke database (otomatis jadi Member jika belum ada)
      await createUserProfile(user, user.displayName || "User Google")
      
      // alert("Login Google Berhasil!") 
      router.push("/app")
    } catch (error: any) {
      console.error("Google Auth Error:", error)
      alert("Gagal login dengan Google. Coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }
  // ---------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(auth, email, password)
        router.push("/app")
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        if (name) await updateProfile(user, { displayName: name })
        await createUserProfile(user, name)
        router.push("/app")
      }
    } catch (error: any) {
      console.error("Auth Error:", error)
      let msg = "Terjadi kesalahan sistem."
      if (error.code === 'auth/invalid-credential') msg = "Email atau password salah."
      if (error.code === 'auth/email-already-in-use') msg = "Email sudah terdaftar."
      if (error.code === 'auth/weak-password') msg = "Password minimal 6 karakter."
      alert(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* KIRI: BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-blue-600 to-blue-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center font-bold text-3xl text-primary">K4</div>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight">Koperasi Digital Masa Depan</h1>
          <p className="text-blue-100 text-lg max-w-md">Satu platform untuk semua kebutuhan transaksi dan bisnis digital Anda</p>
        </div>
      </div>

      {/* KANAN: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Koperasi 4.0</h1>
          </div>

          <div className="flex gap-2 mb-8 bg-slate-50 p-1 rounded-lg">
            <button onClick={() => setAuthMode("login")} className={`flex-1 py-3 font-semibold rounded-md transition ${authMode === "login" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Login</button>
            <button onClick={() => setAuthMode("register")} className={`flex-1 py-3 font-semibold rounded-md transition ${authMode === "register" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Register</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Nama Anda" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" required />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</> : (authMode === "login" ? "Masuk Sekarang" : "Buat Akun")}
            </button>
          </form>

          {/* --- BAGIAN TOMBOL GOOGLE --- */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">Atau lanjut dengan</span></div>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium text-slate-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0 6.634-5.283 12-11.81 12-3.106 0-5.974-1.18-8.083-3.116m16.894-5.884v.5c0 2.285-1.822 4.174-4.104 4.174-2.29 0-4.136-1.889-4.136-4.174" stroke="#4285F4" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="9.5" fill="#4285F4" opacity="0.1"/>
                <path d="M9.6 12c0 1.32 1.074 2.4 2.4 2.4 1.326 0 2.4-1.074 2.4-2.4 0-1.326-1.074-2.4-2.4-2.4-1.326 0-2.4 1.074-2.4 2.4z" fill="#EA4335"/>
                <path d="M3.9 12c0 1.32-1.074 2.4-2.4 2.4-1.326 0-2.4-1.074-2.4-2.4 0-1.326 1.074-2.4 2.4-2.4 1.326 0 2.4 1.074 2.4 2.4z" fill="#FBBC04"/>
                <path d="M12 20.1c-1.326 0-2.4 1.074-2.4 2.4 0 1.326 1.074 2.4 2.4 2.4 1.326 0 2.4-1.074 2.4-2.4-0.006-1.326-1.074-2.4-2.4-2.4z" fill="#34A853"/>
              </svg>
              <span>Masuk dengan Google</span>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  )
}