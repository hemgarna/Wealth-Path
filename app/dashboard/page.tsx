import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is an advisor
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role === "advisor") {
    redirect("/advisor/dashboard")
  }

  // Get the user's assessment
  const { data: assessment } = await supabase
    .from("client_assessments")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  // Get profile for display name
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", user.id)
    .single()

  return <DashboardClient assessment={assessment} userProfile={userProfile} />
}
