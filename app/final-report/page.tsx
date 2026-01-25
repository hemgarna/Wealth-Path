import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import FinalReportClient from "@/components/final-report/final-report-client"

export default async function FinalReportPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; returnUrl?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (!user || error) {
    redirect("/auth/login")
  }

  const targetUserId = params.clientId || user.id
  const isAdvisorView = !!params.clientId

  let queryClient = supabase

  if (isAdvisorView) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceRoleKey) {
      queryClient = createServiceClient(supabaseUrl, serviceRoleKey)
      console.log("[v0] Final Report - Using service role client for advisor/CEO view")
    } else {
      console.log("[v0] Final Report - Service role key not available, using regular client")
    }
  }

  const { data: financialGoals } = await queryClient
    .from("financial_goals")
    .select("*")
    .eq("user_id", targetUserId)
    .maybeSingle()

  const { data: growthStrategy } = await queryClient
    .from("growth_strategy")
    .select("*")
    .eq("user_id", targetUserId)
    .maybeSingle()

  const { data: defenseStrategy } = await queryClient
    .from("defense_strategy")
    .select("*")
    .eq("user_id", targetUserId)
    .maybeSingle()

  const { data: savingsVsSpending } = await queryClient
    .from("savings_vs_spending")
    .select("*")
    .eq("user_id", targetUserId)
    .maybeSingle()

  console.log("[v0] Final Report - Section completion status:", {
    financialGoals: financialGoals?.completed,
    growthStrategy: growthStrategy?.completed,
    defenseStrategy: defenseStrategy?.completed,
    savingsVsSpending: savingsVsSpending?.completed,
  })

  console.log("[v0] FINAL REPORT - Retrieved Data from Database:", {
    userId: targetUserId,
    isAdvisorView,
    financialGoalsData: {
      topPriorities: financialGoals?.top_priorities,
      currentAge: financialGoals?.current_age,
      retirementAge: financialGoals?.retirement_age,
      childrenCount: financialGoals?.children?.length || 0,
      hasLTCInsurance: financialGoals?.has_ltc_insurance,
    },
    growthStrategyData: {
      current401kBalanceSelf: growthStrategy?.current_401k_balance_self,
      traditionalIRABalanceSelf: growthStrategy?.traditional_ira_balance_self,
      rothBalanceSelf: growthStrategy?.roth_balance_self,
      hsaBalanceSelf: growthStrategy?.hsa_balance_self,
      brokerageStocks: growthStrategy?.brokerage_stocks,
      primaryHomeValue: growthStrategy?.primary_home_value,
      primaryHomeEquity: growthStrategy?.primary_home_equity,
      hasKidsEducationSavings: growthStrategy?.has_kids_education_savings,
      kidsEducationSavingsAmount: growthStrategy?.kids_education_savings_amount,
    },
    defenseStrategyData: {
      hasWorkLifeSelf: defenseStrategy?.has_work_life_self,
      workLifeCoverageSelf: defenseStrategy?.work_life_coverage_self,
      lifeInsurancePolicies: defenseStrategy?.children_life_insurance,
      hasUmbrella: defenseStrategy?.has_umbrella,
      hasMortgageProtection: defenseStrategy?.has_mortgage_protection,
      hasForeignAssets: defenseStrategy?.has_foreign_assets,
    },
    savingsVsSpendingData: {
      annualGrossIncome: savingsVsSpending?.annual_gross_income,
      netMonthlyIncome: savingsVsSpending?.net_monthly_income,
      totalHousing: savingsVsSpending?.total_housing,
      totalRetirementSavings: savingsVsSpending?.total_retirement_savings,
      totalLifestyle: savingsVsSpending?.total_lifestyle,
      totalShortTerm: savingsVsSpending?.total_short_term,
      loans: savingsVsSpending?.loans,
    },
  })

  if (
    !isAdvisorView &&
    (!financialGoals ||
      !growthStrategy ||
      !defenseStrategy ||
      !savingsVsSpending ||
      !financialGoals.completed ||
      !growthStrategy.completed ||
      !defenseStrategy.completed ||
      !savingsVsSpending.completed)
  ) {
    console.log("[v0] Final Report - Not all sections completed, redirecting to home")
    redirect("/home")
  }

  // Use service role client for profile queries when in advisor view
  const { data: profile } = await queryClient.from("profiles").select("*").eq("id", targetUserId).maybeSingle()

  let advisorProfile = null
  if (profile?.advisor_id) {
    const { data: advisor } = await queryClient
      .from("profiles")
      .select("full_name, email, phone, zoom_link")
      .eq("id", profile.advisor_id)
      .maybeSingle()
    advisorProfile = advisor
  }

  return (
    <FinalReportClient
      financialGoals={financialGoals}
      growthStrategy={growthStrategy}
      defenseStrategy={defenseStrategy}
      savingsVsSpending={savingsVsSpending}
      profile={profile}
      clientId={params.clientId}
      advisorProfile={advisorProfile}
      returnUrl={params.returnUrl}
    />
  )
}
