import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let clientInstance: SupabaseClient | null = null

if (typeof window !== "undefined") {
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    try {
      return await originalFetch(...args)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const isAuthError =
        errorMessage.includes("refresh_token_not_found") ||
        errorMessage.includes("Invalid Refresh Token") ||
        errorMessage.includes("Failed to fetch")

      if (!isAuthError) {
        console.error("Fetch error:", errorMessage)
      }

      throw error
    }
  }
}

export function createBrowserClient() {
  if (clientInstance) {
    return clientInstance
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof window !== "undefined" && (window as any).__NEXT_DATA__?.props?.env?.NEXT_PUBLIC_SUPABASE_URL)

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof window !== "undefined" && (window as any).__NEXT_DATA__?.props?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  console.log("[v0] Supabase environment check:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPrefix: supabaseUrl?.substring(0, 20),
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg =
      "Supabase configuration is missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    console.error("[v0]", errorMsg)
    throw new Error(errorMsg)
  }

  try {
    clientInstance = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
    console.log("[v0] Supabase client created successfully")
    return clientInstance
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    throw error
  }
}

export function createClient() {
  return createBrowserClient()
}
