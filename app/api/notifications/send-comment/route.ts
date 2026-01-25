import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { caseId, advisorId, commentId, commentText } = await request.json()

    console.log("[v0] Send comment notification API called:", { caseId, advisorId, commentId })

    if (!caseId || !advisorId || !commentId || !commentText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[v0] Missing Supabase environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get the client profile (the case ID is the client's user ID)
    const { data: clientProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", caseId)
      .single()

    if (profileError || !clientProfile) {
      console.error("[v0] Error fetching client profile:", profileError)
      return NextResponse.json({ error: "Failed to find client profile" }, { status: 404 })
    }

    console.log("[v0] Found client profile:", clientProfile.full_name, clientProfile.email)

    // Create notification using service role (bypasses RLS)
    const { data: notification, error: notifError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: clientProfile.id,
        advisor_id: advisorId,
        comment_id: commentId,
        title: "New Comment from Your Financial Advisor",
        message: commentText,
        type: "comment",
        read: false,
      })
      .select()
      .single()

    if (notifError) {
      console.error("[v0] Error creating notification:", notifError)
      return NextResponse.json({ error: "Failed to create notification: " + notifError.message }, { status: 500 })
    }

    console.log("[v0] Notification created successfully:", notification.id)

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      message: "Notification sent to client successfully",
    })
  } catch (error) {
    console.error("[v0] Error in send-comment API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
