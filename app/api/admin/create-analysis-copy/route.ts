import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { caseId, advisorId, originalForms } = await request.json()

    console.log("[v0] Creating analysis copy for case:", caseId, "advisor:", advisorId)

    // Create copies in advisor-specific tables
    const promises = []

    if (originalForms.financialGoals) {
      promises.push(
        supabase.from("advisor_financial_goals").upsert({
          user_id: caseId,
          advisor_id: advisorId,
          ...originalForms.financialGoals,
          id: undefined, // Remove original ID
          created_at: undefined,
          updated_at: undefined,
        }),
      )
    }

    if (originalForms.growthStrategy) {
      promises.push(
        supabase.from("advisor_growth_strategy").upsert({
          user_id: caseId,
          advisor_id: advisorId,
          ...originalForms.growthStrategy,
          id: undefined,
          created_at: undefined,
          updated_at: undefined,
        }),
      )
    }

    if (originalForms.defenseStrategy) {
      promises.push(
        supabase.from("advisor_defense_strategy").upsert({
          user_id: caseId,
          advisor_id: advisorId,
          ...originalForms.defenseStrategy,
          id: undefined,
          created_at: undefined,
          updated_at: undefined,
        }),
      )
    }

    if (originalForms.savingsVsSpending) {
      promises.push(
        supabase.from("advisor_savings_vs_spending").upsert({
          user_id: caseId,
          advisor_id: advisorId,
          ...originalForms.savingsVsSpending,
          id: undefined,
          created_at: undefined,
          updated_at: undefined,
        }),
      )
    }

    await Promise.all(promises)

    console.log("[v0] Analysis copy created successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error creating analysis copy:", error)
    return NextResponse.json({ error: "Failed to create copy" }, { status: 500 })
  }
}
