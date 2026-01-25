import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is an advisor
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const reportType = formData.get("reportType") as string

    if (!file || !userId || !title || !reportType) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Upload file to Vercel Blob
    const blob = await put(`reports/${userId}/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    // Save report metadata to database
    const { data: report, error: dbError } = await supabase
      .from("client_reports")
      .insert({
        user_id: userId,
        advisor_id: user.id,
        title,
        description,
        report_type: reportType,
        file_url: blob.url,
        file_name: file.name,
        file_size: file.size,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          error: "Failed to save report metadata",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
      },
      { status: 500 },
    )
  }
}
