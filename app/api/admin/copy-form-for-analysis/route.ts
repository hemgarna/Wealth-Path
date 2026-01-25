import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { userId, formType, advisorId } = await request.json()

    console.log("[v0] Copying form:", { userId, formType, advisorId })

    // Verify advisor is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to verify they're an advisor
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "advisor" && profile?.role !== "ceo") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Map form type to source and destination tables
    const tableMap: Record<string, { source: string; destination: string }> = {
      financial_goals: {
        source: "financial_goals",
        destination: "advisor_financial_goals",
      },
      growth_strategy: {
        source: "growth_strategy",
        destination: "advisor_growth_strategy",
      },
      defense_strategy: {
        source: "defense_strategy",
        destination: "advisor_defense_strategy",
      },
      savings_vs_spending: {
        source: "savings_vs_spending",
        destination: "advisor_savings_vs_spending",
      },
    }

    const tables = tableMap[formType]
    if (!tables) {
      return NextResponse.json({ error: "Invalid form type" }, { status: 400 })
    }

    // Get the source data
    const { data: sourceData, error: fetchError } = await supabase
      .from(tables.source)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (fetchError) {
      console.error("[v0] Error fetching source data:", fetchError)
      return NextResponse.json({ error: "Failed to fetch form data" }, { status: 500 })
    }

    if (!sourceData) {
      return NextResponse.json({ error: "Form not found or not yet filled by client" }, { status: 404 })
    }

    // Check if copy already exists
    const { data: existingCopy } = await supabase
      .from(tables.destination)
      .select("id")
      .eq("user_id", userId)
      .eq("advisor_id", advisorId)
      .maybeSingle()

    if (existingCopy) {
      return NextResponse.json({ error: "Copy already exists in Advisor Analysis & Edits" }, { status: 400 })
    }

    const { id, created_at, updated_at, ...formData } = sourceData

    const insertData = {
      ...formData,
      advisor_id: advisorId,
      original_form_id: sourceData.id,
    }

    console.log("[v0] Inserting data with all columns:", Object.keys(insertData))

    // Insert into advisor table
    const { error: insertError } = await supabase.from(tables.destination).insert(insertData)

    if (insertError) {
      console.error("[v0] Error inserting copy:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log("[v0] Form copied successfully with all columns")
    return NextResponse.json({ success: true, message: "Form copied successfully" })
  } catch (error) {
    console.error("[v0] Error in copy-form-for-analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
