"use client"

import { ArrowRight, Smartphone, Zap, Users, ShoppingBag, QrCode, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                K4
              </div>
              <span className="font-bold text-lg text-primary hidden sm:inline">Koperasi 4.0</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-primary font-medium transition">
                Fitur
              </a>
              <a href="#benefits" className="text-slate-600 hover:text-primary font-medium transition">
                Manfaat
              </a>
              <a href="#app" className="text-slate-600 hover:text-primary font-medium transition">
                Download
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/app"
                className="hidden sm:inline-block px-4 py-2 text-slate-700 font-semibold hover:bg-slate-100 rounded-lg transition"
              >
                Coba Sekarang
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition"
              >
                Mulai <ArrowRight size={16} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pt-4 space-y-3 border-t border-slate-200">
              <a href="#features" className="block px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
                Fitur
              </a>
              <a href="#benefits" className="block px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
                Manfaat
              </a>
              <a href="#app" className="block px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
                Download
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8">
              <div>
                <span className="inline-block px-3 sm:px-4 py-2 bg-blue-100 text-primary font-semibold text-sm rounded-full">
                  Platform Digital Koperasi
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Satu Aplikasi untuk Semua Kebutuhan
              </h1>
              <p className="text-lg text-slate-600">
                Koperasi 4.0 menghadirkan ekosistem digital terlengkap untuk member koperasi. Dari pembayaran tagihan
                hingga belanja dan pinjaman digital.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition"
                >
                  Coba Sekarang <ArrowRight size={18} />
                </Link>
                <button className="px-6 sm:px-8 py-3 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary/5 transition">
                  Pelajari Lebih Lanjut
                </button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-64 sm:h-80 lg:h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl"></div>
              <div className="absolute inset-4 bg-white rounded-2xl border border-slate-200 shadow-lg p-4 space-y-4">
                <div className="h-10 bg-primary rounded-lg flex items-center px-3 gap-2 text-white">
                  <span className="text-xs">Halo David</span>
                  <span className="ml-auto text-lg">🔔</span>
                </div>
                <div className="space-y-3">
                  <div className="h-12 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg"></div>
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-10 bg-slate-100 rounded-lg"></div>
                    ))}
                  </div>
                  <div className="h-16 bg-accent/20 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Fitur Unggulan</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan dalam satu aplikasi yang mudah digunakan
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: QrCode,
                title: "PPOB Services",
                desc: "Bayar tagihan listrik, air, dan pulsa dengan mudah",
              },
              {
                icon: ShoppingBag,
                title: "Marketplace",
                desc: "Belanja produk unggulan dengan harga khusus member",
              },
              {
                icon: TrendingUp,
                title: "Live Shopping",
                desc: "Ikuti live shopping dengan penawaran eksklusif",
              },
              {
                icon: Smartphone,
                title: "Mobile Money",
                desc: "Transfer dan kirim uang tanpa biaya tambahan",
              },
              {
                icon: Users,
                title: "Komunitas",
                desc: "Terhubung dengan member lain dan kolaborasi bisnis",
              },
              {
                icon: Zap,
                title: "Dashboard Analytics",
                desc: "Pantau aktivitas dan performa penjualan Anda",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl hover:shadow-lg transition"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Keuntungan Member</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Rasakan manfaat eksklusif sebagai member koperasi
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 lg:gap-12">
            {[
              { number: "200+", label: "Poin Cashback", desc: "Setiap transaksi" },
              { number: "0%", label: "Biaya Admin", desc: "Untuk semua layanan" },
              { number: "24/7", label: "Customer Support", desc: "Siap membantu Anda" },
              { number: "50+", label: "Merchant Partner", desc: "Di seluruh negara" },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl font-bold text-primary mb-2">{benefit.number}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{benefit.label}</h3>
                <p className="text-slate-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="app" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Siap Bergabung?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Daftar sekarang dan nikmati berbagai keuntungan eksklusif sebagai member Koperasi 4.0
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-primary font-semibold rounded-full hover:bg-slate-100 transition"
            >
              Buka Aplikasi <ArrowRight size={18} />
            </Link>
            <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition">
              Hubungi Kami
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Koperasi 4.0</h4>
              <p className="text-sm">Platform digital ekosistem koperasi terlengkap</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Produk</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Member App
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Admin Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Karir
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Hubungi</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: info@koperasi4.id</li>
                <li>Phone: +62 800 XXX XXXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8">
            <p className="text-sm text-center">© 2026 Koperasi 4.0. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
