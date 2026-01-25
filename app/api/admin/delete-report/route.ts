import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reportId } = await request.json()

    if (!reportId) {
      return NextResponse.json(
        {
          error: "No report ID provided",
        },
        { status: 400 },
      )
    }

    // Get report details from database
    const { data: report, error: fetchError } = await supabase
      .from("client_reports")
      .select("*")
      .eq("id", reportId)
      .single()

    if (fetchError || !report) {
      return NextResponse.json(
        {
          error: "Report not found",
        },
        { status: 404 },
      )
    }

    // Delete from Vercel Blob
    await del(report.file_url)

    // Delete from database
    const { error: deleteError } = await supabase.from("client_reports").delete().eq("id", reportId)

    if (deleteError) {
      return NextResponse.json(
        {
          error: "Failed to delete report",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      {
        error: "Delete failed",
      },
      { status: 500 },
    )
  }
}
