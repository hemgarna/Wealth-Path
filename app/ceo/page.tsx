import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { CeoDashboardClient } from "@/components/ceo/ceo-dashboard-client"

export default async function CeoPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is CEO
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "ceo") {
    redirect("/home")
  }

  return <CeoDashboardClient ceoId={user.id} />
}
