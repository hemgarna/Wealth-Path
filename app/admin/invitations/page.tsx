import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { InvitationsManager } from "@/components/admin/invitations-manager"

export default async function InvitationsPage() {
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <InvitationsManager />
      </div>
    </div>
  )
}
