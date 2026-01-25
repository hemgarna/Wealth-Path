import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import SavingsVsSpendingForm from "@/components/savings-vs-spending/savings-vs-spending-form"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export default async function SavingsVsSpendingFormPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; readOnly?: string; returnUrl?: string }>
}) {
  const params = await searchParams
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
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
      const result = await serviceClient
        .from("savings_vs_spending")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle()

      existingData = result.data
      fetchError = result.error
      console.log("[v0] Using service role client for advisor/CEO view")
    } else {
      const result = await supabase.from("savings_vs_spending").select("*").eq("user_id", targetUserId).maybeSingle()

      existingData = result.data
      fetchError = result.error
    }
  } else {
    const result = await supabase.from("savings_vs_spending").select("*").eq("user_id", targetUserId).maybeSingle()

    existingData = result.data
    fetchError = result.error
  }

  console.log("[v0] ========== SAVINGS VS SPENDING DATA LOADING ==========")
  console.log("[v0] Target User ID:", targetUserId)
  console.log("[v0] Is viewing as advisor/CEO:", !!clientId)
  console.log("[v0] Data fetch successful:", !fetchError && !!existingData)
  if (fetchError) {
    console.error("[v0] Fetch error:", fetchError)
  }
  console.log("[v0] ========================================================")

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SavingsVsSpendingForm
        initialData={existingData}
        userId={targetUserId}
        isReadOnly={isReadOnly}
        clientId={clientId}
        returnUrl={returnUrl}
      />
    </Suspense>
  )
}
