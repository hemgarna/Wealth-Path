import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { clientIds } = await request.json()

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json({ error: "Client IDs required" }, { status: 400 })
    }

    // Use service role to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[v0] Missing Supabase configuration for service role")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    console.log("[v0] CEO Progress API - Fetching progress for", clientIds.length, "clients")

    // Fetch all form completion data using service role (bypasses RLS)
    const [savingsResult, goalsResult, defenseResult, growthResult, finalReportResult] = await Promise.all([
      supabaseAdmin.from("savings_vs_spending").select("user_id, completed").in("user_id", clientIds),
      supabaseAdmin.from("financial_goals").select("user_id, completed").in("user_id", clientIds),
      supabaseAdmin.from("defense_strategy").select("user_id, completed").in("user_id", clientIds),
      supabaseAdmin.from("growth_strategy").select("user_id, completed").in("user_id", clientIds),
      supabaseAdmin.from("final_report").select("user_id, completed").in("user_id", clientIds),
    ])

    // Build progress map for each client
    const progressMap: Record<string, { stepsCompleted: number; totalSteps: number }> = {}

    for (const clientId of clientIds) {
      const savingsCompleted = savingsResult.data?.find((s) => s.user_id === clientId)?.completed || false
      const goalsCompleted = goalsResult.data?.find((g) => g.user_id === clientId)?.completed || false
      const defenseCompleted = defenseResult.data?.find((d) => d.user_id === clientId)?.completed || false
      const growthCompleted = growthResult.data?.find((g) => g.user_id === clientId)?.completed || false
      const finalReportCompleted = finalReportResult.data?.find((f) => f.user_id === clientId)?.completed || false

      const stepsCompleted = [
        savingsCompleted,
        goalsCompleted,
        defenseCompleted,
        growthCompleted,
        finalReportCompleted,
      ].filter(Boolean).length

      console.log(
        `[v0] CEO Progress API - Client ${clientId}: savings=${savingsCompleted}, goals=${goalsCompleted}, defense=${defenseCompleted}, growth=${growthCompleted}, final=${finalReportCompleted} = ${stepsCompleted}/5`,
      )

      progressMap[clientId] = {
        stepsCompleted,
        totalSteps: 5,
      }
    }

    return NextResponse.json({ progress: progressMap })
  } catch (error) {
    console.error("[v0] CEO Progress API Error:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
