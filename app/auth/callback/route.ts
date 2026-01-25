import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const token_hash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")

  console.log("[v0] Auth callback - code:", !!code, "next:", next, "type:", type)

  if (token_hash && type === "recovery") {
    console.log("[v0] Password recovery detected, redirecting to update-password")
    return NextResponse.redirect(new URL("/auth/update-password", requestUrl.origin))
  }

  if (code) {
    const supabase = await createServerClient()

    console.log("[v0] Exchanging code for session")
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] Error exchanging code:", error.message)
      return NextResponse.redirect(new URL("/auth/login?error=auth_failed", requestUrl.origin))
    }

    console.log("[v0] Session established for user:", data.user?.id)

    if (data.user && next?.includes("update-password")) {
      console.log("[v0] Redirecting to update password page")
      return NextResponse.redirect(new URL("/auth/update-password", requestUrl.origin))
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      if (next) {
        console.log("[v0] Redirecting to custom next URL:", next)
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, role")
        .eq("id", user.id)
        .single()

      console.log("[v0] User profile:", profile?.role, "onboarding:", profile?.onboarding_completed)

      // CEOs and advisors go to their respective dashboards
      if (profile?.role === "ceo") {
        return NextResponse.redirect(new URL("/ceo", requestUrl.origin))
      }

      if (profile?.role === "advisor") {
        return NextResponse.redirect(new URL("/admin", requestUrl.origin))
      }

      // Clients need to complete onboarding first
      if (profile && profile.role === "client" && !profile.onboarding_completed) {
        return NextResponse.redirect(new URL("/onboarding", requestUrl.origin))
      }
    }
  }

  console.log("[v0] No valid auth code, redirecting to home")
  // Redirect to home page after successful authentication
  return NextResponse.redirect(new URL("/home", requestUrl.origin))
}
