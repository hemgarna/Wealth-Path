"use client"

import { useSearchParams } from "next/navigation"
import AcceptInvitationForm from "@/components/auth/accept-invitation-form"
import { Suspense } from "react"

function AcceptInvitationContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            No invitation token provided. Please use the link from your invitation email.
          </p>
          <a href="/auth/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <AcceptInvitationForm token={token} />
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading invitation...</p>
          </div>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  )
}
