import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, data } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Use service role to bypass RLS - this allows advisors/CEOs to save on behalf of clients
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const dataToSave = {
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString(),
    }

    console.log("[v0] API - Saving savings_vs_spending for user:", userId)

    const { error } = await supabaseAdmin
      .from("savings_vs_spending")
      .upsert(dataToSave, { onConflict: "user_id" })

    if (error) {
      console.error("[v0] API - Error saving savings_vs_spending:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] API - Successfully saved savings_vs_spending for user:", userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] API - Exception in save-savings-vs-spending:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
