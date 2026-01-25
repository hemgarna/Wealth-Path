import type { SupabaseClient } from "@supabase/supabase-js"

export async function fetchClients(supabase: SupabaseClient, advisorId?: string) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { data: [], error: userError }
    }

    const effectiveAdvisorId = advisorId || user.id

    console.log("[v0] Fetching clients for advisor:", effectiveAdvisorId)

    const { data: clients, error: clientsError } = await supabase
      .from("profiles")
      .select("*")
      .eq("advisor_id", effectiveAdvisorId)
      .eq("role", "client")
      .order("created_at", { ascending: false })

    if (clientsError) {
      console.error("[v0] Error fetching clients:", clientsError)
      return { data: [], error: clientsError }
    }

    console.log("[v0] Found", clients?.length || 0, "clients for advisor:", effectiveAdvisorId)

    const { data: caseStatuses, error: statusError } = await supabase
      .from("case_status")
      .select("*")
      .in(
        "user_id",
        clients.map((c) => c.id),
      )

    if (statusError) {
      console.error("Error fetching case statuses:", statusError)
    }

    // Fetch assessments for each client
    const { data: assessments, error: assessmentsError } = await supabase
      .from("client_assessments")
      .select("*")
      .in(
        "user_id",
        clients.map((c) => c.id),
      )

    if (assessmentsError) {
      console.error("Error fetching assessments:", assessmentsError)
    }

    // Fetch shared cases
    const { data: sharedCases, error: sharedError } = await supabase
      .from("case_sharing")
      .select("*, profiles!case_sharing_shared_with_fkey(id, email, full_name)")
      .or(`shared_by.eq.${effectiveAdvisorId},shared_with.eq.${effectiveAdvisorId}`)

    if (sharedError) {
      console.error("Error fetching shared cases:", sharedError)
    }

    let progressMap: Record<string, { stepsCompleted: number; totalSteps: number }> = {}
    try {
      const progressResponse = await fetch(`/api/advisor/client-progress?advisorId=${effectiveAdvisorId}`)
      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        progressMap = progressData.progress || {}
        console.log("[v0] Fetched progress from API:", progressMap)
      } else {
        console.error("[v0] Failed to fetch progress from API:", progressResponse.status)
      }
    } catch (progressError) {
      console.error("[v0] Error fetching progress from API:", progressError)
    }

    const enrichedClients = clients.map((client) => {
      const caseStatus = caseStatuses?.find((cs) => cs.user_id === client.id)
      const assessment = assessments?.find((a) => a.user_id === client.id)
      const sharedCase = sharedCases?.find((sc) => sc.case_id === client.id)

      const clientProgress = progressMap[client.id] || { stepsCompleted: 0, totalSteps: 5 }
      const stepsCompleted = clientProgress.stepsCompleted
      const totalSteps = clientProgress.totalSteps

      console.log(`[v0] Client ${client.full_name}: ${stepsCompleted}/${totalSteps} steps from API`)

      return {
        id: client.id,
        email: client.email,
        full_name: client.full_name,
        phone: client.phone,
        created_at: client.created_at,
        status: caseStatus?.status || "new",
        admin_notes: caseStatus?.admin_notes,
        last_reviewed_at: caseStatus?.last_reviewed_at,
        case_id: `CASE-${client.id.substring(0, 8).toUpperCase()}`,
        has_assessment: !!assessment,
        assessment_status: assessment?.status,
        annual_income: assessment?.annual_income,
        current_net_worth: assessment?.current_net_worth,
        retirement_age: assessment?.retirement_age,
        assessment_progress: assessment?.progress_percentage,
        shared_with: sharedCase?.shared_with,
        is_shared: !!sharedCase,
        steps_completed: stepsCompleted,
        total_steps: totalSteps,
      }
    })

    return { data: enrichedClients, error: null }
  } catch (error) {
    console.error("Error in fetchClients:", error)
    return { data: [], error: error as Error }
  }
}
