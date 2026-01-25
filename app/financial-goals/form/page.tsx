import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import FinancialGoalsForm from "@/components/financial-goals/financial-goals-form"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export default async function FinancialGoalsFormPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; readOnly?: string; returnUrl?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (!user || error) {
    redirect("/auth/login")
  }

  const clientId = params.clientId
  const isReadOnly = params.readOnly === "true"
  const returnUrl = params.returnUrl
  const targetUserId = clientId || user.id

  console.log("[v0] Financial Goals Form Page - Loading for userId:", targetUserId)
  console.log("[v0] Financial Goals Form Page - clientId:", clientId)
  console.log("[v0] Financial Goals Form Page - isReadOnly:", isReadOnly)
  console.log("[v0] Financial Goals Form Page - Logged in user:", user.id)

  let existingData = null
  let fetchError = null

  if (clientId && clientId !== user.id) {
    // Viewing as advisor/CEO - use service role to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceRoleKey) {
      const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey)
      const result = await serviceClient.from("financial_goals").select("*").eq("user_id", targetUserId).maybeSingle()

      existingData = result.data
      fetchError = result.error
      console.log("[v0] Using service role client for advisor/CEO view")
    } else {
      console.error("[v0] Service role key not available, falling back to regular client")
      const result = await supabase.from("financial_goals").select("*").eq("user_id", targetUserId).maybeSingle()

      existingData = result.data
      fetchError = result.error
    }
  } else {
    // Viewing own data - use regular client
    const result = await supabase.from("financial_goals").select("*").eq("user_id", targetUserId).maybeSingle()

    existingData = result.data
    fetchError = result.error
  }

  console.log("[v0] ========== FINANCIAL GOALS DATA LOADING ==========")
  console.log("[v0] Target User ID:", targetUserId)
  console.log("[v0] Is viewing as advisor/CEO:", !!clientId)
  console.log("[v0] Is read-only mode:", isReadOnly)
  console.log("[v0] Data fetch successful:", !fetchError && !!existingData)
  if (fetchError) {
    console.error("[v0] Fetch error:", fetchError)
  }
  if (existingData) {
    console.log("[v0] Sample critical fields:", {
      user_id: existingData.user_id,
      current_age: existingData.current_age,
      retirement_age: existingData.retirement_age,
      completed: existingData.completed,
    })
  } else {
    console.log("[v0] No data found for user:", targetUserId)
  }
  console.log("[v0] ===================================================")

  return (
    <FinancialGoalsForm
      initialData={existingData}
      userId={targetUserId}
      isReadOnly={isReadOnly}
      clientId={clientId}
      returnUrl={returnUrl}
    />
  )
}
