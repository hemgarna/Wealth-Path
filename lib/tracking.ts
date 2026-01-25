import { createBrowserClient } from "@/lib/supabase/client"

export async function trackEvent(
  eventType: string,
  userId?: string,
  advisorId?: string,
  eventData?: Record<string, any>,
) {
  try {
    if (
      typeof window !== "undefined" &&
      (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    ) {
      // Silently skip tracking if Supabase is not configured (preview mode)
      return
    }

    const supabase = createBrowserClient()

    // Get current user if userId not provided
    let trackUserId = userId
    let trackAdvisorId = advisorId

    if (!trackUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      trackUserId = user?.id

      // Get advisor_id if user is a client
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("advisor_id, role").eq("id", user.id).single()

        if (profile?.role === "client" && profile.advisor_id) {
          trackAdvisorId = profile.advisor_id
        }
      }
    }

    try {
      await fetch("/api/tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType,
          userId: trackUserId,
          advisorId: trackAdvisorId,
          eventData,
        }),
      })
    } catch (insertError) {
      // Silently ignore API errors - tracking is non-essential
    }
  } catch (error) {
    // Silently catch all tracking errors to prevent breaking user experience
  }
}
