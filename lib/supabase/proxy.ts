import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Middleware running without Supabase (preview mode)")
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()

    // If there's a refresh token error, clear the session cookies
    if (error && error.message?.includes("refresh_token")) {
      console.log("[v0] Refresh token error, clearing session cookies")
      // Clear all Supabase auth cookies
      const cookiesToClear = ["sb-access-token", "sb-refresh-token", "supabase-auth-token"]
      cookiesToClear.forEach((cookieName) => {
        request.cookies.delete(cookieName)
        supabaseResponse.cookies.delete(cookieName)
      })
      user = null
    } else {
      user = data.user
    }
  } catch (error) {
    console.log("[v0] Error getting user in middleware:", error)
    user = null
  }

  if (user) {
    try {
      const { data: profile } = await supabase.from("profiles").select("role, expires_at").eq("id", user.id).single()

      if (profile && profile.role === "advisor" && profile.expires_at) {
        const expirationDate = new Date(profile.expires_at)
        const now = new Date()

        if (now > expirationDate) {
          console.log("[v0] Advisor account has expired")
          // Sign out the user
          await supabase.auth.signOut()
          // Redirect to login with expiration message
          const url = request.nextUrl.clone()
          url.pathname = "/auth/login"
          url.searchParams.set("expired", "true")
          return NextResponse.redirect(url)
        }
      }
    } catch (error) {
      console.log("[v0] Error checking advisor expiration:", error)
    }
  }

  const publicPaths = ["/", "/auth"]
  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path),
  )

  // Allow accept-invitation without redirecting
  if (request.nextUrl.pathname.startsWith("/auth/accept-invitation")) {
    return supabaseResponse
  }

  const protectedPaths = [
    "/home",
    "/questionnaire",
    "/results",
    "/gap-analysis",
    "/dashboard",
    "/financial-goals",
    "/growth-strategy",
    "/defense-strategy",
    "/savings-vs-spending",
    "/final-report",
    "/assessment",
    "/advisor",
    "/admin",
    "/ceo",
    "/onboarding",
    "/notifications",
  ]

  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if ((request.nextUrl.pathname === "/auth/login" || request.nextUrl.pathname === "/auth/sign-up") && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/home"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
