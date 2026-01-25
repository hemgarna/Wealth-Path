import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import FinancialGoalsResults from "@/components/financial-goals/financial-goals-results"

export default async function FinancialGoalsResultsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (!user || authError) {
    redirect("/auth/login")
  }

  const { data: goalData, error: dataError } = await supabase
    .from("financial_goals")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!goalData || dataError) {
    redirect("/financial-goals/form")
  }

  return <FinancialGoalsResults data={goalData} />
}
