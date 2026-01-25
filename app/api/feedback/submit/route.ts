import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile for role and name
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { suggestion_type, subject, message } = body

    if (!suggestion_type || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Insert suggestion using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("website_suggestions")
      .insert({
        user_id: user.id,
        user_email: profile.email,
        user_name: profile.full_name,
        user_role: profile.role,
        suggestion_type,
        subject: subject || "No subject",
        message,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error inserting suggestion:", error)
      return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
    }

    console.log("[v0] Feedback submitted successfully:", data.id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error in feedback submission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
