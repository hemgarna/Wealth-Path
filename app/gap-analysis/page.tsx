import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import GapAnalysisClient from "@/components/gap-analysis/gap-analysis-client"

export default async function GapAnalysisPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: assessment } = await supabase
    .from("client_assessments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return <GapAnalysisClient user={user} profile={profile} assessment={assessment} />
}
