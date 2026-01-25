import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const advisorId = searchParams.get("advisorId")

  if (!advisorId) {
    return NextResponse.json({ error: "advisorId is required" }, { status: 400 })
  }

  // Use service role to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[v0] Missing Supabase service role configuration")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Get all clients for this advisor
    const { data: clients, error: clientsError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("advisor_id", advisorId)
      .eq("role", "client")

    if (clientsError) {
      console.error("[v0] Error fetching clients:", clientsError)
      return NextResponse.json({ error: clientsError.message }, { status: 500 })
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({ progress: {} })
    }

    const clientIds = clients.map((c) => c.id)

    // Fetch all form completion statuses using service role (bypasses RLS)
    const [savingsResult, goalsResult, defenseResult, growthResult, finalReportResult] = await Promise.all([
      supabase.from("savings_vs_spending").select("user_id, completed").in("user_id", clientIds),
      supabase.from("financial_goals").select("user_id, completed").in("user_id", clientIds),
      supabase.from("defense_strategy").select("user_id, completed").in("user_id", clientIds),
      supabase.from("growth_strategy").select("user_id, completed").in("user_id", clientIds),
      supabase.from("final_report").select("user_id").in("user_id", clientIds),
    ])

    const savingsData = savingsResult.data || []
    const goalsData = goalsResult.data || []
    const defenseData = defenseResult.data || []
    const growthData = growthResult.data || []
    const finalReportData = finalReportResult.data || []

    // Build progress map
    const progressMap: Record<string, { stepsCompleted: number; totalSteps: number }> = {}

    for (const client of clients) {
      const savingsCompleted = savingsData.find((s) => s.user_id === client.id)?.completed === true
      const goalsCompleted = goalsData.find((g) => g.user_id === client.id)?.completed === true
      const defenseCompleted = defenseData.find((d) => d.user_id === client.id)?.completed === true
      const growthCompleted = growthData.find((g) => g.user_id === client.id)?.completed === true
      const finalReportCompleted = finalReportData.some((f) => f.user_id === client.id)

      const stepsCompleted = [
        savingsCompleted,
        goalsCompleted,
        defenseCompleted,
        growthCompleted,
        finalReportCompleted,
      ].filter(Boolean).length

      console.log(
        `[v0] API Progress for ${client.full_name}: savings=${savingsCompleted}, goals=${goalsCompleted}, defense=${defenseCompleted}, growth=${growthCompleted}, final=${finalReportCompleted} => ${stepsCompleted}/5`,
      )

      progressMap[client.id] = {
        stepsCompleted,
        totalSteps: 5,
      }
    }

    return NextResponse.json({ progress: progressMap })
  } catch (error) {
    console.error("[v0] Error in client-progress API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
