import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import GrowthStrategyResults from "@/components/growth-strategy/growth-strategy-results"

export default async function GrowthStrategyResultsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (!user || authError) {
    redirect("/auth/login")
  }

  const { data: strategyData, error: dataError } = await supabase
    .from("growth_strategy")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!strategyData || dataError) {
    redirect("/growth-strategy/form")
  }

  return <GrowthStrategyResults data={strategyData} />
}
