"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Clock, User, FileText, Camera } from "lucide-react"

export default function KYCVerification() {
  const [pendingMembers, setPendingMembers] = useState([
    {
      id: 1,
      name: "Budi Santoso",
      joinDate: "2024-01-15",
      email: "budi.santoso@email.com",
      phone: "081234567890",
      ktpNumber: "3274015001234567",
      address: "Jl. Sudirman No. 45, Purwakarta",
      status: "pending",
      ktpPhoto: "📋",
      selfiePhoto: "📸",
      documents: ["KTP", "NPWP", "Surat Keterangan Usaha"],
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      joinDate: "2024-01-16",
      email: "siti.nur@email.com",
      phone: "082345678901",
      ktpNumber: "3274015002345678",
      address: "Jl. Gatot Subroto No. 12, Purwakarta",
      status: "pending",
      ktpPhoto: "📋",
      selfiePhoto: "📸",
      documents: ["KTP", "NPWP"],
    },
  ])

  const [verifiedMembers] = useState([
    {
      id: 3,
      name: "Tubagus Ahmad",
      joinDate: "2024-01-10",
      email: "tubagus.ahmad@email.com",
      phone: "081234567890",
      ktpNumber: "3274015003456789",
      address: "Bumi Jaya Indah, Purwakarta Jawa Barat 41118",
      status: "verified",
      verifiedDate: "2024-01-12",
      ktpPhoto: "📋",
    },
  ])

  const handleApprove = (memberId: number) => {
    const member = pendingMembers.find((m) => m.id === memberId)
    if (member) {
      setPendingMembers(pendingMembers.filter((m) => m.id !== memberId))
    }
  }

  const handleReject = (memberId: number) => {
    setPendingMembers(pendingMembers.filter((m) => m.id !== memberId))
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

        {pendingMembers.length === 0 ? (
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
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                      <p className="text-sm text-slate-600">
                        Mendaftar: {member.joinDate} • ID: {member.id}
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
                      <p className="text-slate-900">{member.phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-semibold">No. KTP</p>
                      <p className="text-slate-900">{member.ktpNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-semibold">Alamat</p>
                      <p className="text-slate-900">{member.address}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <p className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText size={18} />
                    Dokumen yang Diunggah
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {member.documents.map((doc, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Photo Preview */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <p className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Camera size={18} />
                    Foto Dokumen
                  </p>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-3xl mb-2">
                        {member.ktpPhoto}
                      </div>
                      <p className="text-xs text-slate-600">Foto KTP</p>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-3xl mb-2">
                        {member.selfiePhoto}
                      </div>
                      <p className="text-xs text-slate-600">Selfie</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(member.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 hover:bg-green-100 font-semibold rounded-lg transition active:scale-95"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(member.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 hover:bg-red-100 font-semibold rounded-lg transition active:scale-95"
                  >
                    <XCircle size={18} />
                    Reject
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
                  <h3 className="font-semibold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-slate-600">
                    {member.email} • {member.phone}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Terverifikasi: {member.verifiedDate}</p>
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
