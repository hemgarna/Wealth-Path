import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// GET - Check if self-registration is enabled (public)
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data, error } = await supabase
      .from("app_settings")
      .select("allow_client_self_registration")
      .eq("id", "global")
      .single()

    if (error) {
      console.error("[v0] Error fetching self-registration setting:", error)
      // Default to disabled if setting doesn't exist
      return NextResponse.json({ enabled: false })
    }

    return NextResponse.json({ enabled: data.allow_client_self_registration === true })
  } catch (error) {
    console.error("[v0] Error checking self-registration:", error)
    return NextResponse.json({ enabled: false })
  }
}

// POST - Toggle self-registration (CEO only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Get auth header to verify CEO
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is CEO
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "ceo") {
      return NextResponse.json({ error: "Only CEO can change this setting" }, { status: 403 })
    }

    const { enabled } = await request.json()

    const { error } = await supabase
      .from("app_settings")
      .upsert({
        id: "global",
        allow_client_self_registration: enabled,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }, { onConflict: "id" })

    if (error) {
      console.error("[v0] Error updating self-registration setting:", error)
      return NextResponse.json({ error: "Failed to update setting" }, { status: 500 })
    }

    return NextResponse.json({ success: true, enabled })
  } catch (error) {
    console.error("[v0] Error toggling self-registration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
