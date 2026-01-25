import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import GrowthStrategyForm from "@/components/growth-strategy/growth-strategy-form"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export default async function GrowthStrategyFormPage({
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

  let existingData = null
  let fetchError = null

  if (clientId && clientId !== user.id) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceRoleKey) {
      const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey)
      const result = await serviceClient.from("growth_strategy").select("*").eq("user_id", targetUserId).maybeSingle()

      existingData = result.data
      fetchError = result.error
      console.log("[v0] Using service role client for advisor/CEO view")
    } else {
      const result = await supabase.from("growth_strategy").select("*").eq("user_id", targetUserId).maybeSingle()

      existingData = result.data
      fetchError = result.error
    }
  } else {
    const result = await supabase.from("growth_strategy").select("*").eq("user_id", targetUserId).maybeSingle()

    existingData = result.data
    fetchError = result.error
  }

  console.log("[v0] ========== GROWTH STRATEGY DATA LOADING ==========")
  console.log("[v0] Target User ID:", targetUserId)
  console.log("[v0] Is viewing as advisor/CEO:", !!clientId)
  console.log("[v0] Data fetch successful:", !fetchError && !!existingData)
  if (fetchError) {
    console.error("[v0] Fetch error:", fetchError)
  }
  console.log("[v0] ===================================================")

  return (
    <GrowthStrategyForm
      initialData={existingData}
      userId={targetUserId}
      isReadOnly={isReadOnly}
      clientId={clientId}
      returnUrl={returnUrl}
    />
  )
}
