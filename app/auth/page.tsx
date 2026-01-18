"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Lock, User, Mail } from "lucide-react"

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate auth delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (authMode === "login") {
      // Redirect to /app with default member view
      window.location.href = "/app"
    } else {
      // After register, show login
      setAuthMode("login")
      setEmail("")
      setPassword("")
      setName("")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-blue-600 to-blue-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center font-bold text-3xl text-primary">
              K4
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight">Koperasi Digital Masa Depan</h1>
          <p className="text-blue-100 text-lg max-w-md">
            Satu platform untuk semua kebutuhan transaksi dan bisnis digital Anda
          </p>

          <div className="pt-8 space-y-3 text-left text-blue-100">
            {[
              "Pembayaran tagihan tanpa biaya admin",
              "Marketplace dengan produk lokal",
              "Komunitas bisnis yang supportif",
              "Fitur penjual untuk UMKM",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs">✓</div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
              K4
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Koperasi 4.0</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-3 font-semibold rounded-lg transition ${
                authMode === "login" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className={`flex-1 py-3 font-semibold rounded-lg transition ${
                authMode === "register" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nama Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email / Member ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="tubagus.ahmad@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {authMode === "login" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                  <span className="text-sm text-slate-600">Ingat saya</span>
                </label>
                <a href="#" className="text-sm text-primary hover:text-blue-700 font-semibold">
                  Lupa password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 active:scale-95"
            >
              {isLoading ? "Loading..." : authMode === "login" ? "Login" : "Register"}
            </button>
          </form>

          {/* Quick Login Buttons (untuk prototyping) */}
          <div className="mt-6 space-y-2">
            <p className="text-center text-sm text-slate-600 mb-3">Demo Login (untuk testing):</p>
            <button
              onClick={() => {
                setEmail("admin@koperasi4.id")
                setPassword("admin123")
                window.location.href = "/app?role=admin"
              }}
              className="w-full py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition text-sm"
            >
              Login as Admin
            </button>
            <button
              onClick={() => {
                setEmail("tubagus.ahmad@email.com")
                setPassword("member123")
                window.location.href = "/app?role=member"
              }}
              className="w-full py-2 border border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition text-sm"
            >
              Login as Member
            </button>
            <button
              onClick={() => {
                setEmail("writer@koperasi4.id")
                setPassword("writer123")
                window.location.href = "/app?role=writer"
              }}
              className="w-full py-2 border border-green-300 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition text-sm"
            >
              Login as Writer
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-slate-600">
            {authMode === "login" ? (
              <p>
                Belum jadi anggota?{" "}
                <button
                  onClick={() => setAuthMode("register")}
                  className="text-primary font-semibold hover:text-blue-700"
                >
                  Daftar Sekarang
                </button>
              </p>
            ) : (
              <p>
                Sudah punya akun?{" "}
                <button onClick={() => setAuthMode("login")} className="text-primary font-semibold hover:text-blue-700">
                  Login Di Sini
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
