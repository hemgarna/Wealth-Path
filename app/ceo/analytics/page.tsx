import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ConversionFunnelClient } from "@/components/ceo/conversion-funnel-client"

export default async function AnalyticsPage() {
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

  return <ConversionFunnelClient ceoId={user.id} viewType="ceo" />
}
