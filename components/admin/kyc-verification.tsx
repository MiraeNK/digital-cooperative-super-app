"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Clock, User, Loader2 } from "lucide-react"
import { subscribeKYCRequests, updateKYCStatus } from "@/lib/firebase"

export default function KYCVerification() {
  const [pendingMembers, setPendingMembers] = useState<any[]>([])
  const [verifiedMembers, setVerifiedMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    setIsLoading(true)
    const unsubscribe = subscribeKYCRequests((rows) => {
      const stillPending = rows.filter((m: any) => m.verificationStatus === "pending")
      const verified = rows.filter((m: any) => m.verificationStatus === "verified")
      setPendingMembers(stillPending)
      setVerifiedMembers(verified)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleApprove = async (memberId: string) => {
    setActioningId(memberId)
    try {
      await updateKYCStatus(memberId, "verified", "")
    } catch (error) {
      console.error("Error approving KYC:", error)
      alert("Gagal menyetujui KYC. Silakan coba lagi.")
    } finally {
      setActioningId(null)
    }
  }

  const handleReject = async (memberId: string) => {
    setActioningId(memberId)
    const notes = adminNotes[memberId] || ""
    try {
      await updateKYCStatus(memberId, "rejected", notes)
    } catch (error) {
      console.error("Error rejecting KYC:", error)
      alert("Gagal menolak KYC. Silakan coba lagi.")
    } finally {
      setActioningId(null)
      setAdminNotes({ ...adminNotes, [memberId]: "" })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">KYC Verification</h1>
        <p className="text-slate-600">Kelola verifikasi data anggota baru</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold">Pending Review</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{pendingMembers.length}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold">Verified</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{verifiedMembers.length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold">Total Anggota</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{pendingMembers.length + verifiedMembers.length}</p>
            </div>
            <User className="w-10 h-10 text-primary" />
          </div>
        </div>
      </div>

      {/* Pending Verifications */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Menunggu Verifikasi</h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pendingMembers.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Semua anggota sudah terverifikasi!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingMembers.map((member) => (
              <div key={member.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition">
                {/* Member Info */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{member.displayName || "Anggota"}</h3>
                      <p className="text-sm text-slate-600">
                        Mendaftar: {member.createdAt?.toLocaleDateString("id-ID")} • ID: {member.id}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 font-semibold rounded-full text-xs">
                      Pending
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 font-semibold">Email</p>
                      <p className="text-slate-900">{member.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-semibold">No. HP</p>
                      <p className="text-slate-900">{member.phoneNumber || "Belum diisi"}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-semibold">No. KTP</p>
                      <p className="text-slate-900">
                        {member.nik ? `${String(member.nik).slice(0, 4)}********${String(member.nik).slice(-4)}` : "Belum diisi"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-semibold">Alamat</p>
                      <p className="text-slate-900">{member.address || "Belum diisi"}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Notes for Rejection */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Catatan Admin (untuk penolakan)
                  </label>
                  <textarea
                    value={adminNotes[member.id] || ""}
                    onChange={(e) => setAdminNotes({ ...adminNotes, [member.id]: e.target.value })}
                    placeholder="Contoh: KTP tidak jelas / Data tidak lengkap"
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(member.id)}
                    disabled={actioningId === member.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 hover:bg-green-100 font-semibold rounded-lg transition active:scale-95 disabled:opacity-50"
                  >
                    {actioningId === member.id ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle size={18} />}
                    {actioningId === member.id ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(member.id)}
                    disabled={actioningId === member.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 hover:bg-red-100 font-semibold rounded-lg transition active:scale-95 disabled:opacity-50"
                  >
                    {actioningId === member.id ? <Loader2 className="animate-spin w-4 h-4" /> : <XCircle size={18} />}
                    {actioningId === member.id ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Members List */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Anggota Terverifikasi</h2>

        <div className="space-y-4">
          {verifiedMembers.map((member) => (
            <div key={member.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{member.displayName || "Anggota"}</h3>
                  <p className="text-sm text-slate-600">
                    {member.email} • {member.phoneNumber || "Tidak ada nomor"}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Terverifikasi: {member.verificationDate?.toLocaleDateString("id-ID")}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 font-semibold">
                    Member ID: {member.memberId || "Generating..."}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 font-semibold rounded-full text-xs flex items-center gap-1">
                  <CheckCircle size={14} />
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
