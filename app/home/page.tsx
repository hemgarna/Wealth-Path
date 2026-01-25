"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import HomeDashboard from "@/components/home/home-dashboard"
import { NotificationPopup } from "@/components/client/notification-popup"

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null)
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createBrowserClient()

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (!user || error) {
          router.push("/auth/login")
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError || !profileData) {
          const { error: upsertError } = await supabase.from("profiles").upsert(
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || "",
              phone_number: user.user_metadata?.phone_number || "",
              role: user.user_metadata?.role || "client",
              onboarding_completed: false,
            },
            {
              onConflict: "id",
            },
          )

          if (upsertError) {
            console.error("[v0] Failed to create/update profile:", upsertError)
          }

          const { data: newProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
          setProfile(newProfile)

          if (newProfile?.role === "advisor" || newProfile?.role === "financial_advisor") {
            router.push("/admin")
            return
          }

          if (newProfile?.role === "ceo") {
            router.push("/ceo")
            return
          }

          if (newProfile?.role === "client" && !newProfile?.onboarding_completed) {
            router.push("/onboarding")
            return
          }
        } else {
          if (profileData.role === "advisor" || profileData.role === "financial_advisor") {
            router.push("/admin")
            return
          }

          if (profileData.role === "ceo") {
            router.push("/ceo")
            return
          }

          if (profileData.role === "client" && !profileData.onboarding_completed) {
            router.push("/onboarding")
            return
          }
          setProfile(profileData)
        }

        const [
          { data: financialGoals },
          { data: growthStrategy },
          { data: defenseStrategy },
          { data: savingsVsSpending },
        ] = await Promise.all([
          supabase.from("financial_goals").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("growth_strategy").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("defense_strategy").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("savings_vs_spending").select("*").eq("user_id", user.id).maybeSingle(),
        ])

        setAssessment({ financialGoals, growthStrategy, defenseStrategy, savingsVsSpending })
      } catch (error) {
        console.error("[v0] Error loading home data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <HomeDashboard profile={profile} assessment={assessment} />
      {profile && <NotificationPopup userId={profile.id} />}
    </>
  )
}
