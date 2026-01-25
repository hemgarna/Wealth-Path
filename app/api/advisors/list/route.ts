import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Get all advisors
    const { data: advisors, error } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("role", "advisor")
      .order("full_name", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching advisors:", error)
      return NextResponse.json({ error: "Failed to fetch advisors" }, { status: 500 })
    }

    return NextResponse.json({ advisors: advisors || [] })
  } catch (error) {
    console.error("[v0] Error in advisors list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
