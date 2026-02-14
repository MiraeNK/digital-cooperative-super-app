import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider" // Import Provider
import { Toaster } from "@/components/ui/toaster" // Import Toaster

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Koperasi 4.0 Super App",
  description: "Platform koperasi digital masa depan",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster /> 
        </AuthProvider>
      </body>
    </html>
  )
}