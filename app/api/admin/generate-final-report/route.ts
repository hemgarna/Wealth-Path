import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { caseId, advisorId } = await request.json()

    console.log("[v0] Generating final report for case:", caseId)

    // Fetch all advisor-analyzed forms
    const [financialGoalsRes, growthStrategyRes, defenseStrategyRes, savingsVsSpendingRes] = await Promise.all([
      supabase.from("advisor_financial_goals").select("*").eq("user_id", caseId).eq("advisor_id", advisorId).single(),
      supabase.from("advisor_growth_strategy").select("*").eq("user_id", caseId).eq("advisor_id", advisorId).single(),
      supabase.from("advisor_defense_strategy").select("*").eq("user_id", caseId).eq("advisor_id", advisorId).single(),
      supabase
        .from("advisor_savings_vs_spending")
        .select("*")
        .eq("user_id", caseId)
        .eq("advisor_id", advisorId)
        .single(),
    ])

    // Calculate final report data based on advisor's analyzed forms
    const financialGoals = financialGoalsRes.data
    const growthStrategy = growthStrategyRes.data

    const finalReportData = {
      user_id: caseId,
      advisor_id: advisorId,
      current_age: financialGoals?.current_age || 0,
      retirement_age: financialGoals?.retirement_age || 0,
      years_to_retirement: financialGoals?.years_to_retirement || 0,
      total_retirement_now: growthStrategy?.current_401k_balance_self || 0,
      total_retirement_at_67: 0, // This would need to be calculated based on projections
      advisor_notes: "Final report generated from advisor analysis",
      advisor_recommendations: null, // Can be populated with specific recommendations
      original_report_id: null, // Link to original client report if needed
    }

    // Insert or update advisor final report
    const { error } = await supabase.from("advisor_final_report").upsert(finalReportData, {
      onConflict: "user_id,advisor_id",
    })

    if (error) {
      console.error("[v0] Error generating final report:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Final report generated successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in generate-final-report:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
