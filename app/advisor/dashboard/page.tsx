import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdvisorDashboardClient } from "@/components/advisor/advisor-dashboard-client"

export default async function AdvisorDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify user is an advisor
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "advisor") {
    redirect("/dashboard")
  }

  // Get all client assessments with profile information and form completion status
  const { data: assessments } = await supabase
    .from("client_assessments")
    .select(
      `
      *,
      profiles:user_id (
        id,
        full_name,
        email
      )
    `,
    )
    .order("updated_at", { ascending: false })

  // Calculate accurate progress for each assessment
  const assessmentsWithProgress = await Promise.all(
    (assessments || []).map(async (assessment) => {
      const userId = assessment.user_id

      // Check which forms are completed
      const [
        financialGoalsResult,
        growthStrategyResult,
        defenseStrategyResult,
        savingsVsSpendingResult,
        finalReportResult,
      ] = await Promise.all([
        supabase.from("financial_goals").select("id").eq("user_id", userId).maybeSingle(),
        supabase.from("growth_strategy").select("id").eq("user_id", userId).maybeSingle(),
        supabase.from("defense_strategy").select("id").eq("user_id", userId).maybeSingle(),
        supabase.from("savings_vs_spending").select("id").eq("user_id", userId).maybeSingle(),
        supabase.from("final_report").select("id").eq("user_id", userId).maybeSingle(),
      ])

      const completedForms = [
        financialGoalsResult.data,
        growthStrategyResult.data,
        defenseStrategyResult.data,
        savingsVsSpendingResult.data,
        finalReportResult.data,
      ].filter(Boolean).length

      const progress_percentage = Math.floor((completedForms / 5) * 100)

      // Update status based on completion
      let status = assessment.status
      if (completedForms === 5 && status === "draft") {
        status = "submitted"
      }

      return {
        ...assessment,
        progress_percentage,
        status,
      }
    }),
  )

  return <AdvisorDashboardClient assessments={assessmentsWithProgress || []} advisorId={user.id} />
}
