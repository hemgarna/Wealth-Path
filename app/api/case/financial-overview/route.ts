import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const caseId = searchParams.get("caseId")

  console.log("[v0] Financial Overview API called with caseId:", caseId)

  if (!caseId) {
    return NextResponse.json({ error: "Missing caseId" }, { status: 400 })
  }

  // Use service role key to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log("[v0] Supabase config:", { hasUrl: !!supabaseUrl, hasKey: !!supabaseServiceKey })

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log("[v0] Missing Supabase configuration")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Fetch all client form data in parallel
    const [
      financialGoalsResult,
      growthStrategyResult,
      defenseStrategyResult,
      savingsVsSpendingResult,
      finalReportResult,
      assessmentResult,
      profileResult,
    ] = await Promise.all([
      supabase.from("financial_goals").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("growth_strategy").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("defense_strategy").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("savings_vs_spending").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("final_report").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("client_assessments").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("profiles").select("*").eq("id", caseId).single(),
    ])

    const financialGoals = financialGoalsResult.data
    const growthStrategy = growthStrategyResult.data
    const defenseStrategy = defenseStrategyResult.data
    const savingsVsSpending = savingsVsSpendingResult.data
    const finalReport = finalReportResult.data
    const assessment = assessmentResult.data
    const profile = profileResult.data

    console.log("[v0] API Financial Overview - Data loaded:")
    console.log("[v0]   Financial Goals:", !!financialGoals)
    console.log("[v0]   Growth Strategy:", !!growthStrategy)
    console.log("[v0]   Defense Strategy:", !!defenseStrategy)
    console.log("[v0]   Savings vs Spending:", !!savingsVsSpending)
    console.log("[v0]   Final Report:", !!finalReport)

    if (growthStrategy) {
      console.log("[v0] Growth Strategy savings fields:")
      console.log("[v0]   current_401k_balance_self:", growthStrategy.current_401k_balance_self)
      console.log("[v0]   current_401k_balance_spouse:", growthStrategy.current_401k_balance_spouse)
      console.log("[v0]   traditional_ira_balance_self:", growthStrategy.traditional_ira_balance_self)
      console.log("[v0]   roth_balance_self:", growthStrategy.roth_balance_self)
      console.log("[v0]   hsa_balance_self:", growthStrategy.hsa_balance_self)
      console.log("[v0]   emergency_fund:", growthStrategy.emergency_fund)
      console.log("[v0]   checking_account:", growthStrategy.checking_account)
      console.log("[v0]   savings_account:", growthStrategy.savings_account)
      console.log("[v0]   brokerage_stocks:", growthStrategy.brokerage_stocks)
    }

    // Calculate Annual Income with fallbacks
    const annualIncome =
      savingsVsSpending?.annual_gross_income ||
      (finalReport?.gross_monthly_income ? finalReport.gross_monthly_income * 12 : 0) ||
      finalReport?.total_income_before_tax ||
      assessment?.annual_income ||
      financialGoals?.annual_retirement_income_today ||
      0

    const savings401kSelf = Number(growthStrategy?.current_401k_balance_self) || 0
    const savings401kSpouse = Number(growthStrategy?.current_401k_balance_spouse) || 0
    const iraBalanceSelf = Number(growthStrategy?.traditional_ira_balance_self) || 0
    const iraBalanceSpouse = Number(growthStrategy?.traditional_ira_balance_spouse) || 0
    const rothSelf = Number(growthStrategy?.roth_balance_self) || 0
    const rothSpouse = Number(growthStrategy?.roth_balance_spouse) || 0
    const rollover401kSelf = Number(growthStrategy?.rollover_401k_balance_self) || 0
    const rollover401kSpouse = Number(growthStrategy?.rollover_401k_balance_spouse) || 0
    const hsaSelf = Number(growthStrategy?.hsa_balance_self) || 0
    const hsaSpouse = Number(growthStrategy?.hsa_balance_spouse) || 0
    const emergencyFund = Number(growthStrategy?.emergency_fund) || 0
    const checkingAccount = Number(growthStrategy?.checking_account) || 0
    const savingsAccount = Number(growthStrategy?.savings_account) || 0
    const moneyMarket = Number(growthStrategy?.money_market) || 0
    const otherCash = Number(growthStrategy?.other_cash) || 0
    const cdValue = Number(growthStrategy?.cd_total_value) || 0
    const brokerageStocks = Number(growthStrategy?.brokerage_stocks) || 0
    const brokerageMutualFunds = Number(growthStrategy?.brokerage_mutual_funds) || 0
    const brokerageBonds = Number(growthStrategy?.brokerage_bonds) || 0
    const brokerageEtfs = Number(growthStrategy?.brokerage_etfs) || 0
    const assessmentSavings = Number(assessment?.current_savings) || Number(assessment?.cash_savings) || 0

    const currentSavings =
      savings401kSelf +
      savings401kSpouse +
      iraBalanceSelf +
      iraBalanceSpouse +
      rothSelf +
      rothSpouse +
      rollover401kSelf +
      rollover401kSpouse +
      hsaSelf +
      hsaSpouse +
      emergencyFund +
      checkingAccount +
      savingsAccount +
      moneyMarket +
      otherCash +
      cdValue +
      brokerageStocks +
      brokerageMutualFunds +
      brokerageBonds +
      brokerageEtfs +
      assessmentSavings

    console.log("[v0] Current Savings breakdown:")
    console.log("[v0]   401k (self+spouse):", savings401kSelf + savings401kSpouse)
    console.log("[v0]   IRA (self+spouse):", iraBalanceSelf + iraBalanceSpouse)
    console.log("[v0]   Roth (self+spouse):", rothSelf + rothSpouse)
    console.log("[v0]   HSA (self+spouse):", hsaSelf + hsaSpouse)
    console.log("[v0]   Emergency Fund:", emergencyFund)
    console.log("[v0]   Checking:", checkingAccount)
    console.log("[v0]   Savings:", savingsAccount)
    console.log("[v0]   Brokerage:", brokerageStocks + brokerageMutualFunds + brokerageBonds + brokerageEtfs)
    console.log("[v0]   Total Current Savings:", currentSavings)

    // Calculate Monthly Expenses with fallbacks
    const monthlyExpenses =
      savingsVsSpending?.total_monthly_expenses ||
      savingsVsSpending?.total_short_term ||
      (savingsVsSpending?.total_housing || 0) + (savingsVsSpending?.total_lifestyle || 0) ||
      finalReport?.total_monthly_expenses ||
      financialGoals?.total_monthly_expenses ||
      assessment?.monthly_expenses ||
      0

    // Calculate Insurance Coverage - aggregate all life insurance
    const insuranceCoverage =
      (defenseStrategy?.work_life_coverage_self || 0) +
        (defenseStrategy?.work_life_coverage_spouse || 0) +
        (defenseStrategy?.personal_life_coverage_self || 0) +
        (defenseStrategy?.personal_life_coverage_spouse || 0) ||
      finalReport?.life_insurance_total ||
      assessment?.current_life_insurance ||
      0

    // Get retirement age and dependents
    const retirementAge = financialGoals?.retirement_age || assessment?.retirement_age || 65
    const dependents = financialGoals?.number_of_children || assessment?.dependents || profile?.dependents || 0

    console.log("[v0] API Financial Overview - Calculated values:")
    console.log("[v0]   Annual Income:", annualIncome)
    console.log("[v0]   Current Savings:", currentSavings)
    console.log("[v0]   Monthly Expenses:", monthlyExpenses)
    console.log("[v0]   Insurance Coverage:", insuranceCoverage)

    return NextResponse.json({
      annualIncome,
      currentSavings,
      monthlyExpenses,
      insuranceCoverage,
      retirementAge,
      dependents,
      // Also return raw data for debugging
      dataSources: {
        financialGoals: !!financialGoals,
        growthStrategy: !!growthStrategy,
        defenseStrategy: !!defenseStrategy,
        savingsVsSpending: !!savingsVsSpending,
        finalReport: !!finalReport,
        assessment: !!assessment,
      },
    })
  } catch (error) {
    console.error("[v0] API Financial Overview error:", error)
    return NextResponse.json({ error: "Failed to fetch financial overview" }, { status: 500 })
  }
}
