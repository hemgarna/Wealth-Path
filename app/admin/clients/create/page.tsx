import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import CreateClientForm from "@/components/admin/create-client-form"

export default async function CreateClientPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "advisor") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Client</h1>
          <p className="text-gray-600 mt-2">Send an invitation to a new client to start their financial assessment</p>
        </div>
        <CreateClientForm />
      </div>
    </div>
  )
}
