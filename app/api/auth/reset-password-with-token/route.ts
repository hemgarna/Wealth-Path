import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    console.log("[v0] Password reset with token API called")
    const { token, password } = await request.json()

    console.log("[v0] Token received:", token ? "yes" : "no")
    console.log("[v0] Password received:", password ? "yes" : "no")

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
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

    console.log("[v0] Verifying token...")

    const { data: resetToken, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle()

    if (tokenError) {
      console.error("[v0] Error fetching token:", tokenError)
      return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
    }

    if (!resetToken) {
      console.log("[v0] Token not found or expired")
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    console.log("[v0] Token is valid for user:", resetToken.user_id)

    // Update the user's password using admin client
    const { error: updateError } = await supabase.auth.admin.updateUserById(resetToken.user_id, {
      password: password,
    })

    if (updateError) {
      console.error("[v0] Error updating password:", updateError)
      return NextResponse.json({ error: "Failed to update password: " + updateError.message }, { status: 500 })
    }

    console.log("[v0] Password updated successfully, marking token as used")

    // Mark token as used
    const { error: markUsedError } = await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("token", token)

    if (markUsedError) {
      console.error("[v0] Error marking token as used:", markUsedError)
    }

    console.log("[v0] Password reset successfully for user:", resetToken.user_id)

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("[v0] Error resetting password:", error)
    return NextResponse.json(
      { error: "Failed to reset password: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    )
  }
}
