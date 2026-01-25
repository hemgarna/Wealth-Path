import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formData.get("email") as string

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${request.headers.get("origin")}/home`,
      },
    })

    if (error) {
      console.error("[v0] Error resending confirmation:", error)
      return NextResponse.redirect(
        new URL(`/auth/resend-confirmation?error=${encodeURIComponent(error.message)}`, request.url),
      )
    }

    return NextResponse.redirect(new URL("/auth/sign-up-success", request.url))
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.redirect(new URL("/auth/resend-confirmation?error=An unexpected error occurred", request.url))
  }
}
