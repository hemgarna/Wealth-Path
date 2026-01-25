import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DefenseStrategyResults from "@/components/defense-strategy/defense-strategy-results"

export default async function DefenseStrategyResultsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (!user || authError) {
    redirect("/auth/login")
  }

  const { data: strategyData, error: dataError } = await supabase
    .from("defense_strategy")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!strategyData || dataError) {
    redirect("/defense-strategy/form")
  }

  return <DefenseStrategyResults data={strategyData} />
}
