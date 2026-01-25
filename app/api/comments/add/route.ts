import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { caseId, advisorId, commentText } = await request.json()

    console.log("[v0] Add comment API - caseId:", caseId, "advisorId:", advisorId)

    if (!caseId || !advisorId || !commentText) {
      return NextResponse.json(
        { error: "Missing required fields: caseId, advisorId, or commentText" },
        { status: 400 }
      )
    }

    // Use service role to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[v0] Missing Supabase credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Insert the comment
    const { data, error } = await supabase
      .from("expert_comments")
      .insert({
        case_id: caseId,
        advisor_id: advisorId,
        comment_text: commentText,
        version: 1,
        sent_to_client: false,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding comment:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Comment added successfully:", data?.id)
    return NextResponse.json({ success: true, comment: data })
  } catch (err) {
    console.error("[v0] Unexpected error in add comment API:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
