import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    const { data: resetToken, error } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle()

    if (error || !resetToken) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid or expired reset token",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      valid: true,
      user_id: resetToken.user_id,
    })
  } catch (error) {
    console.error("[v0] Error verifying reset token:", error)
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
  }
}
