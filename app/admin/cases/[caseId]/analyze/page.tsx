import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdvisorAnalysisClient } from "@/components/admin/advisor-analysis-client"

export default async function AnalyzePage({ params }: { params: { caseId: string } }) {
  const { caseId } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch client's original forms
  const [financialGoals, growthStrategy, defenseStrategy, savingsVsSpending, finalReport, clientProfile] =
    await Promise.all([
      supabase.from("financial_goals").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("growth_strategy").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("defense_strategy").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("savings_vs_spending").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("final_report").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("profiles").select("*").eq("id", caseId).single(),
    ])

  // Fetch advisor's analyzed versions (if they exist)
  const [
    advisorFinancialGoals,
    advisorGrowthStrategy,
    advisorDefenseStrategy,
    advisorSavingsVsSpending,
    advisorFinalReport,
  ] = await Promise.all([
    supabase.from("advisor_financial_goals").select("*").eq("user_id", caseId).eq("advisor_id", user.id).maybeSingle(),
    supabase.from("advisor_growth_strategy").select("*").eq("user_id", caseId).eq("advisor_id", user.id).maybeSingle(),
    supabase.from("advisor_defense_strategy").select("*").eq("user_id", caseId).eq("advisor_id", user.id).maybeSingle(),
    supabase
      .from("advisor_savings_vs_spending")
      .select("*")
      .eq("user_id", caseId)
      .eq("advisor_id", user.id)
      .maybeSingle(),
    supabase.from("advisor_final_report").select("*").eq("user_id", caseId).eq("advisor_id", user.id).maybeSingle(),
  ])

  return (
    <AdvisorAnalysisClient
      caseId={caseId}
      advisorId={user.id}
      clientName={clientProfile.data?.full_name || "Client"}
      originalForms={{
        financialGoals: financialGoals.data,
        growthStrategy: growthStrategy.data,
        defenseStrategy: defenseStrategy.data,
        savingsVsSpending: savingsVsSpending.data,
        finalReport: finalReport.data,
      }}
      analyzedForms={{
        financialGoals: advisorFinancialGoals.data,
        growthStrategy: advisorGrowthStrategy.data,
        defenseStrategy: advisorDefenseStrategy.data,
        savingsVsSpending: advisorSavingsVsSpending.data,
        finalReport: advisorFinalReport.data,
      }}
    />
  )
}
