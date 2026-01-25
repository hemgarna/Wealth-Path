import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { eventType, userId, advisorId, eventData } = await request.json()

    // Use service role client to bypass RLS
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    await supabase.from("conversion_tracking").insert({
      user_id: userId || null,
      advisor_id: advisorId || null,
      event_type: eventType,
      event_data: eventData || {},
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Silently fail tracking errors
    console.error("[v0] Tracking error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
